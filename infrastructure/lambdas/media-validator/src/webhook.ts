/**
 * Webhook Caller
 *
 * Calls the API webhook endpoint to report upload validation results.
 * Uses HMAC-SHA256 signature for authentication.
 */

import crypto from 'crypto';
import https from 'https';
import http from 'http';

// ============================================================
// TYPES
// ============================================================

export interface WebhookPayload {
  bucket: string;
  key: string;
  size: number;
  contentType: string;
  etag?: string;
  width?: number;
  height?: number;
  eventTime: string;
  validationPassed: boolean;
  errorMessage?: string;
}

export interface WebhookResponse {
  success: boolean;
  mediaId?: string;
  status?: string;
  message?: string;
}

export interface WebhookConfig {
  /** API base URL (e.g., https://api.testimonials.app) */
  apiBaseUrl: string;
  /** Shared secret for HMAC signing */
  webhookSecret: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

// ============================================================
// WEBHOOK CALLER
// ============================================================

/**
 * Call the API webhook endpoint with HMAC signature
 */
export async function callWebhook(
  payload: WebhookPayload,
  config: WebhookConfig
): Promise<WebhookResponse> {
  const { apiBaseUrl, webhookSecret, timeout = 30000 } = config;

  // Serialize payload
  const body = JSON.stringify(payload);

  // Generate HMAC signature
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  // Parse URL
  const url = new URL('/media/webhooks/s3-upload', apiBaseUrl);
  const isHttps = url.protocol === 'https:';

  return new Promise((resolve, reject) => {
    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Webhook-Signature': signature,
        'User-Agent': 'MediaValidator-Lambda/1.0',
      },
      timeout,
    };

    const httpModule = isHttps ? https : http;

    const req = httpModule.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data) as WebhookResponse;

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Webhook call successful:', {
              statusCode: res.statusCode,
              mediaId: response.mediaId,
              status: response.status,
            });
            resolve(response);
          } else {
            console.error('❌ Webhook call failed:', {
              statusCode: res.statusCode,
              response: data,
            });
            reject(
              new Error(
                `Webhook returned ${res.statusCode}: ${response.message || data}`
              )
            );
          }
        } catch (parseError) {
          console.error('❌ Failed to parse webhook response:', data);
          reject(new Error(`Failed to parse webhook response: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Webhook request error:', error);
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Webhook request timed out after ${timeout}ms`));
    });

    // Send the request
    req.write(body);
    req.end();
  });
}

/**
 * Build webhook payload from validation results
 */
export function buildWebhookPayload(params: {
  bucket: string;
  key: string;
  size: number;
  contentType: string;
  etag?: string;
  eventTime: Date;
  validationPassed: boolean;
  errorMessage?: string;
  dimensions?: { width: number; height: number };
}): WebhookPayload {
  const payload: WebhookPayload = {
    bucket: params.bucket,
    key: params.key,
    size: params.size,
    contentType: params.contentType,
    etag: params.etag,
    eventTime: params.eventTime.toISOString(),
    validationPassed: params.validationPassed,
  };

  if (params.dimensions) {
    payload.width = params.dimensions.width;
    payload.height = params.dimensions.height;
  }

  if (params.errorMessage) {
    payload.errorMessage = params.errorMessage;
  }

  return payload;
}
