#!/usr/bin/env python3
"""Generate a self-contained HTML report from k6 JSON-lines output."""
import argparse
import csv
import html
import json
import statistics
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


def percentile(values, p):
    if not values:
        return 0.0
    values = sorted(values)
    pos = (len(values) - 1) * p / 100.0
    lo = int(pos)
    hi = min(lo + 1, len(values) - 1)
    return values[lo] + (values[hi] - values[lo]) * (pos - lo)


def load_json(path):
    if not path or not Path(path).is_file():
        return {}
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def esc(value):
    return html.escape(str(value))


parser = argparse.ArgumentParser()
parser.add_argument("input")
parser.add_argument("output")
parser.add_argument("--max-p95-ms", type=float, default=500)
parser.add_argument("--max-error-rate", type=float, default=1.0)
parser.add_argument("--title", default="K6 Performance Report")
parser.add_argument("--test-type", default="unknown")
parser.add_argument("--summary-file")
parser.add_argument("--metadata-file")
parser.add_argument("--recovery-file")
parser.add_argument("--memory-file")
args = parser.parse_args()

# Endpoint/metric aggregation. VU grouping is only shown when a VU-level tag
# is actually present in the raw sample; the report never fabricates a VU value.
duration = defaultdict(list)
failed = defaultdict(int)
samples = defaultdict(int)
by_vu = defaultdict(lambda: defaultdict(list))
errors_by_vu = defaultdict(lambda: defaultdict(int))
vu_tag_seen = False
metric_totals = defaultdict(list)

with open(args.input, encoding="utf-8") as stream:
    for line in stream:
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        if obj.get("type") != "Point":
            continue
        data = obj.get("data") or {}
        tags = data.get("tags") or {}
        metric = obj.get("metric", "")
        value = data.get("value")
        if value is None:
            continue

        endpoint = (
            tags.get("endpoint") or tags.get("name") or
            tags.get("url") or tags.get("route") or
            ("browser journey" if metric.startswith("browser_") else "HTTP request")
        )
        endpoint = str(endpoint)
        try:
            numeric = float(value)
        except (TypeError, ValueError):
            continue

        if metric in ("http_req_duration", "browser_http_req_duration"):
            duration[endpoint].append(numeric)
            metric_totals[metric].append(numeric)
            samples[endpoint] += 1
            raw_vu = tags.get("vus_level", tags.get("vu_level"))
            if raw_vu is None:
                # Some custom scripts attach vus as a tag; accept only explicit tags.
                raw_vu = tags.get("vus")
            if raw_vu is not None:
                try:
                    vu = int(float(raw_vu))
                    vu_tag_seen = True
                    by_vu[endpoint][vu].append(numeric)
                except (TypeError, ValueError):
                    pass

        elif metric in ("http_req_failed", "browser_http_req_failed"):
            if bool(value):
                failed[endpoint] += 1
                raw_vu = tags.get("vus_level", tags.get("vu_level", tags.get("vus")))
                if raw_vu is not None:
                    try:
                        errors_by_vu[endpoint][int(float(raw_vu))] += 1
                    except (TypeError, ValueError):
                        pass

summary = load_json(args.summary_file)
metadata = load_json(args.metadata_file)
recovery = load_json(args.recovery_file)

endpoint_rows = []
for endpoint in sorted(duration):
    values = duration[endpoint]
    avg = statistics.mean(values)
    p90 = percentile(values, 90)
    p95 = percentile(values, 95)
    p99 = percentile(values, 99)
    count = len(values)
    err_count = failed[endpoint]
    # http_req_failed points are only a complete denominator if emitted for all requests.
    err_rate = (err_count / count * 100) if count else 0.0
    status = "PASS" if p95 <= args.max_p95_ms and err_rate <= args.max_error_rate else "FAIL"
    endpoint_rows.append(
        f"<tr><td>{esc(endpoint)}</td><td>{count}</td><td>{avg:.2f}</td>"
        f"<td>{p90:.2f}</td><td>{p95:.2f}</td><td>{p99:.2f}</td>"
        f"<td>{err_count}</td><td>{err_rate:.2f}%</td>"
        f"<td class='{status.lower()}'>{status}</td></tr>"
    )

