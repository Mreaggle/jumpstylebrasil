import fs from "node:fs";
const originalContent = readJson("src/data/original-content.json");
const sourceContent = readJson("manifests/source-content-by-page.json");
const sourceByPage = new Map(sourceContent.pages.map((page) => [page.page, page]));
const missing = [];

for (const page of originalContent.pages) {
  const source = sourceByPage.get(page.page);
  if (!source || normalize(source.text) !== normalize(page.text)) {
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

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
