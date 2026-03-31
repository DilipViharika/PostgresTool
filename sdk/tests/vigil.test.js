/**
 * Unit tests for VIGIL SDK
 * Run with: node --test tests/vigil.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert';
import VigilSDK from '../src/index.js';

test('SDK initialization', () => {
  assert.throws(
    () => new VigilSDK({ endpoint: 'https://vigil.app' }),
    /apiKey is required/,
    'Should require apiKey'
  );

  assert.throws(
    () => new VigilSDK({ apiKey: 'sk_live_test' }),
    /endpoint is required/,
    'Should require endpoint'
  );

  const sdk = new VigilSDK({
    apiKey: 'sk_live_test',
    endpoint: 'https://vigil.app',
  });

  assert.equal(sdk.apiKey, 'sk_live_test');
  assert.equal(sdk.endpoint, 'https://vigil.app');
  assert.equal(sdk.batchSize, 50);
  assert.equal(sdk.flushInterval, 10000);
});

test('Event queueing', () => {
  const sdk = new VigilSDK({
    apiKey: 'sk_live_test',
    endpoint: 'https://vigil.app',
  });

  sdk.trackAPI({
    method: 'GET',
    endpoint: '/api/test',
    statusCode: 200,
    durationMs: 100,
  });

  assert.equal(sdk.queue.length, 1);
  assert.equal(sdk.queue[0].type, 'api');
  assert.equal(sdk.queue[0].title, 'GET /api/test');
});

test('Error tracking', () => {
  const sdk = new VigilSDK({
    apiKey: 'sk_live_test',
    endpoint: 'https://vigil.app',
  });

  const error = new Error('Test error');
  sdk.trackError({ error });

  assert.equal(sdk.queue.length, 1);
  assert.equal(sdk.queue[0].type, 'error');
  assert.match(sdk.queue[0].metadata.message, /Test error/);
});

test('Event listeners', () => {
  const sdk = new VigilSDK({
    apiKey: 'sk_live_test',
    endpoint: 'https://vigil.app',
  });

  let shutdownCalled = false;
  sdk.on('shutdown', () => {
    shutdownCalled = true;
  });

  sdk.emit('shutdown', {});
  assert.equal(shutdownCalled, true);
});

test('Graceful shutdown', async () => {
  const sdk = new VigilSDK({
    apiKey: 'sk_live_test',
    endpoint: 'https://vigil.app',
  });

  sdk.start();
  assert.ok(sdk.flushTimer !== null);

  await sdk.shutdown();
  assert.equal(sdk.flushTimer, null);
  assert.equal(sdk.isShuttingDown, true);
});

console.log('✓ All tests passed');