vu_sections = []
if vu_tag_seen:
    for endpoint in sorted(by_vu):
        rows = []
        passing = []
        for vu in sorted(by_vu[endpoint]):
            values = by_vu[endpoint][vu]
            p95 = percentile(values, 95)
            avg = statistics.mean(values)
            err_count = errors_by_vu[endpoint][vu]
            err_rate = err_count / len(values) * 100 if values else 0
            passed = p95 <= args.max_p95_ms and err_rate <= args.max_error_rate
            if passed:
                passing.append(vu)
            status = "PASS" if passed else "FAIL"
            rows.append(
                f"<tr><td>{vu}</td><td>{len(values)}</td><td>{avg:.2f}</td>"
                f"<td>{p95:.2f}</td><td>{err_count}</td><td>{err_rate:.2f}%</td>"
                f"<td class='{status.lower()}'>{status}</td></tr>"
            )
        highest = max(passing) if passing else "None"
        vu_sections.append(
            f"<section><h2>VU-level breakdown: {esc(endpoint)}</h2>"
            f"<p><b>Highest observed passing VU tag:</b> {esc(highest)}</p>"
            "<table><thead><tr><th>VU tag</th><th>Samples</th><th>Average ms</th>"
            "<th>P95 ms</th><th>Failed</th><th>Error rate</th><th>Status</th>"
            f"</tr></thead><tbody>{''.join(rows)}</tbody></table></section>"
        )

