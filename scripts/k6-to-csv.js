
const fs = require('fs');
const path = require('path');

const input = process.argv[2];
const output = process.argv[3];

if (!input || !output) {
  console.error(
    'Usage: node scripts/k6-to-csv.js input.json output.csv'
  );
  process.exit(1);
}

if (!fs.existsSync(input)) {
  console.error(`Input file not found: ${input}`);
  process.exit(1);
}

const csvEscape = (value) => {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
};

const headers = [
  'timeStamp',
  'elapsed',
  'label',
  'responseCode',
  'responseMessage',
  'threadName',
  'dataType',
  'success',
  'failureMessage',
  'bytes',
  'sentBytes',
  'grpThreads',
  'allThreads',
  'URL',
  'Latency',
  'IdleTime',
  'Connect'
];

const lines = fs.readFileSync(input, 'utf8')
  .split(/\r?\n/)
  .filter(Boolean);

const samples = [];

for (const line of lines) {
  let event;

  try {
    event = JSON.parse(line);
  } catch {
    continue;
  }

  if (event.type !== 'Point') continue;

  const metric = event.metric;
  const data = event.data || {};

  // Gunakan durasi HTTP request sebagai sample utama.
  if (
    metric !== 'browser_http_req_duration' &&
    metric !== 'http_req_duration'
  ) {
    continue;
  }

  const tags = data.tags || {};
  const elapsed = Number(data.value);

  if (!Number.isFinite(elapsed)) continue;

  const timestamp = data.time
    ? new Date(data.time).getTime()
    : Date.now();

  const status = Number(tags.status || 0);
  const url = tags.url || '';
  const label = tags.name || url || metric;

  const success =
    status >= 200 && status < 400;

  const sample = {
    timeStamp: timestamp,
    elapsed: elapsed.toFixed(2),
    label,
    responseCode: status || '',
    responseMessage: '',
    threadName: `VU ${tags.vu || 'unknown'}`,
    dataType: 'text',
    success: success ? 'true' : 'false',
    failureMessage: status >= 400
      ? `HTTP ${status}`
      : '',
    bytes: 0,
    sentBytes: 0,
    grpThreads: tags.vu || 0,
    allThreads: tags.vu || 0,
    URL: url,
    Latency: elapsed.toFixed(2),
    IdleTime: 0,
    Connect: 0
  };

  samples.push(sample);
}

samples.sort((a, b) => a.timeStamp - b.timeStamp);

const outputLines = [
  headers.join(','),
  ...samples.map(sample =>
    headers.map(header => csvEscape(sample[header])).join(',')
  )
];

fs.mkdirSync(path.dirname(output), { recursive: true });

fs.writeFileSync(
  output,
  outputLines.join('\n') + '\n',
  'utf8'
);

console.log(`CSV generated: ${output}`);
console.log(`HTTP request samples: ${samples.length}`);
