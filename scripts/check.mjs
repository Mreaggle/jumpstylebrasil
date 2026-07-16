import fs from "node:fs";

const siteData = readJson("src/data/site-data.json");
const junData = readJson("src/data/jun-data.json");
const originalContent = readJson("src/data/original-content.json");
const linksManifest = readJson("manifests/source-links.json");

const errors = [];
const routes = new Set(siteData.pages.map((page) => page.route));

for (const route of ["/", "/all-star/", "/historia/", "/como-dancar/", "/roadmap/", "/manifesto/", "/musicas/", "/criadores/", "/fireborn-squad/", "/JUN/", "/faq/"]) {
  if (!routes.has(route)) errors.push(`Rota obrigatoria ausente: ${route}`);
}

if (siteData.fbsTeam.members.length !== 28) errors.push("Registro FBS deve conter 28 membros");
if (siteData.fbsTeam.members.filter((member) => member.active).length !== 21) errors.push("Registro FBS deve conter 21 membros ativos");
if (siteData.fbsTeam.members.filter((member) => !member.active).length !== 7) errors.push("Registro FBS deve conter 7 desertores");
const blackzin = siteData.fbsTeam.members.find((member) => member.name === "Blackzin");
if (!blackzin) errors.push("Blackzin ausente do registro FBS");
if (blackzin?.active || !blackzin?.titles.includes("desertor")) errors.push("Blackzin deve constar como desertor inativo na FBS");
if (!fs.existsSync("fbs.png")) errors.push("Brasao FBS ausente na raiz");
if (!fs.existsSync("JUN LOGO.png")) errors.push("Logo JUN ausente na raiz");
if (!fs.existsSync("src/assets/fonts/PixelOperator.woff") || !fs.existsSync("src/assets/fonts/PixelOperator-Bold.woff")) errors.push("Fonte Pixel Operator ausente");

if (junData.timeline.length < 25) errors.push("Timeline JUN deve conter pelo menos 25 marcos globais");
if (junData.countries.length !== 20) errors.push("JUN deve mapear os 20 paises presentes nos arquivos e no Key Figures");
if (junData.figures.length < 18) errors.push("JUN deve exibir pelo menos 18 figuras historicas");
for (const event of junData.timeline) {
  if (!event.year || !event.country || !event.title || !event.text || !event.url) errors.push(`Marco JUN incompleto: ${event.title || "sem titulo"}`);
}

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
