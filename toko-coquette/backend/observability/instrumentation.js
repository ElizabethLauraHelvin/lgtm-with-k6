'use strict';

// Load this file before Express/HTTP modules (for example with --require).
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const serviceName = process.env.OTEL_SERVICE_NAME || 'coquette-backend';
const endpoint = (process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
  'http://alloy.monitoring.svc.cluster.local:4318').replace(/\/$/, '');
const headers = process.env.OTEL_EXPORTER_OTLP_HEADERS || undefined;
const parsedHeaders = headers
  ? Object.fromEntries(headers.split(',').map((part) => {
      const index = part.indexOf('=');
      return index < 0 ? [part.trim(), ''] : [part.slice(0, index).trim(), part.slice(index + 1).trim()];
    }))
  : undefined;

const sdk = new NodeSDK({
  resource: new Resource({
    'service.name': serviceName,
    'deployment.environment': process.env.APP_ENV || 'production',
  }),
  traceExporter: new OTLPTraceExporter({
    url: `${endpoint}/v1/traces`,
    headers: parsedHeaders,
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `${endpoint}/v1/metrics`,
      headers: parsedHeaders,
    }),
    exportIntervalMillis: Number(process.env.OTEL_METRIC_EXPORT_INTERVAL || 15000),
  }),
  instrumentations: [getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-fs': { enabled: false },
  })],
});

try {
  sdk.start();
  console.log(JSON.stringify({
    level: 'info',
    service: serviceName,
    event: 'observability_initialized',
    otlp_endpoint: endpoint,
  }));
} catch (error) {
  console.error(JSON.stringify({
    level: 'error',
    service: serviceName,
    event: 'observability_initialization_failed',
    error: error.message,
  }));
}

async function shutdown() {
  try {
    await sdk.shutdown();
  } catch (error) {
    console.error(`[observability] shutdown failed: ${error.message}`);
  }
}

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
