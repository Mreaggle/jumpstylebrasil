import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const siteData = JSON.parse(fs.readFileSync("src/data/site-data.json", "utf8"));

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
if (!home.includes('/jumpstylebrasil/assets/site.css')) errors.push("Build sem base path da modalidade B");
if (!home.includes('data-beat-stage') || !home.includes('data-bpm="180"')) errors.push("Hero sem controle reativo de BPM");
if (!home.includes("data-bpm-readout") || (home.match(/<i>[1-4]<\/i>/g) || []).length !== 4) errors.push("Hero sem contador de compasso 4/4");
if (!home.includes('assets/jumper-logo.png')) errors.push("Logo oficial ausente no HTML");
if (!home.includes('class="mobile-dock"')) errors.push("Dock mobile ausente");
if (!home.includes('class="social-rail"') || !home.includes("social-whatsapp") || !home.includes("social-discord")) errors.push("Atalhos sociais fixos ausentes");
if (!fs.existsSync("dist/assets/jumper-logo.png") || !fs.existsSync("dist/favicon.png")) errors.push("Logo nao copiado para o build");
if (home.includes("contrato de migracao") || home.includes("evidencia visual")) errors.push("Home contem linguagem tecnica de migracao");

const mainJs = fs.readFileSync("dist/assets/main.js", "utf8");
if (!mainJs.includes("const measureSeconds = beatSeconds * 4")) errors.push("Controle de BPM sem compasso 4/4");
if (!css.includes("logo-kick-4") || css.includes("@keyframes logo-kick {")) errors.push("Animacao do logo nao representa os kicks verticalmente");

const fbs = fs.readFileSync("dist/fireborn-squad/index.html", "utf8");
if (!fbs.includes('class="fbs-page"')) errors.push("Tema exclusivo FBS ausente");
if (!fbs.includes("data-fbs-ignite") || !fbs.includes("data-fbs-filter")) errors.push("Interacoes FBS ausentes");
if ((fbs.match(/data-fbs-card/g) || []).length !== 28) errors.push("Roster FBS incompleto no HTML");
if (!fs.existsSync("dist/assets/fireborn-squad.png")) errors.push("Brasao FBS nao copiado para o build");
if (!fbs.includes("A Fênix deixa rastro")) errors.push("Mascote Fenix ausente da narrativa FBS");

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
