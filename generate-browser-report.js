const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || 'k6-browser-results';
const readJson = (file) => { try { return JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')); } catch { return {}; } };
const firstExisting = (names) => names.find((f) => fs.existsSync(path.join(dir, f)));
const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
const summaryFile = firstExisting(files.filter((f) => /summary.*\.json$|capacity-summary\.json$/i.test(f))) || 'capacity-summary.json';
const rawFile = firstExisting(files.filter((f) => /raw.*\.json$|k6.*\.json$/i.test(f) && !/summary|metadata|recovery/i.test(f)));
const metaFile = firstExisting(files.filter((f) => /run-metadata\.json|metadata\.json/i.test(f))) || 'run-metadata.json';
const recoveryFile = firstExisting(files.filter((f) => /recovery\.json/i.test(f)));
const summary = readJson(summaryFile);
const meta = readJson(metaFile);
const recovery = recoveryFile ? readJson(recoveryFile) : {};
const metrics = summary.metrics || {};
const esc = (v) => String(v ?? 'N/A').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
const metricValues = (name) => metrics[name]?.values || metrics[name] || {};
const pick = (name, ...keys) => { const v = metricValues(name); for (const k of keys) if (v[k] !== undefined && v[k] !== null) return v[k]; return null; };
const fmt = (v, suffix = '', d = 2) => num(v) === null ? 'N/A' : `${Number(v).toFixed(d)}${suffix}`;
const percentile = (a, p) => { if (!a.length) return null; const s = [...a].sort((x,y)=>x-y); const i=(s.length-1)*p; const lo=Math.floor(i), hi=Math.ceil(i); return s[lo]+(s[hi]-s[lo])*(i-lo); };

// Read newline-delimited K6 JSON output and retain timestamped samples.
const rawSamples = [];
if (rawFile) {
  const content = fs.readFileSync(path.join(dir, rawFile), 'utf8');
  for (const line of content.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const e = JSON.parse(line);
      if (e.type === 'Point' && e.data && e.metric) rawSamples.push(e);
    } catch {}
  }
}
const requestSamples = rawSamples.filter(e => /^(browser_)?http_req_duration$/.test(e.metric));
const endpointMap = new Map();
for (const e of requestSamples) {
  const tags = e.data.tags || {};
  const key = tags.url || tags.name || tags.endpoint || '(URL tag unavailable)';
  if (!endpointMap.has(key)) endpointMap.set(key, []);
  endpointMap.get(key).push({v:Number(e.data.value), failed:String(tags.status || '').startsWith('4') || String(tags.status || '').startsWith('5') || tags.error ? 1 : 0, status:tags.status || ''});
}
const endpointRows = [...endpointMap.entries()].map(([url, a]) => {
  const v=a.map(x=>x.v).filter(Number.isFinite); const fail=a.filter(x=>x.failed).length;
  return {url,count:a.length,fail,rate:a.length?fail/a.length*100:0,avg:v.length?v.reduce((x,y)=>x+y,0)/v.length:null,min:v.length?Math.min(...v):null,max:v.length?Math.max(...v):null,med:percentile(v,.5),p90:percentile(v,.9),p95:percentile(v,.95),p99:percentile(v,.99)};
});


// Individual API capacity: aggregate custom api_duration_ms and api_success
// samples by endpoint and the active VU count tagged by the test script.
const apiDurationSamples = rawSamples.filter(e => e.metric === 'api_duration_ms');
const apiSuccessSamples = rawSamples.filter(e => e.metric === 'api_success');
const apiGroups = new Map();
for (const e of apiDurationSamples) {
  const tags = e.data.tags || {};
  const endpoint = tags.endpoint || 'unknown';
  const vu = Number(tags.vus_level);
  if (!Number.isFinite(vu) || vu < 1) continue;
  const key = `${endpoint}::${vu}`;
  if (!apiGroups.has(key)) apiGroups.set(key, {endpoint, vu, durations:[], successes:[]});
  apiGroups.get(key).durations.push(Number(e.data.value));
}
for (const e of apiSuccessSamples) {
  const tags = e.data.tags || {};
  const endpoint = tags.endpoint || 'unknown';
  const vu = Number(tags.vus_level);
  if (!Number.isFinite(vu) || vu < 1) continue;
  const key = `${endpoint}::${vu}`;
  if (!apiGroups.has(key)) apiGroups.set(key, {endpoint, vu, durations:[], successes:[]});
  apiGroups.get(key).successes.push(Number(e.data.value) > 0);
}
const apiRows = [...apiGroups.values()].map(g => {
  const p95 = percentile(g.durations.filter(Number.isFinite), .95);
  const count = g.successes.length;
  const failures = g.successes.filter(x => !x).length;
  const errorRate = count ? failures / count * 100 : null;
  const maxErrorPct = Number(meta.max_error_rate_pct ?? 1);
  const maxP95 = Number(meta.max_p95_ms ?? 500);
  const pass = p95 !== null && errorRate !== null && p95 <= maxP95 && errorRate <= maxErrorPct;
  return {...g, p95, samples:g.durations.length, failures, errorRate, pass};
}).sort((a,b)=>a.endpoint.localeCompare(b.endpoint)||a.vu-b.vu);
const apiEndpoints = [...new Set(apiRows.map(x=>x.endpoint))];
const apiCapacitySummary = apiEndpoints.map(endpoint => {
  const rows = apiRows.filter(x=>x.endpoint===endpoint);
  const passed = rows.filter(x=>x.pass);
  const failed = rows.filter(x=>!x.pass);
  return {
    endpoint,
    highestObservedVu: rows.length ? Math.max(...rows.map(x=>x.vu)) : null,
    maxPassingVu: passed.length ? Math.max(...passed.map(x=>x.vu)) : null,
    firstFailingVu: failed.length ? Math.min(...failed.map(x=>x.vu)) : null,
    rows
  };
});
const apiVuRowsHtml = apiRows.length ? apiRows.map(r =>
  `<tr><td>${esc(r.endpoint)}</td><td>${r.vu}</td><td>${r.samples}</td><td>${fmt(r.p95,' ms')}</td><td>${r.successes.length}</td><td>${r.failures}</td><td>${fmt(r.errorRate,'%')}</td><td class="${r.pass?'good':'warn'}">${r.pass?'PASS':'FAIL'}</td></tr>`
).join('') : `<tr><td colspan="8">Belum ada api_duration_ms/api_success samples dengan tag endpoint dan vus_level. Periksa raw K6 JSON.</td></tr>`;
const apiSummaryRowsHtml = apiCapacitySummary.length ? apiCapacitySummary.map(r =>
  `<tr><td>${esc(r.endpoint)}</td><td>${r.highestObservedVu ?? 'N/A'}</td><td>${r.maxPassingVu ?? 'None'}</td><td>${r.firstFailingVu ?? 'Not observed'}</td><td>${r.rows.length}</td></tr>`
).join('') : `<tr><td colspan="5">Tidak ada data kapasitas API. Pilih test_type individual-api-capacity.</td></tr>`;
const apiChartLabels = [...new Set(apiRows.map(x=>x.vu))].sort((a,b)=>a-b);
const apiP95Datasets = apiEndpoints.map(endpoint => ({
  label:endpoint,
  data:apiChartLabels.map(vu=>{const row=apiRows.find(x=>x.endpoint===endpoint&&x.vu===vu);return row?row.p95:null;}),
  spanGaps:false, borderWidth:2
}));
const apiErrorDatasets = apiEndpoints.map(endpoint => ({
  label:endpoint,
  data:apiChartLabels.map(vu=>{const row=apiRows.find(x=>x.endpoint===endpoint&&x.vu===vu);return row?row.errorRate:null;}),
  spanGaps:false, borderWidth:2
}));
const ordersWriteEnabled = String(meta.include_order_write || 'false') === 'true';
const apiNote = ordersWriteEnabled
  ? 'POST /api/orders aktif dan dapat membuat order sungguhan.'
  : 'POST /api/orders tidak dijalankan karena Include Order Write = false.';

// Build 10-second response-time buckets from raw K6 samples.
const responseSeries = [];
if (requestSamples.length) {
  const t0=Math.min(...requestSamples.map(e=>Date.parse(e.data.time)).filter(Number.isFinite));
  const buckets=new Map();
  for(const e of requestSamples){const t=Date.parse(e.data.time); if(!Number.isFinite(t)||!Number.isFinite(Number(e.data.value)))continue; const b=Math.floor((t-t0)/10000); if(!buckets.has(b))buckets.set(b,[]); buckets.get(b).push(Number(e.data.value));}
  for(const [b,a] of [...buckets.entries()].sort((x,y)=>x[0]-y[0])) responseSeries.push({time:`${b*10}s`,avg:a.reduce((x,y)=>x+y,0)/a.length,p95:percentile(a,.95)});
}

// Resource CSV contract: timestamp,cpu_percent,memory_used_mb,memory_available_mb,memory_percent,disk_used_percent,disk_read_kbps,disk_write_kbps,network_rx_kbps,network_tx_kbps,backend_cpu_cores,backend_memory_mb,frontend_cpu_cores,frontend_memory_mb
const resourceFile = firstExisting(files.filter(f=>/resource.*\.csv$/i.test(f)));
const parseCsvLine = (line) => { const out=[]; let cur='',q=false; for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}else if(c===','&&!q){out.push(cur);cur='';}else cur+=c;}out.push(cur);return out;};
let resource=[];
if(resourceFile){const lines=fs.readFileSync(path.join(dir,resourceFile),'utf8').trim().split(/\r?\n/);if(lines.length>1){const h=parseCsvLine(lines[0]);resource=lines.slice(1).map(l=>{const a=parseCsvLine(l),o={};h.forEach((k,i)=>o[k]=a[i]);return o;});}}
const rSeries=(key)=>resource.map((r,i)=>({time:r.timestamp || `${i}`,value:num(r[key])})).filter(x=>x.value!==null);
const hasResource=resource.length>0;

