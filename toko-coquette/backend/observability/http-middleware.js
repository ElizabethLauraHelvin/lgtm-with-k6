// HTTP metrics middleware for the Coquette Express backend.
// Exposes low-cardinality API route labels for Prometheus scraping.
'use strict';

const client = require('prom-client');

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: 'coquette_',
});

const httpRequestsTotal = new client.Counter({
  name: 'coquette_http_requests_total',
  help: 'Total number of Coquette API HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'coquette_http_request_duration_seconds',
  help: 'Duration of Coquette API HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
  registers: [register],
});

function getRouteLabel(req) {
  // Express assigns req.route after a route has matched and executed.
  // Use the route template (e.g. /api/products/:id), not the concrete URL.
  if (req.route && req.route.path) {
    return `${req.baseUrl || ''}${req.route.path}`;
  }

  // Avoid putting arbitrary URL paths/IDs into metric labels.
  return 'unmatched';
}

function httpObservability(serviceName = 'coquette-backend') {
  return function coquetteHttpMetricsMiddleware(req, res, next) {
    // Keep this middleware focused on API traffic. Do not count /metrics
    // or frontend static assets in the API performance metrics.
    if (req.path === '/metrics' || !req.path.startsWith('/api/')) {
      return next();
    }

    const endTimer = httpRequestDuration.startTimer();

    res.once('finish', () => {
      const labels = {
        method: req.method,
        route: getRouteLabel(req),
        status_code: String(res.statusCode),
      };

      httpRequestsTotal.inc(labels);
      endTimer(labels);
    });

    next();
  };
}

module.exports = {
  httpObservability,
  register,
};
