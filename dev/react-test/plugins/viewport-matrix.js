import fs from 'node:fs/promises';
import path from 'node:path';
import {
  captureViewportMatrix,
  readViewportMatrixManifest,
  VIEWPORT_MATRIX_OUTPUT_DIR,
} from '../../../scripts/capture-viewport-matrix.mjs';
import { VIEWPORT_PRESETS } from '../config/viewport-presets.js';

const API_ROOT = '/__ov25/viewport-matrix';
const ASSET_ROOT = `${API_ROOT}/assets/`;

export function viewportMatrixPlugin() {
  let activeCapture = false;

  const installMiddleware = (server) => {
    server.middlewares.use(async (request, response, next) => {
      const requestUrl = new URL(request.url || '/', 'http://ov25-fixture.local');

      if (requestUrl.pathname === `${API_ROOT}/state` && request.method === 'GET') {
        try {
          sendJson(response, 200, {
            presets: VIEWPORT_PRESETS,
            manifest: await readViewportMatrixManifest(),
            capturing: Boolean(activeCapture),
          });
        } catch (error) {
          sendJson(response, 500, { error: errorMessage(error) });
        }
        return;
      }

      if (requestUrl.pathname.startsWith(ASSET_ROOT) && request.method === 'GET') {
        const encodedFilename = requestUrl.pathname.slice(ASSET_ROOT.length);
        let filename;

        try {
          filename = decodeURIComponent(encodedFilename);
        } catch {
          sendJson(response, 400, { error: 'Invalid screenshot filename.' });
          return;
        }

        if (
          filename !== path.basename(filename) ||
          !/^[a-z0-9][a-z0-9._-]*\.png$/i.test(filename)
        ) {
          sendJson(response, 400, { error: 'Invalid screenshot filename.' });
          return;
        }

        try {
          const image = await fs.readFile(path.join(VIEWPORT_MATRIX_OUTPUT_DIR, filename));
          response.statusCode = 200;
          response.setHeader('Content-Type', 'image/png');
          response.setHeader('Content-Length', image.byteLength);
          response.setHeader('Cache-Control', 'no-store');
          response.end(image);
        } catch (error) {
          if (error && typeof error === 'object' && error.code === 'ENOENT') {
            sendJson(response, 404, { error: 'Screenshot not found.' });
          } else {
            sendJson(response, 500, { error: errorMessage(error) });
          }
        }
        return;
      }

      if (requestUrl.pathname === `${API_ROOT}/capture` && request.method === 'POST') {
        if (activeCapture) {
          sendJson(response, 409, { error: 'A viewport capture is already running.' });
          return;
        }
        activeCapture = true;

        let body;
        try {
          body = await readJsonBody(request);
        } catch (error) {
          activeCapture = false;
          sendJson(response, 400, { error: errorMessage(error) });
          return;
        }

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
        response.setHeader('Cache-Control', 'no-store');
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.flushHeaders?.();

        const writeEvent = (event) => {
          if (!response.destroyed && !response.writableEnded) {
            response.write(`${JSON.stringify(event)}\n`);
          }
        };

        try {
          const address = server.httpServer?.address();
          const port = typeof address === 'object' && address ? address.port : 3008;
          await captureViewportMatrix({
            target: body.target,
            // Keep the fixture and local OV25 iframe on the same hostname family.
            // The linked configurator derives its own :3000 URL from this host.
            baseUrl: `http://localhost:${port}`,
            settleMs: body.settleMs,
            onProgress: writeEvent,
          });
        } catch (error) {
          writeEvent({ type: 'error', error: errorMessage(error) });
        } finally {
          activeCapture = false;
          if (!response.writableEnded) response.end();
        }
        return;
      }

      next();
    });
  };

  return {
    name: 'ov25-viewport-matrix',
    configureServer: installMiddleware,
    configurePreviewServer: installMiddleware,
  };
}

function sendJson(response, status, value) {
  const payload = JSON.stringify(value);
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Content-Length', Buffer.byteLength(payload));
  response.setHeader('Cache-Control', 'no-store');
  response.end(payload);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let length = 0;
    let rejected = false;

    request.on('data', (chunk) => {
      if (rejected) return;
      length += chunk.length;
      if (length > 32_768) {
        rejected = true;
        reject(new Error('Capture request is too large.'));
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      if (rejected) return;
      try {
        const rawBody = Buffer.concat(chunks).toString('utf8');
        resolve(rawBody ? JSON.parse(rawBody) : {});
      } catch {
        reject(new Error('Capture request must contain valid JSON.'));
      }
    });
    request.on('error', reject);
  });
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
