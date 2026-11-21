const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || 'k6-browser-results';
const read = name => {
  try { return JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')); }
  catch { return {}; }
};
const summary = read('capacity-summary.json');
const meta = read('run-metadata.json');
const recovery = read('recovery.json');
const metrics = summary.metrics || {};
const vals = (name, key) => metrics[name]?.values?.[key];
const fmt = (v, unit = '') => Number.isFinite(Number(v)) ? `${Number(v).toFixed(2)}${unit}` : 'N/A';
const success = vals('journey_success', 'rate');
const duration = metrics.journey_duration_ms?.values || {};
const maxVus = metrics.vus_max?.values?.max ?? metrics.vus?.values?.max;
const recoveredAt = recovery.recovered_at_ms;
const recoveryMs = recovery.recovery_duration_ms;
const firstFailure = recovery.first_failure_at || 'Tidak terdeteksi dari log';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const status = recovery.recovered ? 'Homepage kembali tersedia' : 'Recovery tidak terkonfirmasi dalam batas waktu';
const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>K6 Browser Capacity Report</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f4f6fa;color:#182230;font:15px/1.55 Arial,sans-serif}.wrap{max-width:1100px;margin:32px auto;padding:0 18px}.head,.panel{background:#fff;border:1px solid #e3e8ef;border-radius:14px;padding:22px;margin-bottom:16px}.muted{color:#657286}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.metric{background:#f8fafc;border:1px solid #e6ebf2;border-radius:10px;padding:16px}.metric b{display:block;font-size:25px;margin-top:6px}.good{color:#087443}.bad{color:#b42318}table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:10px;border-bottom:1px solid #e8edf3}code{overflow-wrap:anywhere}.bar{height:12px;background:#e9eef5;border-radius:20px;overflow:hidden}.bar span{display:block;height:100%;background:#27865a;width:${Number.isFinite(success)?Math.max(0,Math.min(100,success*100)):0}%}h1{margin:0 0 4px}h2{font-size:18px;margin-top:0}@media(max-width:600px){.wrap{margin:12px auto}.head,.panel{padding:16px}}
</style></head><body><main class="wrap">
<section class="head"><h1>K6 Browser Capacity Test</h1><div class="muted">Toko Coquette · Run #${esc(meta.run_number || '')} · ${esc(meta.finished_at || new Date().toISOString())}</div><p>${esc(meta.test_type || 'capacity')} · Target: <code>${esc(meta.target_url || '')}</code></p></section>
<section class="panel"><h2>Ringkasan</h2><div class="grid">
<div class="metric">Maximum active VUs<b>${fmt(maxVus)}</b></div>
<div class="metric">Journey success rate<b>${success===undefined?'N/A':fmt(success*100,'%')}</b></div>
<div class="metric">Journey failure count<b>${fmt(vals('journey_failures','count'))}</b></div>
<div class="metric">Journey duration avg<b>${fmt(duration.avg,' ms')}</b></div>
<div class="metric">Journey duration P95<b>${fmt(duration['p(95)'],' ms')}</b></div>
<div class="metric">Journey duration max<b>${fmt(duration.max,' ms')}</b></div>
</div><p>Success rate</p><div class="bar"><span></span></div></section>
<section class="panel"><h2>Gangguan dan pemulihan</h2><table>
<tr><th>Indikator</th><th>Hasil</th></tr>
<tr><td>First browser journey failure</td><td>${esc(firstFailure)}</td></tr>
<tr><td>Recovery status</td><td class="${recovery.recovered?'good':'bad'}">${esc(status)}</td></tr>
<tr><td>Recovery duration</td><td>${recoveryMs===undefined?'N/A':esc(fmt(recoveryMs/1000,' detik'))}</td></tr>
<tr><td>Homepage probe successes required</td><td>3 kali berturut-turut HTTP 2xx</td></tr>
<tr><td>K6 exit code</td><td>${esc(meta.k6_exit_code ?? 'N/A')}</td></tr>
</table><p class="muted">Catatan: journey failure tidak otomatis berarti server down. Recovery diukur setelah beban K6 dihentikan, melalui probe homepage. Ini mengukur ketersediaan frontend, bukan pemulihan seluruh backend atau self-healing Kubernetes.</p></section>
<section class="panel"><h2>Konfigurasi pengujian</h2><table>
<tr><td>Batas maksimum VUs</td><td>${esc(meta.max_vus ?? 'N/A')}</td></tr><tr><td>Penambahan VUs per tahap</td><td>${esc(meta.vus_step ?? 'N/A')}</td></tr><tr><td>Durasi tahap</td><td>${esc(meta.stage_duration ?? 'N/A')}</td></tr><tr><td>Failure threshold</td><td>${esc(meta.failure_rate_limit ?? 'N/A')}</td></tr><tr><td>Recovery timeout</td><td>${esc(meta.recovery_timeout ?? 'N/A')}</td></tr>
</table></section>
<section class="panel"><h2>Interpretasi</h2><p>Maximum active VUs menunjukkan jumlah browser virtual users tertinggi yang aktif selama pengujian. Journey duration menunjukkan waktu yang diperlukan satu browser untuk menyelesaikan alur. Recovery duration dihitung dari saat beban selesai dihentikan sampai homepage berhasil memberikan tiga respons HTTP 2xx berturut-turut.</p><p class="muted">File JSON dan log mentah disertakan bersama HTML report pada GitHub Actions Artifact.</p></section>
</main></body></html>`;
fs.writeFileSync(path.join(dir, 'browser-report.html'), html);
console.log(`HTML report created: ${path.join(dir, 'browser-report.html')}`);
