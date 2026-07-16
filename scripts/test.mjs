import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const siteData = JSON.parse(fs.readFileSync("src/data/site-data.json", "utf8"));
const junData = JSON.parse(fs.readFileSync("src/data/jun-data.json", "utf8"));
const globalTimeline = fs.readFileSync("src/data/global-timeline.md", "utf8");
const fullTimelineEvents = [...globalTimeline.matchAll(/^[ ]{2}-[ ]+(.+)$/gm)].map((match) => match[1]);

execFileSync(process.execPath, ["scripts/build.mjs"], { stdio: "inherit" });

const errors = [];
for (const page of siteData.pages) {
  const file = page.route === "/" ? "dist/index.html" : path.join("dist", page.route, "index.html");
  if (!fs.existsSync(file)) errors.push(`HTML ausente: ${page.route}`);
  const html = fs.readFileSync(file, "utf8");
  if (!html.includes('name="viewport"')) errors.push(`Viewport ausente: ${page.route}`);
  if (!html.includes("data-menu-button")) errors.push(`Menu mobile ausente: ${page.route}`);
  if (html.includes("Texto original preservado") || html.includes("Registro original")) errors.push(`Texto de bastidor exposto: ${page.route}`);
}

const css = fs.readFileSync("dist/assets/site.css", "utf8");
if (!css.includes("prefers-reduced-motion")) errors.push("CSS sem prefers-reduced-motion");
if (!css.includes("overflow-x: hidden")) errors.push("CSS sem protecao contra overflow horizontal");
if (!css.includes('font-family: "Handjet"')) errors.push("CSS sem tipografia de identidade");

const home = fs.readFileSync("dist/index.html", "utf8");
if (!home.includes('/assets/site.css')) errors.push("Build sem base path de dominio customizado");
if (home.includes('/jumpstylebrasil/')) errors.push("Build ainda referencia o antigo project path /jumpstylebrasil/");
if (!home.includes('data-beat-stage') || !home.includes('data-bpm="180"')) errors.push("Hero sem controle reativo de BPM");
if (!home.includes("data-bpm-readout") || (home.match(/<i>[1-4]<\/i>/g) || []).length !== 4) errors.push("Hero sem contador de compasso 4/4");
if (!home.includes('assets/jumper-logo.png')) errors.push("Logo oficial ausente no HTML");
if (!home.includes('class="mobile-dock"')) errors.push("Dock mobile ausente");
if (!home.includes('class="social-rail"') || !home.includes("social-whatsapp") || !home.includes("social-discord")) errors.push("Atalhos sociais fixos ausentes");
if ((home.match(/class="signal-sequence"/g) || []).length !== 2) errors.push("Ticker superior sem sequencia duplicada para loop continuo");
if (!fs.existsSync("dist/assets/jumper-logo.png") || !fs.existsSync("dist/favicon.png")) errors.push("Logo nao copiado para o build");
if (home.includes("contrato de migracao") || home.includes("evidencia visual")) errors.push("Home contem linguagem tecnica de migracao");

const mainJs = fs.readFileSync("dist/assets/main.js", "utf8");
if (!mainJs.includes("const measureSeconds = beatSeconds * 4")) errors.push("Controle de BPM sem compasso 4/4");
if (!css.includes("logo-kick-beat var(--beat-speed)") || css.includes("logo-kick-4")) errors.push("Logo nao executa um salto completo por beat");

const fbs = fs.readFileSync("dist/fireborn-squad/index.html", "utf8");
if (!fbs.includes('class="fbs-page"')) errors.push("Tema exclusivo FBS ausente");
if (!fbs.includes("data-fbs-ignite") || !fbs.includes("data-fbs-filter")) errors.push("Interacoes FBS ausentes");
if ((fbs.match(/data-fbs-card/g) || []).length !== 28) errors.push("Roster FBS incompleto no HTML");
if (!fs.existsSync("dist/assets/fireborn-squad.png")) errors.push("Brasao FBS nao copiado para o build");
if (!fbs.includes("A Fênix deixa rastro")) errors.push("Mascote Fenix ausente da narrativa FBS");
if (!/fbs-member is-desertor[\s\S]*fbs-status is-out[\s\S]*<strong>Blackzin<\/strong><small>Desertor<\/small>/.test(fbs)) {
  errors.push("Blackzin deve aparecer com status visual de desertor no registro FBS");
}

