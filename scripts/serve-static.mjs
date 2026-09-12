import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

const root = resolve("out");
const port = Number(process.env.PORT || 5173);
const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".woff2": "font/woff2", ".ico": "image/x-icon" };
await stat(resolve(root, "index.html"));
createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405); res.end(); return; }
  try {
    let pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (base) {
      if (pathname !== base && !pathname.startsWith(base + "/")) { res.writeHead(404); res.end(); return; }
      pathname = pathname.slice(base.length);
    }
    let target = resolve(root, "." + (pathname || "/"));
    if (target !== root && !target.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    if ((await stat(target)).isDirectory()) target = resolve(target, "index.html");
    const info = await stat(target);
    const headers = { "Content-Type": extname(target) === ".mp4" ? "video/mp4" : types[extname(target)] || "application/octet-stream", "Content-Length": info.size, "X-Content-Type-Options": "nosniff", "Accept-Ranges": "bytes" };
    const range = req.method === "GET" && req.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      let start = match?.[1] ? Number(match[1]) : 0;
      let end = match?.[2] ? Number(match[2]) : info.size - 1;
      if (match && !match[1] && match[2]) { start = Math.max(0, info.size - Number(match[2])); end = info.size - 1; }
      if (!match || (!match[1] && !match[2]) || start >= info.size || start > end) {
        res.writeHead(416, { "Content-Range": `bytes */${info.size}` }); res.end(); return;
      }
      end = Math.min(end, info.size - 1);
      res.writeHead(206, { ...headers, "Content-Length": end - start + 1, "Content-Range": `bytes ${start}-${end}/${info.size}` });
      createReadStream(target, { start, end }).pipe(res); return;
    }
    res.writeHead(200, headers);
    if (req.method === "HEAD") res.end(); else createReadStream(target).pipe(res);
  } catch {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    if (req.method === "HEAD") res.end(); else createReadStream(resolve(root, "404.html")).pipe(res);
  }
}).listen(port, "127.0.0.1", () => console.log("Aphelion static preview: http://localhost:" + port + base + "/"));
