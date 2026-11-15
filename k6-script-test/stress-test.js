import { sleep } from 'k6';
import { runApiIteration } from './api-flow.js';

export const options = {
  stages: [
    { duration: '1m', target: 5 },
    { duration: '2m', target: 15 },
    { duration: '2m', target: 25 },
    { duration: '2m', target: 40 },
    { duration: '1m', target: 0 },
  ],
  // Stress tests may exceed normal latency/error thresholds by design.
};

export default function () {
  runApiIteration('stress');
  sleep(1);
}