const jun = fs.readFileSync("dist/JUN/index.html", "utf8");
if (!jun.includes('<html lang="en">') || !jun.includes('class="jun-page"')) errors.push("Tema exclusivo em ingles da JUN ausente");
if (!jun.includes("THE WORLD&#39;S LARGEST JUMPSTYLE MUSEUM")) errors.push("Posicionamento principal da JUN ausente");
if (!jun.includes('assets/jun-logo.png') || !fs.existsSync("dist/assets/jun-logo.png")) errors.push("Logo JUN nao copiada para o build");
if (!fs.existsSync("dist/assets/fonts/PixelOperator.woff") || !fs.existsSync("dist/assets/fonts/PixelOperator-Bold.woff")) errors.push("Pixel Operator nao copiada para o build");
if ((jun.match(/data-jun-event/g) || []).length !== junData.timeline.length) errors.push("Timeline JUN incompleta no HTML");
if ((jun.match(/data-jun-full-event/g) || []).length !== fullTimelineEvents.length) errors.push("Global Timeline integral incompleta no HTML");
if (!jun.includes('data-jun-view="complete"') || !jun.includes('id="complete-archive"') || !jun.includes("data-jun-full-search")) errors.push("Guia integral da Global Timeline ausente");
if ((jun.match(/class="jun-country"/g) || []).length !== junData.countries.length) errors.push("Arquivos nacionais JUN incompletos no HTML");
if ((jun.match(/class="jun-figure"/g) || []).length !== junData.figures.length) errors.push("Figuras historicas JUN incompletas no HTML");
if (!jun.includes("data-jun-search") || !jun.includes("data-jun-country") || !jun.includes("data-jun-era")) errors.push("Filtros da timeline JUN ausentes");
if (!jun.includes('"@type":"CollectionPage"') || !jun.includes('"@type":"ItemList"')) errors.push("Dados estruturados da JUN ausentes");
if (!jun.includes('<link rel="canonical" href="https://jumpstyle.com.br/JUN/">')) errors.push("Canonical da JUN incorreto");
if (!fs.existsSync("dist/JUN/llms.txt") || !fs.readFileSync("dist/JUN/llms.txt", "utf8").includes("## Complete Global Timeline source")) errors.push("Guia integral legivel por agentes da JUN ausente");
if (!fs.existsSync("dist/JUN/global-timeline.md") || fs.readFileSync("dist/JUN/global-timeline.md", "utf8") !== globalTimeline) errors.push("Markdown integral da Global Timeline nao foi preservado no build");
const junVisibleText = normalizeTimelineText(htmlToText(jun));
for (const event of fullTimelineEvents) {
  const expected = normalizeTimelineText(event.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replaceAll("`", ""));
  if (expected && !junVisibleText.includes(expected)) errors.push(`Registro integral ausente do HTML: ${expected.slice(0, 90)}`);
}
for (const match of globalTimeline.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)) {
  if (!jun.includes(match[1].replaceAll("&", "&amp;"))) errors.push(`URL da Global Timeline ausente do HTML: ${match[1]}`);
}
if (jun.includes("JUN-whatsapp-chat") || fs.existsSync("dist/JUN-whatsapp-chat.txt") || fs.existsSync("dist/JUN/JUN-whatsapp-chat.txt")) errors.push("Export privado da JUN exposto no build");
if (!home.includes('href="/JUN/"')) errors.push("Home sem acesso local para a JUN");

const creators = fs.readFileSync("dist/criadores/index.html", "utf8");
if (!creators.includes("Creators brasileiros") || creators.includes("@nakpovs")) errors.push("Pagina Creators com titulo ou lista incorreta");
if ((creators.match(/class="creator-card"/g) || []).length !== 6) errors.push("Pagina Creators deve exibir seis perfis");

const dance = fs.readFileSync("dist/como-dancar/index.html", "utf8");
if (!dance.includes(siteData.externalLinks.youtubePlaylists.url)) errors.push("Tutoriais avancados sem playlist");
if (dance.includes(siteData.externalLinks.advancedTiktok.url) || dance.includes(siteData.externalLinks.mreaggleTiktok.url)) errors.push("Links individuais avancados ainda expostos");

const faq = fs.readFileSync("dist/faq/index.html", "utf8");
if (!faq.includes("data-faq-filter") || !faq.includes("data-faq-item")) errors.push("FAQ sem filtro/accordions");

const roadmap = fs.readFileSync("dist/roadmap/index.html", "utf8");
if (!roadmap.includes("data-roadmap-check")) errors.push("Roadmap sem checklist reativo");

if (!fs.existsSync("dist/404.html")) errors.push("404.html ausente");
if (fs.existsSync("dist/reference-renders")) errors.push("Evidencias internas copiadas para o site publico");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("test: ok");

function htmlToText(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("↗", " ");
}

function normalizeTimelineText(text) {
  return text.replace(/\s+/g, " ").trim();
}
