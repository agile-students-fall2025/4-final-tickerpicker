import http from "http";
import https from "https";
import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONT_DIR = __dirname;
const PORT = process.env.FRONTEND_PORT || 5173;

const API_TARGET = process.env.API_TARGET || "http://localhost:3001";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function send404(res) {
  res.statusCode = 404;
  res.end("Not found");
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
  createReadStream(filePath).pipe(res);
}

function proxyApi(req, res) {
  const target = new URL(API_TARGET);
  const client = target.protocol === "https:" ? https : http;

  const options = {
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port,
    method: req.method,
    path: req.url,
    headers: {
      ...req.headers,
      host: target.host,
    },
  };

  const pReq = client.request(options, (pRes) => {
    res.writeHead(pRes.statusCode || 500, pRes.headers);
    pRes.pipe(res, { end: true });
  });

  pReq.on("error", (err) => {
    res.statusCode = 502;
    res.end("Bad gateway: " + err.message);
  });

  req.pipe(pReq, { end: true });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // 1.api proxy
  if (url.pathname.startsWith("/api")) {
    return proxyApi(req, res);
  }

  // 2.parse static file path
  let filePath;
  if (url.pathname === "/") {
    filePath = path.join(FRONT_DIR, "index.html");
  } else {
    const safePath = url.pathname.replace(/^\/+/, "");
    filePath = path.join(FRONT_DIR, safePath);
  }

  if (!filePath.startsWith(FRONT_DIR)) {
    return send404(res);
  }

  // 3. if file exists then return directly
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    return serveFile(res, filePath);
  }

  // 4.React Router SPA fallback
  if (!path.extname(url.pathname)) {
    const idx = path.join(FRONT_DIR, "index.html");
    if (existsSync(idx)) return serveFile(res, idx);
  }

  return send404(res);
});

server.listen(PORT, () => {
  console.log(`Front-end server: http://localhost:${PORT}`);
  console.log(`Proxy: /api -> ${API_TARGET}`);
});
