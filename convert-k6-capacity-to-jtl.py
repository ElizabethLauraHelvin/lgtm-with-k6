#!/usr/bin/env python3
import argparse,csv,json
from datetime import datetime
FIELDS='timeStamp elapsed label responseCode responseMessage threadName dataType success failureMessage bytes sentBytes grpThreads allThreads URL Latency IdleTime Connect'.split()
p=argparse.ArgumentParser();p.add_argument('input');p.add_argument('output');a=p.parse_args();rows=[]
with open(a.input,encoding='utf-8') as f:
 for line in f:
  try:o=json.loads(line)
  except:continue
  if o.get('type')!='Point' or o.get('metric') not in ('http_req_duration','browser_http_req_duration'):continue
  d=o.get('data',{});t=d.get('tags') or {};v=d.get('value')
  if v is None:continue
  status=str(t.get('status','0'))
  try:code=int(status)
  except:code=0
  ok=200<=code<400
  try:stamp=int(datetime.fromisoformat(d['time'].replace('Z','+00:00')).timestamp()*1000)
  except:stamp=0
  url=t.get('url','');elapsed=int(float(v))
  rows.append(dict(timeStamp=stamp,elapsed=elapsed,label=t.get('name') or url or o.get('metric'),responseCode=status,responseMessage='OK' if ok else 'HTTP failure',threadName='k6-vu-'+str(t.get('vu','unknown')),dataType='text',success=str(ok).lower(),failureMessage='' if ok else 'HTTP status '+status,bytes=0,sentBytes=0,grpThreads=0,allThreads=0,URL=url,Latency=elapsed,IdleTime=0,Connect=0))
with open(a.output,'w',newline='',encoding='utf-8') as f:
 w=csv.DictWriter(f,fieldnames=FIELDS);w.writeheader();w.writerows(rows)
print('Wrote',len(rows),'HTTP samples to',a.output)
