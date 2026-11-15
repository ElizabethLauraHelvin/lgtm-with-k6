import { sleep } from 'k6';
import { runApiIteration } from './api-flow.js';

export const options = {
  stages: [
    { duration: '1m', target: 5 },
    { duration: '2m', target: 10 },
    { duration: '2m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  runApiIteration('load');
  sleep(1);
}
