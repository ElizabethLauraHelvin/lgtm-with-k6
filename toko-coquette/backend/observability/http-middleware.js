'use strict';

const { metrics, trace, SpanStatusCode } = require('@opentelemetry/api');

const meter = metrics.getMeter('coquette-http');
const requestCounter = meter.createCounter('http.server.request.count', {
  description: 'Number of completed HTTP requests',
});
const requestDuration = meter.createHistogram('http.server.request.duration', {
  description: 'HTTP server request duration',
  unit: 'ms',
});

function httpObservability(serviceName = process.env.OTEL_SERVICE_NAME || 'coquette-backend') {
  return function observabilityMiddleware(req, res, next) {
    const startedAt = process.hrtime.bigint();
    const routePath = req.route && req.route.path ? req.route.path : req.path;

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      const statusCode = res.statusCode;
      const method = req.method;
      const path = routePath || req.path;
      const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

      const attributes = {
        'service.name': serviceName,
        'http.request.method': method,
        'http.route': path,
        'http.response.status_code': statusCode,
      };

      requestCounter.add(1, attributes);
      requestDuration.record(durationMs, attributes);

      const span = trace.getActiveSpan();
      if (span && statusCode >= 500) {
        span.setStatus({ code: SpanStatusCode.ERROR });
      }

      // Do not log request bodies, authorization headers, cookies, or user data.
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        service: serviceName,
        event: 'http_request_completed',
        method,
        path,
        status_code: statusCode,
        duration_ms: Number(durationMs.toFixed(2)),
      }));
    });

    next();
  };
}

module.exports = { httpObservability };