mem_rows = []
if args.memory_file and Path(args.memory_file).is_file():
    try:
        with open(args.memory_file, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                mem_rows.append(row)
    except OSError:
        pass

summary_metrics = summary.get("metrics", {}) if isinstance(summary, dict) else {}
def summary_value(name, field="value"):
    item = summary_metrics.get(name, {})
    return item.get(field) if isinstance(item, dict) else None

total_samples = sum(len(v) for v in duration.values())
all_values = [x for vals in duration.values() for x in vals]
overall_avg = statistics.mean(all_values) if all_values else 0
overall_p95 = percentile(all_values, 95) if all_values else 0
overall_failed = sum(failed.values())
overall_error = overall_failed / total_samples * 100 if total_samples else 0

recovery_text = "Not measured"
if recovery:
    if recovery.get("recovered"):
        recovery_text = f"{recovery.get('recovery_duration_ms', 'N/A')} ms"
    else:
        recovery_text = "Not recovered within configured timeout"

ram_text = "Not collected"
if mem_rows:
    vals = []
    for row in mem_rows:
        try:
            vals.append(float(row.get("mem_available_mb", "")))
        except (TypeError, ValueError):
            pass
    if vals:
        ram_text = f"Minimum available RAM observed: {min(vals):.0f} MB"

metadata_items = []
for key, label in (
    ("test_type", "Test type"), ("target_url", "Target URL"),
    ("started_at", "Started"), ("finished_at", "Finished"),
    ("max_vus", "Configured max VUs"), ("stage_duration", "Stage duration"),
    ("run_number", "GitHub run")
):
    if metadata.get(key) not in (None, ""):
        metadata_items.append(f"<li><b>{esc(label)}:</b> {esc(metadata[key])}</li>")

note_vu = (
    "VU tags were present in the raw samples; the VU breakdown below is based on those tags."
    if vu_tag_seen else
    "The raw samples do not contain a VU-level tag. Therefore this report does not claim a maximum passing VU. Use the K6 scenario/stage configuration and time-series VU metrics for capacity conclusions."
)
if not endpoint_rows:
    endpoint_rows = ["<tr><td colspan='9'>No HTTP/browser duration samples found in the K6 raw JSON.</td></tr>"]

doc = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(args.title)}</title>
<style>
:root{{--bg:#f3f6fa;--card:#fff;--ink:#172b4d;--muted:#5e6c84;--line:#dfe5ec;--blue:#1769aa;}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 Arial,sans-serif}}
main{{max-width:1280px;margin:28px auto;padding:0 18px}}h1{{margin:0 0 6px;color:var(--blue)}}
h2{{font-size:18px;margin:0 0 12px}}.muted{{color:var(--muted)}}.hero,section{{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:20px;margin:16px 0;box-shadow:0 1px 2px #102a430d}}
.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:18px 0}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px}}
.card small{{display:block;color:var(--muted)}}.value{{font-size:26px;font-weight:700;margin-top:4px}}
table{{border-collapse:collapse;width:100%;margin-top:12px;display:block;overflow-x:auto;white-space:nowrap}}
th,td{{border:1px solid var(--line);padding:9px 11px;text-align:left}}th{{background:#eaf1f8}}
.pass{{color:#137333;font-weight:700}}.fail{{color:#b42318;font-weight:700}}
.note{{background:#fff8e6;border-left:4px solid #d99b18;padding:12px;color:#57420c}}
ul{{padding-left:20px}}footer{{color:var(--muted);font-size:12px;margin:24px 0}}
</style></head><body><main>
<div class="hero"><h1>{esc(args.title)}</h1>
<p class="muted">Generated {datetime.now(timezone.utc).isoformat()} · Source: K6 JSON Lines</p>
<ul>{''.join(metadata_items) or '<li>Run metadata unavailable</li>'}</ul>
<p><b>Evaluation criteria:</b> P95 ≤ {args.max_p95_ms:g} ms; HTTP error rate ≤ {args.max_error_rate:g}% (where error samples are available).</p>
</div>
<div class="cards">
<div class="card"><small>Total duration samples</small><div class="value">{total_samples}</div></div>
<div class="card"><small>Average response time</small><div class="value">{overall_avg:.2f} ms</div></div>
<div class="card"><small>Overall P95</small><div class="value">{overall_p95:.2f} ms</div></div>
<div class="card"><small>Recorded HTTP failures</small><div class="value">{overall_failed}</div></div>
<div class="card"><small>Recorded error rate</small><div class="value">{overall_error:.2f}%</div></div>
<div class="card"><small>Recovery</small><div class="value" style="font-size:18px">{esc(recovery_text)}</div></div>
</div>
<section><h2>Endpoint / Request Performance</h2>
<p class="muted">Response-time statistics are calculated from duration samples in the raw K6 output.</p>
<table><thead><tr><th>Endpoint / label</th><th>Samples</th><th>Average ms</th><th>P90 ms</th><th>P95 ms</th><th>P99 ms</th><th>Failed samples</th><th>Error rate*</th><th>Assessment</th></tr></thead>
<tbody>{''.join(endpoint_rows)}</tbody></table>
<p class="muted">*The error-rate calculation is meaningful only when the raw file contains corresponding http_req_failed or browser_http_req_failed samples with matching endpoint tags.</p>
</section>
{''.join(vu_sections)}
<section><h2>Capacity interpretation</h2>
<div class="note">{esc(note_vu)}</div>
<p>{esc(ram_text)}</p>
<p>Highest passing VU is not inferred from response-time samples unless explicit VU-level tags are present. A maximum capacity claim should be supported by stage-level success/error thresholds and host/database monitoring.</p>
</section>
<section><h2>Methodology and limitations</h2>
<ul>
<li>HTTP duration metrics and browser duration metrics are reported separately when their endpoint tags distinguish them.</li>
<li>Browser journey success is a business-transaction metric and is not equivalent to HTTP request success.</li>
<li>APDEX is not calculated by this report; use a correctly populated JTL/JMeter report for APDEX.</li>
<li>POST /api/orders may create persistent test orders when enabled. Use a dedicated test account and controlled test data.</li>
<li>Host memory is summarized only when host-memory.csv is available. CPU and database metrics require separate monitoring input.</li>
</ul></section>
<footer>Generated from supplied K6 raw output. Do not interpret missing metrics as zero failures.</footer>
</main></body></html>"""

Path(args.output).write_text(doc, encoding="utf-8")
print(f"Generated {args.output}")