const getMetric = (...names) => { for(const name of names) if(metrics[name]) return metricValues(name); return {}; };
const reqCount = requestSamples.length || pick('http_reqs','count') || 0;
const failedReq = pick('browser_http_req_failed','fails') ?? pick('http_req_failed','fails') ?? 0;
const apdexT = Number(meta.apdex_t_ms || 500);
const apdexF = Number(meta.apdex_f_ms || 1500);
const apdexCounts = requestSamples.reduce((a,e)=>{const v=Number(e.data.value);if(v<=apdexT)a.s++;else if(v<=apdexF)a.t++;else a.f++;return a;},{s:0,t:0,f:0});
const apdexScore = requestSamples.length ? (apdexCounts.s + apdexCounts.t/2)/requestSamples.length : null;
const requestPassCount = requestSamples.length ? requestSamples.filter(e=>{const t=e.data.tags||{};const st=Number(t.status||0);return !(t.error || st>=400);}).length : null;
const reqRate = pick('http_reqs','rate');
const journey = getMetric('journey_duration_ms');
const success = pick('journey_success','rate');
const durationMs = num(meta.finished_at_ms)!==null && num(meta.started_at_ms)!==null ? num(meta.finished_at_ms)-num(meta.started_at_ms) : null;
const testType = meta.test_type || meta.scenario || 'K6 Browser';
const status = meta.k6_exit_code === 0 || meta.k6_exit_code === '0' ? 'Completed' : (meta.k6_exit_code == null ? 'Status unavailable' : 'Failed / Aborted');
const errors = (()=>{try{return fs.readFileSync(path.join(dir,'k6-console.log'),'utf8').split(/\r?\n/).filter(x=>/error|failed|timeout|HTTP [45]\d\d/i.test(x)).slice(0,40);}catch{return[];}})();
const cards=[['Test status',status],['Scenario',testType],['Total HTTP samples',reqCount],['Failed HTTP requests',failedReq],['Journey success',success==null?'N/A':fmt(success*100,'%')],['Maximum VUs',pick('vus_max','max')??meta.max_vus??'N/A'],['Test duration',durationMs==null?'N/A':fmt(durationMs/1000,' s')],['HTTP throughput',reqRate==null?'N/A':fmt(reqRate,' req/s')],['APDEX',apdexScore==null?'N/A':fmt(apdexScore,'',3)]];
const chart = (id,title,labels,datasets,yTitle='') => `<section class="panel"><h2>${title}</h2><div class="chart-wrap"><canvas id="${id}"></canvas></div></section>`;
const endpointHtml=endpointRows.length?endpointRows.map(r=>`<tr><td>${esc(r.url)}</td><td>${r.count}</td><td>${r.fail}</td><td>${fmt(r.rate,'%')}</td><td>${fmt(r.avg,' ms')}</td><td>${fmt(r.min,' ms')}</td><td>${fmt(r.max,' ms')}</td><td>${fmt(r.med,' ms')}</td><td>${fmt(r.p90,' ms')}</td><td>${fmt(r.p95,' ms')}</td><td>${fmt(r.p99,' ms')}</td></tr>`).join(''):'<tr><td colspan="11">Raw K6 JSON belum berisi browser_http_req_duration/http_req_duration dengan URL tags. Statistik endpoint tidak dapat dihitung dari data ini.</td></tr>';
const resourceKeys=[['CPU utilization','cpu_percent','%'],['Memory used','memory_used_mb','MB'],['Memory available','memory_available_mb','MB'],['Disk used','disk_used_percent','%'],['Disk read','disk_read_kbps','KB/s'],['Disk write','disk_write_kbps','KB/s'],['Network received','network_rx_kbps','KB/s'],['Network transmitted','network_tx_kbps','KB/s'],['Backend CPU','backend_cpu_cores','cores'],['Backend memory','backend_memory_mb','MB'],['Frontend CPU','frontend_cpu_cores','cores'],['Frontend memory','frontend_memory_mb','MB']];
const resourceRows=hasResource?resourceKeys.map(([label,key,unit])=>{const a=rSeries(key);if(!a.length)return '';const vals=a.map(x=>x.value);return `<tr><td>${label}</td><td>${fmt(vals[vals.length-1],` ${unit}`)}</td><td>${fmt(Math.max(...vals),` ${unit}`)}</td><td>${fmt(vals.reduce((x,y)=>x+y,0)/vals.length,` ${unit}`)}</td></tr>`;}).join(''):'<tr><td colspan="4">Resource metrics belum direkam oleh workflow. Aktifkan sampling host/container selama K6 berjalan.</td></tr>';
const resourceChartDefs=hasResource?[['cpuChart','CPU utilization','cpu_percent','%'],['memoryChart','Memory usage','memory_used_mb','MB'],['diskChart','Disk utilization','disk_used_percent','%'],['networkChart','Network I/O (RX/TX)','network_rx_kbps','KB/s']]:[];
const labelsFor=key=>JSON.stringify(resource.map((r,i)=>r.timestamp||`${i}`));
const dataFor=key=>JSON.stringify(resource.map(r=>num(r[key])));
const resourceCharts=resourceChartDefs.map(([id,title,key,unit])=>`<section class="panel"><h2>${title}</h2><div class="chart-wrap"><canvas id="${id}"></canvas></div></section>`).join('');
const resourceScript=resourceChartDefs.map(([id,title,key,unit])=>{if(key==='network_rx_kbps')return `new Chart(document.getElementById('${id}'),{type:'line',data:{labels:${labelsFor(key)},datasets:[{label:'Received (KB/s)',data:${dataFor('network_rx_kbps')},borderWidth:2},{label:'Transmitted (KB/s)',data:${dataFor('network_tx_kbps')},borderWidth:2}]},options:chartOptions('${unit}')});`;return `new Chart(document.getElementById('${id}'),{type:'line',data:{labels:${labelsFor(key)},datasets:[{label:${JSON.stringify(title)},data:${dataFor(key)},borderWidth:2,pointRadius:1}]},options:chartOptions('${unit}')});`;}).join('\n');
const responseScript=responseSeries.length?`new Chart(document.getElementById('responseChart'),{type:'line',data:{labels:${JSON.stringify(responseSeries.map(x=>x.time))},datasets:[{label:'Average (ms)',data:${JSON.stringify(responseSeries.map(x=>x.avg))},borderWidth:2},{label:'P95 (ms)',data:${JSON.stringify(responseSeries.map(x=>x.p95))},borderWidth:2}]},options:chartOptions('Milliseconds')});`:'';
const capacityHtml=testType==='capacity'?`<section class="panel"><h2>Capacity and Recovery</h2><div class="cards"><div class="metric"><span>Configured VU limit</span><b>${esc(meta.max_vus??'N/A')}</b></div><div class="metric"><span>VU increment</span><b>${esc(meta.vus_step??'N/A')}</b></div><div class="metric"><span>Recovery status</span><b>${recovery.recovered===true?'Recovered':recovery.recovered===false?'Not confirmed':'Not recorded'}</b></div><div class="metric"><span>Recovery duration</span><b>${recovery.recovery_duration_ms==null?'N/A':fmt(recovery.recovery_duration_ms/1000,' s')}</b></div></div><p class="muted">Recovery probe hanya mengonfirmasi endpoint target yang diperiksa; bukan keseluruhan API, database, atau cluster.</p></section>`:'';
const conclusion=[];
if(endpointRows.length)conclusion.push(`${endpointRows.length} endpoint terdeteksi dari raw K6 JSON, dengan ${endpointRows.reduce((a,r)=>a+r.count,0)} sampel HTTP.`);
if(failedReq!==null)conclusion.push(`K6 summary melaporkan ${failedReq} failed HTTP request${Number(failedReq)===1?'':'s'}.`);
if(hasResource)conclusion.push(`Resource monitoring merekam ${resource.length} sampel selama run. Nilai maksimum CPU: ${fmt(Math.max(...rSeries('cpu_percent').map(x=>x.value)),'%')}; memory used maksimum: ${fmt(Math.max(...rSeries('memory_used_mb').map(x=>x.value)),' MB')}.`);
else conclusion.push('Kesimpulan resource belum dapat dibuat karena resource time-series belum tersedia.');
if(testType==='capacity')conclusion.push(recovery.recovered===true?'Homepage recovery terkonfirmasi oleh workflow.':'Homepage recovery belum terkonfirmasi.');

