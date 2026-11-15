import { sleep } from 'k6';
import { runApiIteration } from './api-flow.js';

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
  runApiIteration('spike');
  sleep(1);
}
