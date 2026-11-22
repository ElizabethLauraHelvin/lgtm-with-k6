#!/usr/bin/env python3
"""Sample host and optional ecommerce pod resources while K6 is running."""
import argparse, csv, datetime, os, shutil, subprocess, time

p=argparse.ArgumentParser(); p.add_argument('--output',default='k6-browser-results/resource-monitor.csv'); p.add_argument('--interval',type=float,default=2.0); args=p.parse_args()
os.makedirs(os.path.dirname(args.output) or '.',exist_ok=True)

def read_cpu():
    with open('/proc/stat') as f: parts=list(map(int,f.readline().split()[1:]))
    idle=parts[3]+(parts[4] if len(parts)>4 else 0); total=sum(parts); return total,idle

def read_disk():
    total=read=write=0
    try:
      for line in open('/proc/diskstats'):
        x=line.split(); name=x[2]
        if name.startswith(('loop','ram','fd')) or __import__('re').match(r'^(sd[a-z]|vd[a-z])\d+$|^(nvme\d+n\d+p\d+|mmcblk\d+p\d+)$', name): continue
        if name.startswith(('sd','vd','xvd','nvme','mmcblk')):
          read += int(x[5])*512; write += int(x[9])*512
    except Exception: pass
    return read,write

def read_net():
    rx=tx=0
    for line in open('/proc/net/dev').readlines()[2:]:
      name, data=line.split(':',1); name=name.strip()
      if name=='lo': continue
      a=data.split(); rx+=int(a[0]); tx+=int(a[8])
    return rx,tx

def pod_metrics():
    out={'backend_cpu_cores':'','backend_memory_mb':'','frontend_cpu_cores':'','frontend_memory_mb':''}
    try:
      r=subprocess.run(['kubectl','top','pods','-n','ecommerce','--no-headers'],capture_output=True,text=True,timeout=3)
      if r.returncode: return out
      for line in r.stdout.splitlines():
        cols=line.split();
        if len(cols)<3: continue
        name,cpu,mem=cols[0],cols[1],cols[2]
        def cpuval(v): return float(v[:-1])/1000 if v.endswith('m') else float(v)
        def memval(v):
          for suffix,mult in [('Ki',1/1024),('Mi',1),('Gi',1024),('K',1/1024),('M',1),('G',1024)]:
            if v.endswith(suffix): return float(v[:-len(suffix)])*mult
          return float(v)
        if name.startswith('backend-'): out['backend_cpu_cores']=cpuval(cpu);out['backend_memory_mb']=memval(mem)
        elif name.startswith('frontend-'): out['frontend_cpu_cores']=cpuval(cpu);out['frontend_memory_mb']=memval(mem)
    except Exception: pass
    return out

fields=['timestamp','cpu_percent','memory_used_mb','memory_available_mb','memory_percent','disk_used_percent','disk_read_kbps','disk_write_kbps','network_rx_kbps','network_tx_kbps','backend_cpu_cores','backend_memory_mb','frontend_cpu_cores','frontend_memory_mb']
with open(args.output,'w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields);w.writeheader(); prev_cpu=read_cpu();prev_disk=read_disk();prev_net=read_net();prev_t=time.monotonic()
  while True:
    time.sleep(args.interval); now=time.monotonic(); dt=max(now-prev_t,.001); cur_cpu=read_cpu();cur_disk=read_disk();cur_net=read_net()
    total=cur_cpu[0]-prev_cpu[0]; idle=cur_cpu[1]-prev_cpu[1]; cpu=max(0,min(100,100*(total-idle)/total)) if total else 0
    mem={x.split(':')[0]:int(x.split()[1]) for x in open('/proc/meminfo') if x.startswith(('MemTotal:','MemAvailable:'))}
    total_mb=mem.get('MemTotal',0)/1024; avail_mb=mem.get('MemAvailable',0)/1024; used_mb=total_mb-avail_mb
    du=shutil.disk_usage('/'); disk_pct=100*du.used/du.total if du.total else 0
    nr,nt=cur_net[0]-prev_net[0],cur_net[1]-prev_net[1]; dr,dw=cur_disk[0]-prev_disk[0],cur_disk[1]-prev_disk[1]
    row={'timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'cpu_percent':round(cpu,2),'memory_used_mb':round(used_mb,2),'memory_available_mb':round(avail_mb,2),'memory_percent':round(100*used_mb/total_mb,2) if total_mb else '', 'disk_used_percent':round(disk_pct,2),'disk_read_kbps':round(dr/1024/dt,2),'disk_write_kbps':round(dw/1024/dt,2),'network_rx_kbps':round(nr/1024/dt,2),'network_tx_kbps':round(nt/1024/dt,2)}
    row.update(pod_metrics());w.writerow(row);f.flush();prev_cpu,prev_disk,prev_net,prev_t=cur_cpu,cur_disk,cur_net,now
