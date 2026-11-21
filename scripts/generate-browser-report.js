const fs = require("fs");
const path = require("path");

const dir = process.argv[2] || "k6-browser-results";

const readJson = (name) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
  } catch {
    return {};
  }
};

const summary = readJson("capacity-summary.json");
const meta = readJson("run-metadata.json");
const recovery = readJson("recovery.json");
const metrics = summary.metrics || {};

const esc = (v) =>
  String(v ?? "N/A").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

const metric = (name) => metrics[name] || {};

const vals = (name) => metric(name).values || metric(name);

const pick = (name, ...keys) => {
  const v = vals(name);

  for (const key of keys) {
    if (v && v[key] !== undefined && v[key] !== null) {
      return v[key];
    }
  }

  return null;
};

const fmt = (v, suffix = "", digits = 2) =>
  n(v) === null ? "N/A" : `${n(v).toFixed(digits)}${suffix}`;

const isCapacity = meta.test_type === "capacity";

const successRate = pick("journey_success", "rate", "value");

const failureCount =
  pick("journey_failures", "count") ?? metric("journey_success").fails ?? null;

const journeyDuration = vals("journey_duration_ms");

const maxVus = pick("vus_max", "max", "value") ?? pick("vus", "max", "value");

const durationMs =
  n(meta.finished_at_ms) !== null && n(meta.started_at_ms) !== null
    ? n(meta.finished_at_ms) - n(meta.started_at_ms)
    : null;

// STATISTICS TABLE

const transactionMetrics = Object.keys(metrics).filter((k) =>
  /browser_http_req_duration|journey_duration_ms|lcp|fcp|inp|cls/i.test(k),
);

const requestMetrics = Object.keys(metrics).filter((k) =>
  /browser_http_req_duration/.test(k),
);

const errorMetrics = Object.keys(metrics).filter((k) =>
  /failed|failure|error/i.test(k),
);

function tableRows(names) {
  return names
    .map((name) => {
      const v = vals(name);

      const unit = /duration|time|lcp|fcp|inp/i.test(name) ? " ms" : "";

      return `
      <tr>
        <td>${esc(name)}</td>
        <td>${fmt(v.count ?? v.value)}</td>
        <td>${fmt(v.avg, unit)}</td>
        <td>${fmt(v.min, unit)}</td>
        <td>${fmt(v.max, unit)}</td>
        <td>${fmt(v["p(90)"], unit)}</td>
        <td>${fmt(v["p(95)"], unit)}</td>
        <td>${fmt(v["p(99)"], unit)}</td>
      </tr>
    `;
    })
    .join("");
}

// ERROR LOG

const consoleLog = (() => {
  try {
    return fs.readFileSync(path.join(dir, "k6-console.log"), "utf8");
  } catch {
    return "";
  }
})();

const errorLines = [
  ...new Set(
    consoleLog
      .split(/\r?\n/)
      .filter((line) =>
        /BROWSER_JOURNEY_FAILURE|error|failed|timeout|HTTP [45]\d\d/i.test(
          line,
        ),
      ),
  ),
].slice(0, 30);

const errorHtml = errorLines.length
  ? `<ul>${errorLines
      .map((line) => `<li><code>${esc(line.slice(0, 500))}</code></li>`)
      .join("")}</ul>`
  : '<p class="muted">Tidak ada error yang terdeteksi dari console log.</p>';

// EXECUTIVE SUMMARY

const summaryCards = [
  ["Scenario", meta.test_type || "N/A"],
  ["Maximum VUs observed", maxVus ?? meta.max_vus ?? "N/A"],
  [
    "Journey success rate",
    successRate == null ? "N/A" : fmt(Number(successRate) * 100, "%"),
  ],
  ["Journey failures", failureCount ?? "N/A"],
  ["Average journey duration", fmt(journeyDuration.avg, " ms")],
  ["P95 journey duration", fmt(journeyDuration["p(95)"], " ms")],
  ["Test duration", durationMs == null ? "N/A" : fmt(durationMs / 1000, " s")],
];

// CAPACITY ANALYSIS

