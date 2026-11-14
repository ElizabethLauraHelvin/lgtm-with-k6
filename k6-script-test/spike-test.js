import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = (__ENV.BASE_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

export const options = {
  stages: [
    { duration: '1m', target: 5 },
    { duration: '10s', target: 40 },
    { duration: '1m', target: 40 },
    { duration: '10s', target: 5 },
    { duration: '1m', target: 5 },
    { duration: '10s', target: 0 },
  ],
};

export default function () {
  const response = http.get(`${BASE_URL}/`, {
    tags: { test_type: 'spike' },
  });

  check(response, {
    'server returns a response': (r) => r.status > 0,
    'server did not return 5xx': (r) => r.status < 500,
  });

  sleep(1);
}
