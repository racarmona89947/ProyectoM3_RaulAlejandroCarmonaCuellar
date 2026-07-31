import http from 'node:http';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from '../api/chat.js';
import characterImageHandler from '../api/character-image.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(projectRoot, 'src');
const requestedPort = Number(process.env.PORT ?? 3000);

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotEnv(path.join(projectRoot, '.env'));
loadDotEnv(path.join(projectRoot, '.env.local'));

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

async function readRequestBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function createVercelLikeResponse(response) {
  return {
    status(code) {
      response.statusCode = code;
      return this;
    },
    json(payload) {
      sendJson(response, response.statusCode || 200, payload);
    }
  };
}

function resolveFilePath(requestPath) {
  if (requestPath === '/' || requestPath === '/home' || requestPath === '/chat' || requestPath === '/about') {
    return path.join(srcRoot, 'index.html');
  }

  const srcPath = path.join(srcRoot, requestPath);

  if (existsSync(srcPath) && !srcPath.endsWith(path.sep)) {
    return srcPath;
  }

  if (existsSync(`${srcPath}.html`)) {
    return `${srcPath}.html`;
  }

  const absolutePath = path.join(projectRoot, requestPath);

  if (existsSync(absolutePath) && !absolutePath.endsWith(path.sep)) {
    return absolutePath;
  }

  if (existsSync(`${absolutePath}.html`)) {
    return `${absolutePath}.html`;
  }

  return path.join(srcRoot, 'index.html');
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost:3000');

  if (url.pathname === '/api/chat') {
    try {
      const body = await readRequestBody(request);
      const fakeRequest = {
        method: request.method,
        on(event, callback) {
          if (event === 'data') {
            callback(Buffer.from(JSON.stringify(body)));
          }
          if (event === 'end') {
            callback();
          }
          return this;
        }
      };

      await handler(fakeRequest, createVercelLikeResponse(response));
    } catch (error) {
      sendJson(response, 500, { error: error instanceof Error ? error.message : 'Error interno del servidor.' });
    }

    return;
  }

  if (url.pathname === '/api/character-image') {
    const fakeRequest = {
      method: request.method,
      url: request.url
    };

    const fakeResponse = {
      statusCode: 200,
      headers: {},
      status(code) {
        this.statusCode = code;
        return this;
      },
      setHeader(name, value) {
        this.headers[name] = value;
      },
      json(payload) {
        sendJson(response, this.statusCode || 200, payload);
      },
      end(body) {
        response.writeHead(this.statusCode || 200, this.headers);
        response.end(body);
      }
    };

    await characterImageHandler(fakeRequest, fakeResponse);
    return;
  }

  const filePath = resolveFilePath(url.pathname);

  try {
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] ?? 'application/octet-stream';

    response.writeHead(200, { 'Content-Type': contentType });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not Found');
  }
});

function listenOnAvailablePort(port) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off('error', onError);

      if (error.code === 'EADDRINUSE') {
        resolve(listenOnAvailablePort(port + 1));
        return;
      }

      reject(error);
    };

    server.once('error', onError);

    server.listen(port, () => {
      server.off('error', onError);
      resolve(port);
    });
  });
}

const port = await listenOnAvailablePort(requestedPort);

console.log(`Simpsons Chat running at http://localhost:${port}`);