const capacitySection = isCapacity
  ? `
<section class="panel">
  <h2>Breaking Point & Recovery Analysis</h2>

  <div class="grid">
    <div class="metric">
      <span>Configured VU Limit</span>
      <b>${esc(meta.max_vus ?? "N/A")}</b>
    </div>

    <div class="metric">
      <span>Failure Rate Threshold</span>
      <b>${esc(meta.failure_rate_limit ?? "N/A")}</b>
    </div>

    <div class="metric">
      <span>Recovery Status</span>
      <b class="${recovery.recovered === true ? "good" : "warn"}">
        ${
          recovery.recovered === true
            ? "Recovered"
            : recovery.recovered === false
              ? "Not Confirmed"
              : "Not Recorded"
        }
      </b>
    </div>

    <div class="metric">
      <span>Recovery Duration</span>
      <b>
        ${
          recovery.recovery_duration_ms == null
            ? "N/A"
            : fmt(recovery.recovery_duration_ms / 1000, " s")
        }
      </b>
    </div>
  </div>

  <table>
    <tbody>
      <tr>
        <th>Indicator</th>
        <th>Result</th>
      </tr>

      <tr>
        <td>First Journey Failure</td>
        <td>${esc(recovery.first_failure_at || "Not recorded")}</td>
      </tr>

      <tr>
        <td>Recovery Probe Method</td>
        <td>
          ${
            recovery.required_consecutive_successes
              ? `${esc(recovery.required_consecutive_successes)} consecutive HTTP 2xx probes, every ${esc(recovery.probe_interval_seconds)} seconds`
              : "Not recorded"
          }
        </td>
      </tr>

      <tr>
        <td>Recovery Confirmed At</td>
        <td>${esc(recovery.recovered_at || "Not confirmed")}</td>
      </tr>
    </tbody>
  </table>

  <p class="note">
    Catatan: kegagalan browser journey tidak otomatis berarti
    seluruh server down. Recovery yang diukur melalui homepage
    hanya mengonfirmasi ketersediaan endpoint tersebut, bukan
    pemulihan seluruh API, database, atau cluster Kubernetes.
    Breaking point aktual harus didukung hasil health-check
    dan jumlah VUs saat kegagalan.
  </p>
</section>
`
  : "";

// AUTOMATED INTERPRETATION

const interpretation = [];

if (successRate != null) {
  interpretation.push(
    `Journey success rate tercatat ${fmt(Number(successRate) * 100, "%")}. Angka ini menunjukkan proporsi journey yang berhasil menurut metrik K6.`,
  );
}

if (journeyDuration.avg != null) {
  interpretation.push(
    `Rata-rata durasi journey adalah ${fmt(journeyDuration.avg, " ms")} dengan P95 ${fmt(journeyDuration["p(95)"], " ms")}. P95 berarti 95% sampel memiliki durasi sama dengan atau lebih rendah dari nilai tersebut.`,
  );
}

if (isCapacity) {
  if (recovery.recovered === true) {
    interpretation.push(
      `Homepage berhasil melewati ${recovery.required_consecutive_successes || 3} pemeriksaan HTTP 2xx berturut-turut. Waktu recovery adalah ${
        recovery.recovery_duration_ms == null
          ? "tidak tersedia"
          : fmt(recovery.recovery_duration_ms / 1000, " detik")
      }.`,
    );
  } else {
    interpretation.push(
      "Recovery homepage belum terkonfirmasi dalam data yang tersedia.",
    );
  }

  interpretation.push(
    "Jika batas VUs tercapai tanpa health-check downtime yang terkonfirmasi, hasil ini hanya menyatakan kapasitas sampai batas pengujian, bukan kapasitas maksimum absolut.",
  );
}

if (!interpretation.length) {
  interpretation.push(
    "Data metrik belum cukup untuk menghasilkan interpretasi otomatis. Pastikan summary JSON berisi metrik dari skenario yang dijalankan.",
  );
}

// CHART DATA

const chartLabels = requestMetrics.map((x) => x.replace(/^browser_/, ""));

const chartP95 = requestMetrics.map((x) => n(pick(x, "p(95)")));

const chartAvg = requestMetrics.map((x) => n(pick(x, "avg")));

const chartBlock = requestMetrics.length
  ? `
<section class="panel">
  <h2>Response Time Comparison</h2>

  <p class="muted">
    Perbandingan Average dan P95 dari summary K6.
    Grafik ini merupakan data agregat, bukan time-series.
  </p>

  <canvas id="latencyChart" height="110"></canvas>
</section>
`
  : "";

// HTML REPORT

