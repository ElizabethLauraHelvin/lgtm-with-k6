
export const options = {
  scenarios: {
    login_browser: {
      executor: 'ramping-vus',
      startVUs: 1,

      stages: [
        { duration: '30s', target: 1 },
        { duration: '1m', target: 2 },
        { duration: '1m', target: 3 },
        { duration: '1m', target: 5 },
        { duration: '1m', target: 7 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 },
      ],

      gracefulRampDown: '10s',

      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },

  thresholds: {
    browser_session_success: [{
      threshold: 'rate>0.90',
      abortOnFail: true,
      delayAbortEval: '30s',
    }],
  },
};
