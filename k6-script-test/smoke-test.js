import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = (__ENV.BASE_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const response = http.get(`${BASE_URL}/`, {
    tags: { test_type: 'smoke' },
  });

  check(response, {
    'status is 2xx or 3xx': (r) => r.status >= 200 && r.status < 400,
    'response received within 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
