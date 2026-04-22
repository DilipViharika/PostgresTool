/**
 * Span Batcher for OTLP/HTTP ingest
 * Collects spans and flushes to /api/otlp/v1/traces
 */

class SpanBatcher {
  constructor(client, batchSize = 100, flushIntervalMs = 10000) {
    this.client = client;
    this.batchSize = batchSize;
    this.flushIntervalMs = flushIntervalMs;
    this.queue = [];
    this.flushTimer = null;
    this.isShuttingDown = false;
  }

  /**
   * Add a span to the queue
   */
  enqueue(span) {
    if (this.isShuttingDown) {
      return;
    }

    this.queue.push(span);

    // Auto-flush if queue exceeds batchSize
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Start background flush timer
   */
  start() {
    if (this.flushTimer) {
      return;
    }

    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushIntervalMs);
    // Don't keep the event loop alive solely for the flush timer —
    // callers that want the process to linger should use sdk.start()
    // + sdk.shutdown() explicitly. Mirrors the event batcher's behavior.
    if (typeof this.flushTimer?.unref === 'function') {
      this.flushTimer.unref();
    }
  }

  /**
   * Stop background flush timer
   */
  stop() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Flush all queued spans to OTLP endpoint
   */
  async flush() {
    if (this.queue.length === 0) {
      return;
    }

    const batch = this.queue.splice(0, this.batchSize);
    const payload = this._buildOtlpPayload(batch);

    try {
      const response = await fetch(`${this.client.endpoint}/api/otlp/v1/traces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SDK-Key': this.client.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      this.client._log(`[Span Flush] Success (${batch.length} spans)`);
    } catch (error) {
      this.client._log('[ERROR] Span flush failed:', error.message);
      // Re-queue spans on failure
      this.queue.unshift(...batch);
    }
  }

  /**
   * Build OTLP/HTTP payload from spans
   */
  _buildOtlpPayload(spans) {
    const otlpSpans = spans.map(s => s.toOtlpSpan());

    return {
      resourceSpans: [
        {
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: this.client.appName } },
              { key: 'service.version', value: { stringValue: '1.0.0' } },
            ],
          },
          scopeSpans: [
            {
              scope: {
                name: '@fathom/sdk',
                version: '1.0.0',
              },
              spans: otlpSpans,
            },
          ],
        },
      ],
    };
  }

  /**
   * Shutdown: flush remaining and stop timer
   */
  async shutdown() {
    this.isShuttingDown = true;
    this.stop();
    if (this.queue.length > 0) {
      await this.flush();
    }
  }
}

export { SpanBatcher };
