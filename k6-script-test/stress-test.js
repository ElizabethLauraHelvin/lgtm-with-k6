import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = (__ENV.BASE_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

export const options = {
  stages: [
    { duration: '1m', target: 5 },
    { duration: '2m', target: 15 },
    { duration: '2m', target: 25 },
    { duration: '2m', target: 40 },
    { duration: '1m', target: 0 },
  ],
  // Stress tests may exceed normal latency/error thresholds by design.
  // Review the k6 summary to identify the point where performance degrades.
};

export default function () {
  const response = http.get(`${BASE_URL}/`, {
    tags: { test_type: 'stress' },
  });

  check(response, {
    'server returns a response': (r) => r.status > 0,
    'server did not return 5xx': (r) => r.status < 500,
  });

  sleep(1);
}
