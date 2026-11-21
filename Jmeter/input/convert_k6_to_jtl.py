#!/usr/bin/env python3
"""Convert K6 CSV samples to a JMeter-readable JTL CSV.

The source elapsed field is already in milliseconds, but may contain decimals.
JMeter requires integer milliseconds, so this converter rounds to the nearest ms.
Missing source metrics remain blank; no values are fabricated.
Usage: python convert_k6_to_jtl.py results.csv k6-login-results.jtl
"""
import sys
import pandas as pd

if len(sys.argv) != 3:
    raise SystemExit("Usage: python convert_k6_to_jtl.py input.csv output.jtl")

src, dst = sys.argv[1], sys.argv[2]
df = pd.read_csv(src)
required = {"timeStamp", "elapsed", "label", "responseCode", "success", "URL"}
missing = required - set(df.columns)
if missing:
    raise SystemExit(f"Missing required source columns: {', '.join(sorted(missing))}")

columns = [
    "timeStamp", "elapsed", "label", "responseCode", "responseMessage",
    "threadName", "dataType", "success", "failureMessage", "bytes",
    "sentBytes", "grpThreads", "allThreads", "URL", "Latency", "IdleTime",
    "Connect"
]
out = pd.DataFrame(index=df.index)
for col in columns:
    out[col] = df[col] if col in df.columns else ""

out["timeStamp"] = pd.to_numeric(df["timeStamp"], errors="raise").round().astype("int64")
out["elapsed"] = pd.to_numeric(df["elapsed"], errors="raise").round().astype("int64")
out["responseCode"] = df["responseCode"].fillna("").astype(str)
out["success"] = df["success"].map(
    lambda x: "true" if str(x).strip().lower() in ("true", "1") else "false"
)
out["threadName"] = "K6 Browser (source)"
out.to_csv(dst, index=False)

print(f"Converted {len(out)} samples to {dst}")
print("Elapsed values rounded to integer milliseconds for JMeter compatibility.")
print("Missing bytes/latency/connect/active-thread metrics remain blank.")