const html = `
<!doctype html>
<html lang="id">

<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>K6 Browser Performance Report</title>

<style>

:root {
  --bg: #f3f5f8;
  --panel: #ffffff;
  --ink: #182230;
  --muted: #667085;
  --line: #e4e7ec;
  --blue: #477db5;
  --green: #16845b;
  --amber: #a15c00;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font: 14px/1.55 Arial, sans-serif;
}

main {
  max-width: 1180px;
  margin: 28px auto;
  padding: 0 18px;
}

header,
.panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px #10182808;
}

h1 {
  margin: 0;
  font-size: 26px;
}

h2 {
  font-size: 18px;
  margin: 0 0 14px;
}

.muted {
  color: var(--muted);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-top: 8px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
  gap: 12px;
}

.metric {
  border: 1px solid var(--line);
  border-radius: 9px;
  padding: 14px;
  background: #fafbfc;
}

.metric span {
  display: block;
  color: var(--muted);
  font-size: 12px;
}

.metric b {
  display: block;
  font-size: 22px;
  margin-top: 5px;
  overflow-wrap: anywhere;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  display: block;
  overflow-x: auto;
}

th,
td {
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}

th {
  background: #edf3f9;
}

tr:nth-child(even) td {
  background: #fafbfd;
}

.good {
  color: var(--green);
}

.warn {
  color: var(--amber);
}

.note {
  padding: 12px;
  background: #f5f8fc;
  border-left: 3px solid var(--blue);
  margin-top: 14px;
}

.interpret li {
  margin: 8px 0;
}

code {
  overflow-wrap: anywhere;
}

canvas {
  max-height: 360px;
}

@media(max-width: 600px) {
  main {
    margin: 12px auto;
    padding: 0 10px;
  }

  header,
  .panel {
    padding: 15px;
  }

  h1 {
    font-size: 21px;
  }
}

</style>
</head>

<body>

<main>

<header>

<h1>K6 Browser Performance Report</h1>

<div class="meta">
  <span>Application: Toko Coquette</span>
  <span>Run: #${esc(meta.run_number)}</span>
  <span>Generated: ${esc(new Date().toISOString())}</span>
</div>

<p>
  Scenario: <b>${esc(meta.test_type)}</b>
  · Target: <code>${esc(meta.target_url)}</code>
</p>

<p class="muted">
  ${esc(meta.started_at)} — ${esc(meta.finished_at)}
</p>

</header>


<section class="panel">

<h2>Executive Summary</h2>

<div class="grid">

${summaryCards
  .map(
    ([label, value]) => `
  <div class="metric">
    <span>${esc(label)}</span>
    <b>${esc(value)}</b>
  </div>
`,
  )
  .join("")}

</div>

</section>


<section class="panel">

<h2>Statistics</h2>

<p class="muted">
  Ringkasan metrik yang tersedia dari K6 summary export.
  Kolom yang tidak dikumpulkan akan ditampilkan sebagai N/A.
</p>

<table>

<thead>
<tr>
  <th>Metric</th>
  <th>Samples / Value</th>
  <th>Average</th>
  <th>Min</th>
  <th>Max</th>
  <th>P90</th>
  <th>P95</th>
  <th>P99</th>
</tr>
</thead>

<tbody>

${
  tableRows(transactionMetrics) ||
  '<tr><td colspan="8">Tidak ada metrik statistik yang ditemukan.</td></tr>'
}

</tbody>

</table>

</section>


${chartBlock}


<section class="panel">

<h2>Error Summary</h2>

<p class="muted">
  Baris log yang cocok dengan pola error, failure, atau timeout.
  Ini merupakan ekstraksi log, bukan klasifikasi error lengkap.
</p>

${errorHtml}

<h3>Failure-related Metrics</h3>

<ul>

${
  errorMetrics
    .map((k) => `<li>${esc(k)}: ${esc(JSON.stringify(vals(k)))}</li>`)
    .join("") || "<li>Tidak ada metrik error terdeteksi.</li>"
}

</ul>

</section>


${capacitySection}


<section class="panel">

<h2>Automated Interpretation</h2>

<ul class="interpret">

${interpretation.map((x) => `<li>${esc(x)}</li>`).join("")}

</ul>

<p class="muted">
  Interpretasi dibatasi pada data yang tersedia di summary,
  metadata, console log, dan recovery JSON. Report tidak
  mengarang time-series atau hasil health-check yang tidak direkam.
</p>

</section>


<section class="panel">

<h2>Test Configuration</h2>

<table>

<tbody>

<tr>
  <td>Maximum VUs configured</td>
  <td>${esc(meta.max_vus)}</td>
</tr>

<tr>
  <td>VUs step</td>
  <td>${esc(meta.vus_step)}</td>
</tr>

<tr>
  <td>Stage duration</td>
  <td>${esc(meta.stage_duration)}</td>
</tr>

<tr>
  <td>Failure-rate threshold</td>
  <td>${esc(meta.failure_rate_limit)}</td>
</tr>

<tr>
  <td>K6 exit code</td>
  <td>${esc(meta.k6_exit_code)}</td>
</tr>

</tbody>

</table>

</section>

</main>

${
  requestMetrics.length
    ? `
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>

new Chart(document.getElementById('latencyChart'), {

  type: 'bar',

  data: {

    labels: ${JSON.stringify(chartLabels)},

    datasets: [

      {
        label: 'Average (ms)',
        data: ${JSON.stringify(chartAvg)}
      },

      {
        label: 'P95 (ms)',
        data: ${JSON.stringify(chartP95)}
      }

    ]

  },

  options: {

    responsive: true,

    scales: {

      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Milliseconds'
        }
      }

    }

  }

});

</script>
`
    : ""
}

</body>
</html>
`;

// GENERATE REPORT

fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(path.join(dir, "browser-report.html"), html, "utf8");

console.log(`HTML report created: ${path.join(dir, "browser-report.html")}`);
