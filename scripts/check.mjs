import crypto from "node:crypto";
import fs from "node:fs";

const siteData = readJson("src/data/site-data.json");
const junData = readJson("src/data/jun-data.json");
const translationData = readJson("src/data/translation-languages.json");
const globalTimeline = fs.readFileSync("src/data/global-timeline.md", "utf8");
const originalContent = readJson("src/data/original-content.json");
const linksManifest = readJson("manifests/source-links.json");
const junSourceManifest = readJson("manifests/jun-source-manifest.json");

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
const globalEventCount = (globalTimeline.match(/^[ ]{2}-[ ]+/gm) || []).length;
if (globalEventCount < junData.timeline.length) errors.push(`Global Timeline integral nao pode ter menos registros que a selecao editorial; encontrados: ${globalEventCount}`);
const globalSource = junSourceManifest.priority_sources.find((source) => source.path === "JumpstyleTimeline/Global/global-timeline.md");
if (!globalSource) {
  errors.push("Manifesto JUN nao declara a Global Timeline canonica");
} else if (gitBlobSha(globalTimeline) !== globalSource.observed_blob_sha) {
  errors.push("Global Timeline local diverge do blob canonico declarado no manifesto JUN");
}
if ((globalTimeline.match(/^#### \d{4}/gm) || []).length < 30) errors.push("Global Timeline integral perdeu secoes anuais");

if (junData.timeline.length !== 50) errors.push("Selecao editorial JUN deve conter exatamente 50 marcos globais de alto impacto");
if (junData.countries.length !== 250) errors.push("JUN deve expor os 249 registros ISO e Kosovo (XK)");
if (translationData.languages.length !== 194) errors.push("Tradutor JUN deve expor os 194 idiomas suportados no catalogo oficial usado");
if (translationData.languages.some((language, index, languages) => index > 0 && languages[index - 1].name.localeCompare(language.name, "en") > 0)) errors.push("Idiomas do tradutor JUN devem permanecer em ordem alfabetica");
if (junData.figures.length !== 50) errors.push("JUN deve exibir todas as 50 figuras historicas unicas do indice canonico");
if (!junData.figures.some((figure) => figure.name === "Mr. Covin" && figure.code === "FR")) errors.push("Mr. Covin, da Franca, deve constar em Key Figures Worldwide");
if (junData.figures.some((figure) => figure.note.startsWith("Community-indexed figure"))) errors.push("Key Figures nao pode exibir comentarios genericos no frontend");
for (const event of junData.timeline) {
  if (!event.year || !event.country || !event.title || !event.text || !event.url || !event.impact) errors.push(`Marco JUN incompleto ou sem avaliacao de impacto: ${event.title || "sem titulo"}`);
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

function gitBlobSha(content) {
  const payload = Buffer.from(content);
  return crypto
    .createHash("sha1")
    .update(`blob ${payload.length}\0`)
    .update(payload)
    .digest("hex");
}
