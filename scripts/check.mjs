import fs from "node:fs";

const siteData = readJson("src/data/site-data.json");
const originalContent = readJson("src/data/original-content.json");
const linksManifest = readJson("manifests/source-links.json");

const errors = [];
const routes = new Set(siteData.pages.map((page) => page.route));

for (const route of ["/", "/all-star/", "/historia/", "/como-dancar/", "/roadmap/", "/manifesto/", "/musicas/", "/criadores/", "/fireborn-squad/", "/faq/"]) {
  if (!routes.has(route)) errors.push(`Rota obrigatoria ausente: ${route}`);
}

if (siteData.fbsTeam.members.length !== 28) errors.push("Registro FBS deve conter 28 membros");
if (siteData.fbsTeam.members.filter((member) => member.active).length !== 22) errors.push("Registro FBS deve conter 22 membros ativos");
if (siteData.fbsTeam.members.filter((member) => !member.active).length !== 6) errors.push("Registro FBS deve conter 6 desertores");
if (!fs.existsSync("fbs.png")) errors.push("Brasao FBS ausente na raiz");

for (const page of originalContent.pages) {
  if (!page.text || page.text.length < 5) errors.push(`Pagina original sem texto: ${page.page}`);
  if (!routes.has(page.route)) errors.push(`Pagina original sem rota mapeada: ${page.page}`);
}

const dataText = JSON.stringify(siteData);
for (const forbidden of ["[Event or Contribution 1]", "[Brief Overview of Contributions]", "href=\"#\""]) {
  if (dataText.includes(forbidden)) errors.push(`Placeholder proibido encontrado: ${forbidden}`);
}

for (const url of linksManifest.unique_external_urls) {
  if (!dataText.includes(url)) errors.push(`URL externa ausente dos dados do site: ${url}`);
}

for (let page = 1; page <= 9; page += 1) {
  if (!fs.existsSync(`reference-renders/page-${page}.png`)) errors.push(`Render de referencia ausente: page-${page}.png`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("check: ok");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
