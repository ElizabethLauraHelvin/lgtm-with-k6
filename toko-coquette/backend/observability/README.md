# Toko Coquette Node.js Observability

This folder is the Node.js equivalent of the Go `observability` package supplied as a reference. It is intended for the existing Express backend; it is not an Alloy configuration.

## What it provides

- `instrumentation.js`: initializes OpenTelemetry before Express and other instrumented libraries load. It exports traces and metrics over OTLP/HTTP to Grafana Alloy.
- `http-middleware.js`: Express middleware that writes structured request logs to stdout and records request count and duration metrics.
- No frontend JavaScript changes are required. Nginx access/error logs can be sent to container stdout/stderr using the configuration snippet below.

## Dependencies

From `backend/`, install:

```bash
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/sdk-metrics @opentelemetry/resources @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http @opentelemetry/exporter-metrics-otlp-http
```

## Minimal backend integration

1. Copy this `observability/` folder into the backend directory, alongside `server.js` and `package.json`.
2. Change the backend start script in `package.json` from `node server.js` to:

```json
"start": "node --require ./observability/instrumentation.js server.js"
```

This preloads OpenTelemetry before Express is imported, which is important for automatic HTTP/Express instrumentation.

3. In `server.js`, after `const app = express();` and before route declarations, add:

```js
const { httpObservability } = require('./observability/http-middleware');
app.use(httpObservability('coquette-backend'));
```

This is the only application-code addition required for request logs and application-level HTTP metrics. Existing routes and frontend code do not need to change.

## Kubernetes environment variables

Add these to the backend Deployment container environment:

```yaml
env:
  - name: OTEL_SERVICE_NAME
    value: coquette-backend
  - name: APP_ENV
    value: production
  - name: OTEL_EXPORTER_OTLP_ENDPOINT
    value: http://alloy.monitoring.svc.cluster.local:4318
  - name: OTEL_METRIC_EXPORT_INTERVAL
    value: "15000"
```

The Alloy service must expose an OTLP HTTP receiver on port 4318 and route traces to Tempo and metrics to Mimir. Confirm the actual service name and receiver configuration in the cluster before deploying.

## Frontend Nginx logs

In the frontend Nginx `server` block, add or update:

```nginx
access_log /dev/stdout;
error_log /dev/stderr warn;
```

No frontend JavaScript changes are required. Alloy must discover Pods in namespace `ecommerce` and collect container stdout/stderr for both frontend and backend.

## Health endpoint

An optional lightweight endpoint can be added to `server.js` before the application routes:

```js
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
```

This is useful for Kubernetes probes, but it is not required for log collection.

## Important notes

- Loki receives stdout/stderr logs via Alloy; this package does not push logs directly to Loki.
- Traces and metrics are exported to Alloy using OTLP/HTTP.
- The current backend uses `better-sqlite3`. This package does not yet create SQLite query spans; DB-level tracing requires a separate instrumentation/custom wrapper.
- Never log passwords, JWTs, authorization headers, cookies, or personal/order details.
- Verify that the Alloy Service is actually named `alloy` and exposes port `4318`; otherwise update `OTEL_EXPORTER_OTLP_ENDPOINT`.