const html=`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>K6 Browser Performance Report</title><script src="https://cdn.jsdelivr.net/npm/chart.js"></script><style>
:root{--bg:#f3f5f8;--panel:#fff;--ink:#182230;--muted:#667085;--line:#e4e7ec;--blue:#477db5;--green:#16845b;--amber:#a15c00}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.55 Arial,sans-serif}main{max-width:1450px;margin:24px auto;padding:0 18px}header,.panel{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:22px;margin-bottom:16px;box-shadow:0 2px 8px #10182808}h1{margin:0;font-size:26px}h2{font-size:18px;margin:0 0 14px}.muted{color:var(--muted)}.meta{display:flex;flex-wrap:wrap;gap:8px 20px;margin-top:10px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}.metric{border:1px solid var(--line);border-radius:9px;padding:14px;background:#fafbfc}.metric span{display:block;color:var(--muted);font-size:12px}.metric b{display:block;font-size:21px;margin-top:5px;overflow-wrap:anywhere}.good{color:var(--green)}.warn{color:var(--amber)}table{width:100%;border-collapse:collapse;font-size:13px;display:block;overflow-x:auto}th,td{text-align:left;padding:10px;border-bottom:1px solid var(--line);white-space:nowrap}th{background:#edf3f9}tr:nth-child(even) td{background:#fafbfd}.chart-wrap{height:320px;position:relative}.note{padding:12px;background:#f5f8fc;border-left:3px solid var(--blue);margin-top:14px}code{overflow-wrap:anywhere}.two-col{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}@media(max-width:760px){main{padding:0 10px}.two-col{grid-template-columns:1fr}header,.panel{padding:15px}.chart-wrap{height:260px}h1{font-size:21px}}
</style></head><body><main>
<header><h1>K6 Browser Performance Report</h1><div class="meta"><span>Application: Toko Coquette</span><span>Run: #${esc(meta.run_number)}</span><span>Generated: ${new Date().toLocaleString()}</span></div><p>Scenario: <b>${esc(testType)}</b> · Target: <code>${esc(meta.target_url)}</code></p><p class="muted">${esc(meta.started_at)} — ${esc(meta.finished_at)}</p></header>
<section class="panel"><h2>Test Overview & Performance Summary</h2><div class="cards">${cards.map(([k,v])=>`<div class="metric"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div></section>
<section class="panel"><h2>APDEX & Requests Summary</h2><div class="two-col"><div><div class="cards"><div class="metric"><span>APDEX score</span><b>${apdexScore===null?'N/A':fmt(apdexScore,'',3)}</b></div><div class="metric"><span>Tolerance threshold</span><b>${apdexScore===null?'N/A':`${apdexT} ms`}</b></div><div class="metric"><span>Frustration threshold</span><b>${apdexScore===null?'N/A':`${apdexF} ms`}</b></div></div><p class="muted">APDEX dihitung dari sampel HTTP duration: satisfied ≤ T, tolerating > T hingga F, frustrated > F. Ini adalah APDEX request-level, bukan skor pengalaman end-to-end.</p></div><div class="chart-wrap"><canvas id="requestsChart"></canvas></div></div></section>
<section class="panel"><h2>Endpoint Statistics</h2><p class="muted">Dihitung dari raw K6 JSON berdasarkan URL tags. Jika data tidak tersedia, endpoint statistics tidak akan direkayasa.</p><table><thead><tr><th>Endpoint</th><th>Samples</th><th>Failed</th><th>Error %</th><th>Average</th><th>Min</th><th>Max</th><th>Median</th><th>P90</th><th>P95</th><th>P99</th></tr></thead><tbody>${endpointHtml}</tbody></table></section>
${responseSeries.length?`<section class="panel"><h2>Response Time Over Time</h2><div class="chart-wrap"><canvas id="responseChart"></canvas></div></section>`:''}
${hasResource?`<section class="panel"><h2>Infrastructure Resource Monitoring</h2><p class="muted">Sampel host dan container yang direkam selama pengujian.</p><div class="two-col">${resourceCharts}</div><h3>Resource Summary</h3><table><thead><tr><th>Resource</th><th>Latest</th><th>Peak</th><th>Average</th></tr></thead><tbody>${resourceRows}</tbody></table></section>`:`<section class="panel"><h2>Infrastructure Resource Monitoring</h2><p class="warn">Resource metrics belum tersedia. Workflow harus menghasilkan file resource-monitor.csv selama K6 berjalan agar grafik CPU, RAM, disk, network, dan Kubernetes dapat ditampilkan.</p><table><thead><tr><th>Resource</th><th>Latest</th><th>Peak</th><th>Average</th></tr></thead><tbody>${resourceRows}</tbody></table></section>`}
${capacityHtml}
${testType==='individual-api-capacity'?`
<section class="panel"><h2>Individual API Capacity by VU</h2>
<p class="muted">PASS memakai P95 ≤ ${esc(meta.max_p95_ms??500)} ms dan error rate ≤ ${esc(meta.max_error_rate_pct??1)}%.</p>
<h3>API Capacity Summary</h3>
<table><thead><tr><th>API</th><th>Highest observed VU</th><th>Highest passing VU</th><th>First failing VU</th><th>Observed VU levels</th></tr></thead><tbody>${apiSummaryRowsHtml}</tbody></table>
<h3>Per-VU Measurements</h3>
<table><thead><tr><th>API</th><th>Active VU</th><th>Duration samples</th><th>P95</th><th>Success samples</th><th>Failures</th><th>Error rate</th><th>Status</th></tr></thead><tbody>${apiVuRowsHtml}</tbody></table>
<p class="note">${esc(apiNote)} Highest passing VU adalah level tertinggi yang teramati dan memenuhi kriteria, bukan jaminan kapasitas di atas level yang diuji.</p>
${apiRows.length?`<div class="two-col"><div class="chart-wrap"><canvas id="apiP95Chart"></canvas></div><div class="chart-wrap"><canvas id="apiErrorChart"></canvas></div></div>`:''}
</section>`:''}
<section class="panel"><h2>Errors and Failures</h2>${errors.length?`<ul>${errors.map(x=>`<li><code>${esc(x.slice(0,600))}</code></li>`).join('')}</ul>`:'<p class="good">Tidak ada error yang terdeteksi dari console log.</p>'}<p class="muted">Error log berasal dari console output; HTTP failed request dihitung terpisah dari K6 summary/raw sample.</p></section>
<section class="panel"><h2>Test Conclusion</h2><ul>${conclusion.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p class="note">Kesimpulan ini merangkum data yang benar-benar tersedia. Status lulus/gagal terhadap SLA hanya dapat dinyatakan jika threshold performa dan resource ditetapkan secara eksplisit.</p></section>
<section class="panel"><h2>Test Configuration & Data Sources</h2><table><tbody><tr><td>Maximum VUs</td><td>${esc(meta.max_vus)}</td></tr><tr><td>VU step</td><td>${esc(meta.vus_step)}</td></tr><tr><td>Stage duration</td><td>${esc(meta.stage_duration)}</td></tr><tr><td>Failure-rate threshold</td><td>${esc(meta.failure_rate_limit)}</td></tr><tr><td>K6 exit code</td><td>${esc(meta.k6_exit_code)}</td></tr><tr><td>Summary source</td><td>${esc(summaryFile)}</td></tr><tr><td>Raw source</td><td>${esc(rawFile||'Not found')}</td></tr><tr><td>Resource source</td><td>${esc(resourceFile||'Not found')}</td></tr></tbody></table></section>
</main><script>
function chartOptions(unit){return{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom'}},scales:{y:{beginAtZero:true,title:{display:!!unit,text:unit}},x:{ticks:{maxTicksLimit:12}}}}}
${requestSamples.length?`new Chart(document.getElementById('requestsChart'),{type:'doughnut',data:{labels:['PASS','FAIL'],datasets:[{data:[${requestPassCount},${requestSamples.length-requestPassCount}]}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});`:''}
${testType==='individual-api-capacity' && apiRows.length?`
new Chart(document.getElementById('apiP95Chart'),{type:'line',data:{labels:${JSON.stringify(apiChartLabels)},datasets:${JSON.stringify(apiP95Datasets)}},options:chartOptions('P95 milliseconds')});
new Chart(document.getElementById('apiErrorChart'),{type:'line',data:{labels:${JSON.stringify(apiChartLabels)},datasets:${JSON.stringify(apiErrorDatasets)}},options:chartOptions('Error rate (%)')});
`:''}
${responseScript}
${resourceScript}
</script></body></html>`;
fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'browser-report.html'),html,'utf8');console.log(`HTML report created: ${path.join(dir,'browser-report.html')}`);
