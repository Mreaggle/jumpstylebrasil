import fs from "node:fs";
import path from "node:path";

const dist = path.join(process.cwd(), "dist");
const originalContent = readJson("src/data/original-content.json");
const corpus = fs.existsSync(dist)
  ? collectFiles(dist, ".html").map((file) => fs.readFileSync(file, "utf8")).join("\n")
  : fs.readFileSync("src/data/original-content.json", "utf8");

const normalizedCorpus = normalize(corpus);
const missing = [];

for (const page of originalContent.pages) {
  const block = normalize(page.text);
  if (!normalizedCorpus.includes(block)) {
    missing.push(`Pagina ${page.page} (${page.title})`);
  }
}

if (missing.length) {
  console.error("Conteudo original omitido:");
  console.error(missing.join("\n"));
  process.exit(1);
}

console.log(`audit:content ok - ${originalContent.pages.length} paginas preservadas`);

function normalize(value) {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
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

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
