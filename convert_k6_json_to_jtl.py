#!/usr/bin/env python3
"""Convert k6 JSON Lines output into a JMeter CSV/JTL file.

Each browser_http_req_duration point (preferred) becomes one JMeter sample.
If no browser points exist, http_req_duration points are used instead.
Only source-supported values are populated; unavailable byte, latency, connect,
thread-count and idle-time fields remain empty rather than being fabricated.
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


def timestamp_ms(value: object) -> int | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        # k6 JSON timestamps are normally ISO-8601 strings. Numeric values,
        # if present, are treated as epoch milliseconds when large enough.
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


def response_message(code: int) -> str:
    try:
        return HTTPStatus(code).phrase
    except ValueError:
        return "" if code == 0 else f"HTTP {code}"


def load_points(path: Path) -> tuple[list[dict], dict[str, int]]:
    points: list[dict] = []
    metric_counts: dict[str, int] = {}
    with path.open("r", encoding="utf-8") as source:
        for line_number, line in enumerate(source, 1):
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
                metric_counts[metric] = metric_counts.get(metric, 0) + 1
                points.append(event)
    return points, metric_counts


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: python3 convert_k6_json_to_jtl.py input.json output.jtl", file=sys.stderr)
        return 2

    source_path, output_path = map(Path, sys.argv[1:])
    if not source_path.is_file():
        print(f"Input file not found: {source_path}", file=sys.stderr)
        return 2

    points, metric_counts = load_points(source_path)
    preferred_exists = any(
        p.get("metric") == PREFERRED_METRIC for p in points
    )
    selected_metric = PREFERRED_METRIC if preferred_exists else FALLBACK_METRIC

    exported = 0
    skipped_missing_fields = 0
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", newline="", encoding="utf-8") as destination:
        writer = csv.DictWriter(destination, fieldnames=COLUMNS, extrasaction="ignore")
        writer.writeheader()

        for event in points:
            if event.get("metric") != selected_metric:
                continue
            data = event.get("data") or {}
            tags = data.get("tags") or {}
            url = str(tags.get("url") or tags.get("name") or "").strip()
            stamp = timestamp_ms(data.get("time"))
            value = data.get("value")
            status_raw = tags.get("status")

            # Without a URL, timestamp, duration, or status, a truthful
            # endpoint sample cannot be represented in JMeter's JTL format.
            if not url or stamp is None or value is None or status_raw in (None, ""):
                skipped_missing_fields += 1
                continue

            try:
                elapsed = max(0, int(round(float(value))))
                status = int(float(status_raw))
            except (TypeError, ValueError):
                skipped_missing_fields += 1
                continue

            success = 200 <= status < 400
            failure = "" if success else (f"HTTP {status}" if status else "Request failed")
            label = str(tags.get("name") or url)

            writer.writerow({
                "timeStamp": stamp,
                "elapsed": elapsed,
                "label": label,
                "responseCode": status,
                "responseMessage": response_message(status),
                "threadName": "K6 Browser (source)",
                "dataType": "text",
                "success": "true" if success else "false",
                "failureMessage": failure,
                "bytes": "",
                "sentBytes": "",
                "grpThreads": "",
                "allThreads": "",
                "URL": url,
                "Latency": "",
                "IdleTime": "",
                "Connect": "",
            })
            exported += 1

    print(f"Input: {source_path}")
    print(f"Selected metric: {selected_metric}")
    print(f"Metric points found: {metric_counts.get(selected_metric, 0)}")
    print(f"JTL samples exported: {exported}")
    print(f"Samples skipped (missing URL/time/duration/status): {skipped_missing_fields}")
    print(f"Output: {output_path}")
    if exported == 0:
        print("::warning::No usable HTTP request samples were found; check k6 raw JSON metric tags.")
    print("Note: bytes, sentBytes, latency, connect time, idle time and active thread counts are left blank because k6 source points do not provide them.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
