import http from 'k6/http';
import { sleep } from 'k6';

// export let options = {
//   stages: [
//     { duration: '1m', target: 1000 }, // below normal load
//     { duration: '5m', target: 100 },
//     { duration: '2m', target: 200 }, // normal load
//     { duration: '5m', target: 200 },
//     { duration: '2m', target: 300 }, // around the breaking point
//     { duration: '5m', target: 300 },
//     { duration: '2m', target: 400 }, // beyond the breaking point
//     { duration: '5m', target: 400 },
//     { duration: '10m', target: 0 }, // scale down. Recovery stage.
//   ],
// };

export let options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: '30s',
      preAllocatedVUs: 1000, // how large the initial pool of VUs would be
      maxVUs: 1000, // if the preAllocatedVUs are not enough, we can initialize more
    },
  },
};

export default function () {
  const BASE_URL = 'http://localhost:8008'; // make sure this is not production
  let responses = http.batch([
    [
      'GET',
      `${BASE_URL}/api/reviews/meta/?product_id=20`,
      null,
    ]
  ]);
  sleep(1);
}