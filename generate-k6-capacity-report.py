#!/usr/bin/env python3
import argparse,json,statistics,html
from collections import defaultdict
from datetime import datetime,timezone
def pct(a,p):
 if not a:return 0
 x=sorted(a);q=(len(x)-1)*p/100;i=int(q);j=min(i+1,len(x)-1)
 return x[i]+(x[j]-x[i])*(q-i)
ap=argparse.ArgumentParser();ap.add_argument('input');ap.add_argument('output');ap.add_argument('--max-p95-ms',type=float,default=500);ap.add_argument('--max-error-rate',type=float,default=1.0);args=ap.parse_args()
dur=defaultdict(lambda:defaultdict(list));failed=defaultdict(lambda:defaultdict(int))
with open(args.input,encoding='utf-8') as f:
 for line in f:
  try:o=json.loads(line)
  except:continue
  if o.get('type')!='Point':continue
  d=o.get('data',{});t=d.get('tags') or {};m=o.get('metric','');v=d.get('value')
  if v is None:continue
  ep=t.get('endpoint') or t.get('name') or t.get('url') or 'http'
  try:vu=int(float(t.get('vus_level',t.get('vus',0)) or 0))
  except:vu=0
  if m in ('http_req_duration','browser_http_req_duration'):dur[ep][vu].append(float(v))
  elif m in ('http_req_failed','browser_http_req_failed'):failed[ep][vu]+=int(bool(v))
def esc(x):return html.escape(str(x))
sections=[]
for ep,levels in sorted(dur.items()):
 rows=[];passing=[]
 for vu,vals in sorted(levels.items()):
  avg=statistics.mean(vals);p95=pct(vals,95)
  err=failed[ep][vu]/len(vals)*100 if vu in failed[ep] else None
  ok=p95<args.max_p95_ms and (err is None or err<=args.max_error_rate)
  if ok:passing.append(vu)
  errtxt='N/A' if err is None else f'{err:.2f}%'
  cls='pass' if ok else 'fail';status='PASS*' if ok else 'FAIL'
  rows.append(f'<tr><td>{vu}</td><td>{len(vals)}</td><td>{avg:.1f}</td><td>{p95:.1f}</td><td>{errtxt}</td><td class="{cls}">{status}</td></tr>')
 sections.append(f'<section><h2>{esc(ep)}</h2><p><b>Highest observed passing VU level:</b> {max(passing) if passing else 0}</p><table><tr><th>Active VU</th><th>Samples</th><th>Average ms</th><th>P95 ms</th><th>HTTP errors</th><th>Status</th></tr>{"".join(rows)}</table></section>')
if not sections:sections=['<section>No HTTP duration data found. Check K6 JSON output.</section>']
doc='''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>K6 API Capacity Report</title><style>body{font:15px Arial;margin:28px;background:#f4f6f8;color:#18212b}main{max-width:1100px;margin:auto}section,.intro{background:white;padding:20px;margin:16px 0;border:1px solid #d8e0e8;border-radius:8px}h1{color:#185889}table{border-collapse:collapse;width:100%;margin-top:12px}th,td{border:1px solid #dce2e8;padding:9px;text-align:left}th{background:#e6eff8}.pass{color:#167342;font-weight:bold}.fail{color:#b42318;font-weight:bold}.note{color:#526170;font-size:13px;line-height:1.5}</style></head><body><main><h1>K6 API Capacity Report</h1><div class="intro"><p><b>Generated:</b> '''+datetime.now(timezone.utc).isoformat()+'''</p><p><b>Criteria:</b> P95 &lt; '''+str(args.max_p95_ms)+''' ms; HTTP error rate ≤ '''+str(args.max_error_rate)+'''% where samples are available.</p><p class="note">PASS* means latency passed; it is not a full capacity certification if endpoint-level HTTP error samples are unavailable.</p></div>'''+''.join(sections)+'''<section class="note"><b>Interpretation</b><p>Highest observed passing VU is a result of this run, not a universal maximum. Repeat tests and verify server CPU, RAM, database, and application logs.</p><p>POST /api/orders is disabled by default. Set INCLUDE_ORDER_WRITE=true only with a dedicated test account/database; each successful iteration creates a real order.</p></section></main></body></html>'''
with open(args.output,'w',encoding='utf-8') as f:f.write(doc)
print('Generated',args.output)
