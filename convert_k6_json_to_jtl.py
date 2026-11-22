#!/usr/bin/env python3
"""Convert k6 JSON Lines HTTP duration points into JMeter CSV/JTL.

JMeter expects numeric values in several CSV columns. Values not measured by
this k6 metric are written as 0 placeholders, not represented as real metrics.
"""
from __future__ import annotations

import csv
import json
import sys
from datetime import datetime, timezone
from http import HTTPStatus
from pathlib import Path

COLUMNS = [
    "timeStamp", "elapsed", "label", "responseCode", "responseMessage",
    "threadName", "dataType", "success", "failureMessage", "bytes",
    "sentBytes", "grpThreads", "allThreads", "URL", "Latency",
    "IdleTime", "Connect",
]
PREFERRED_METRIC = "browser_http_req_duration"
FALLBACK_METRIC = "http_req_duration"


def timestamp_ms(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        number = float(value)
        return int(round(number if number > 10_000_000_000 else number * 1000))
    text = str(value).strip()
    if not text:
        return None
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return int(round(parsed.timestamp() * 1000))
    except ValueError:
        return None


def response_message(code):
    try:
        return HTTPStatus(code).phrase
    except ValueError:
        return "" if code == 0 else f"HTTP {code}"


def load_points(path):
    points, counts = [], {}
    with path.open("r", encoding="utf-8") as source:
        for line in source:
            line = line.strip()
            if not line:
                continue
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if event.get("type") != "Point":
                continue
            metric = event.get("metric", "")
            if metric in (PREFERRED_METRIC, FALLBACK_METRIC):
                counts[metric] = counts.get(metric, 0) + 1
                points.append(event)
    return points, counts


def main():
    if len(sys.argv) != 3:
        print("Usage: python3 convert_k6_json_to_jtl.py input.json output.jtl", file=sys.stderr)
        return 2

    source_path, output_path = map(Path, sys.argv[1:])
    if not source_path.is_file():
        print(f"Input file not found: {source_path}", file=sys.stderr)
        return 2

    points, counts = load_points(source_path)
    selected = (
        PREFERRED_METRIC
        if any(p.get("metric") == PREFERRED_METRIC for p in points)
        else FALLBACK_METRIC
    )
    exported = skipped = 0
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", newline="", encoding="utf-8") as destination:
        writer = csv.DictWriter(destination, fieldnames=COLUMNS)
        writer.writeheader()

        for event in points:
            if event.get("metric") != selected:
                continue
            data = event.get("data") or {}
            tags = data.get("tags") or {}
            url = str(tags.get("url") or tags.get("name") or "").strip()
            stamp = timestamp_ms(data.get("time"))
            value = data.get("value")
            status_raw = tags.get("status")

            if not url or stamp is None or value is None or status_raw in (None, ""):
                skipped += 1
                continue
            try:
                elapsed = max(0, int(round(float(value))))
                status = int(float(status_raw))
            except (TypeError, ValueError, OverflowError):
                skipped += 1
                continue

            success = 200 <= status < 400
            writer.writerow({
                "timeStamp": stamp,
                "elapsed": elapsed,
                "label": str(tags.get("name") or url),
                "responseCode": status,
                "responseMessage": response_message(status),
                "threadName": str(tags.get("scenario") or "K6 Browser"),
                "dataType": "text",
                "success": "true" if success else "false",
                "failureMessage": "" if success else f"HTTP {status}",
                # Numeric placeholders required by JMeter's CSV parser.
                # They are not measured values from k6.
                "bytes": 0,
                "sentBytes": 0,
                "grpThreads": 0,
                "allThreads": 0,
                "URL": url,
                "Latency": 0,
                "IdleTime": 0,
                "Connect": 0,
            })
            exported += 1

    print(f"Input: {source_path}")
    print(f"Selected metric: {selected}")
    print(f"Metric points found: {counts.get(selected, 0)}")
    print(f"JTL samples exported: {exported}")
    print(f"Samples skipped: {skipped}")
    print(f"Output: {output_path}")
    print("Note: bytes, sentBytes, thread counts, Latency, IdleTime and Connect are 0 placeholders, not measured values.")

    if exported == 0:
        print("::warning::No usable HTTP samples found; inspect k6 JSON metric names and URL/status tags.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
