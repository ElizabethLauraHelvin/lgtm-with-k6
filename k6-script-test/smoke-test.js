import { sleep } from "k6";
import { runApiIteration } from "./api-flow.js";

export const options = {
  vus: 10,
  duration: "30m",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<3000"],
  },
};

export default function () {
  runApiIteration("soak");
  sleep(1);
}
