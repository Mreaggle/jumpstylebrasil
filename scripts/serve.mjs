import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const dist = path.join(root, "dist");
const port = Number(process.env.PORT || 4173);
const siteData = JSON.parse(fs.readFileSync(path.join(root, "src/data/site-data.json"), "utf8"));
const base = (siteData.site.base || "/").replace(/\/$/, "");

if (!fs.existsSync(dist)) {
  execFileSync(process.execPath, ["scripts/build.mjs"], { stdio: "inherit" });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const file = resolveFile(url.pathname);
  if (!file || !file.startsWith(dist) || !fs.existsSync(file)) {
    sendFile(path.join(dist, "404.html"), response, 404);
    return;
  }
  sendFile(file, response, 200);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`preview: http://127.0.0.1:${port}${base}/`);
});

function resolveFile(pathname) {
  let clean = decodeURIComponent(pathname).replace(/\/+/g, "/");
  if (base && clean.startsWith(base)) clean = clean.slice(base.length) || "/";
  if (clean.endsWith("/")) return path.join(dist, clean, "index.html");
  const direct = path.join(dist, clean);
  if (path.extname(direct)) return direct;
  return path.join(dist, clean, "index.html");
}

function sendFile(file, response, status) {
  const ext = path.extname(file);
  const type = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".xml": "application/xml; charset=utf-8"
  }[ext] || "application/octet-stream";
  response.writeHead(status, { "content-type": type });
  response.end(fs.readFileSync(file));
}
