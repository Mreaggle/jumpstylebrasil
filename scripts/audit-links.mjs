import fs from "node:fs";
import path from "node:path";

const linksManifest = readJson("manifests/source-links.json");
const siteData = readJson("src/data/site-data.json");
const siteBase = (siteData.site.base || "/").replace(/\/$/, "");

const corpus = [
  readIfExists("src/data/site-data.json"),
  fs.existsSync("dist") ? collectFiles("dist", ".html").map((file) => fs.readFileSync(file, "utf8")).join("\n") : ""
].join("\n");

const missing = linksManifest.unique_external_urls.filter((url) => !corpus.includes(url));
const badInternal = [...corpus.matchAll(/href="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((href) => href.startsWith("/") && !href.startsWith("//"))
  .filter((href) => !existsRoute(href));

if (missing.length || badInternal.length) {
  if (missing.length) console.error(`URLs externas ausentes:\n${missing.join("\n")}`);
  if (badInternal.length) console.error(`Links internos invalidos:\n${[...new Set(badInternal)].join("\n")}`);
  process.exit(1);
}

console.log(`audit:links ok - ${linksManifest.unique_external_urls.length} URLs externas preservadas`);

function readIfExists(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function collectFiles(dir, ext) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(full, ext));
    if (entry.isFile() && full.endsWith(ext)) files.push(full);
  }
  return files;
}

function existsRoute(href) {
  let route = href;
  if (siteBase && route.startsWith(siteBase)) route = route.slice(siteBase.length) || "/";
  if (route.startsWith("/assets/") || route.startsWith("/reference-renders/") || route === "/favicon.svg" || route === "/favicon.png") {
    return fs.existsSync(path.join("dist", route));
  }
  if (route === "/") return fs.existsSync("dist/index.html");
  if (route === "/404.html") return fs.existsSync("dist/404.html");
  return fs.existsSync(path.join("dist", route, "index.html"));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
