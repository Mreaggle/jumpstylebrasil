import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const siteData = readJson("src/data/site-data.json");
const junData = readJson("src/data/jun-data.json");
const translationData = readJson("src/data/translation-languages.json");
const globalTimelineMarkdown = fs.readFileSync(path.join(root, "src/data/global-timeline.md"), "utf8");
const globalTimeline = parseGlobalTimeline(globalTimelineMarkdown);
const originalContent = readJson("src/data/original-content.json");
const originalByPage = new Map(originalContent.pages.map((page) => [page.page, page]));

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
copyFile("src/styles/site.css", "assets/site.css");
copyFile("src/scripts/main.js", "assets/main.js");
copyFile("width_200.png", "assets/jumper-logo.png");
copyFile("fbs.png", "assets/fireborn-squad.png");
copyFile("JUN LOGO.png", "assets/jun-logo.png");
copyFile("src/assets/fonts/PixelOperator.woff", "assets/fonts/PixelOperator.woff");
copyFile("src/assets/fonts/PixelOperator-Bold.woff", "assets/fonts/PixelOperator-Bold.woff");
copyFile("width_200.png", "favicon.png");

for (const page of siteData.pages) {
  writeRoute(page.route, renderPage(page));
}

writeRoute("/404.html", render404());
writeText("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${siteData.site.url}sitemap.xml\n`);
writeText("sitemap.xml", renderSitemap());
writeText("favicon.svg", renderFavicon());
writeText("llms.txt", renderLlmsIndex());
writeText("JUN/llms.txt", renderJunLlms());
writeText("JUN/global-timeline.md", globalTimelineMarkdown);

function copyFile(from, to) {
  const target = path.join(dist, to);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, from), target);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function writeRoute(route, html) {
  const target = route.endsWith(".html")
    ? path.join(dist, route)
    : path.join(dist, route, "index.html");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
}

function writeText(file, text) {
  const target = path.join(dist, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text);
}

function renderPage(page) {
  const isFbs = page.route === "/fireborn-squad/";
  const isJun = page.route === "/JUN/";
  const body = isFbs
    ? [renderFbsHero(page), renderFbs()].join("\n")
    : isJun
      ? [renderJunHero(), renderJun()].join("\n")
      : [renderHero(page), renderRouteContent(page)].join("\n");

  return renderShell({
    title: isJun ? "JUN | The World's Largest Jumpstyle Museum" : page.route === "/" ? siteData.site.title : `${page.title} | Jumpstyle Brasil`,
    description: page.lead,
    route: page.route,
    body
  });
}

function renderShell({ title, description, route, body }) {
  if (route === "/JUN/") return renderJunShell({ title, description, route, body });
  const canonical = new URL(route === "/" ? "" : route.slice(1), siteData.site.url).href;
  const isFbs = route === "/fireborn-squad/";
  const socialImage = isFbs ? "assets/fireborn-squad.png" : "assets/jumper-logo.png";
  const signal = isFbs
    ? ["FIREBORN SQUAD", "ORDEM DE IGNIÇÃO", "BRASIL", "DESDE 2017", "RENASCIDOS DO FOGO", "FIREBORN SQUAD", "ORDEM DE IGNIÇÃO", "BRASIL"]
    : ["JUMPSTYLE BRASIL", "OLD SCHOOL", "HARDJUMP", "ON BEAT", "POWER", "COMUNIDADE", "JUMPSTYLE BRASIL", "OLD SCHOOL"];
  const signalSequence = signal.map((item) => `<span>${item}</span>`).join("");
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="${sitePath("favicon.png")}" type="image/png">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="${siteData.site.locale}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${new URL(socialImage, siteData.site.url).href}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Handjet:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${sitePath("assets/site.css")}">
  <script type="application/ld+json">${JSON.stringify(jsonLd())}</script>
</head>
<body class="${isFbs ? "fbs-page" : ""}">
  <div class="scroll-meter" data-scroll-meter aria-hidden="true"></div>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <div class="signal-bar" aria-hidden="true"><div class="signal-track"><div class="signal-sequence">${signalSequence}</div><div class="signal-sequence">${signalSequence}</div></div></div>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="${isFbs ? sitePath("/fireborn-squad/") : sitePath()}" aria-label="${isFbs ? "Fireborn Squad" : "Jumpstyle Brasil - Início"}"><span class="brand-mark"><img src="${sitePath(isFbs ? "assets/fireborn-squad.png" : "assets/jumper-logo.png")}" alt="" width="199" height="181"></span><span class="brand-copy"><b>${isFbs ? "Fireborn" : "Jumpstyle"}</b><small>${isFbs ? "Squad // Brasil" : "Brasil"}</small></span></a>
      <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav" data-menu-button>
        <span class="menu-icon" aria-hidden="true"></span>
        <span class="sr-only">Abrir menu</span>
      </button>
      <nav id="site-nav" class="site-nav" aria-label="Principal" data-site-nav>
        ${siteData.nav.map((item) => `<a href="${sitePath(item.route)}"${item.route === route ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a>`).join("")}
      </nav>
    </div>
  </header>
  <main id="conteudo">
    ${body}
  </main>
  ${renderSocialRail()}
  ${renderMobileDock(route)}
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand"><img src="${sitePath("assets/jumper-logo.png")}" alt="" width="199" height="181"><strong>Jumpstyle Brasil</strong></div>
      <p>Movimento, memória e comunidade. A cultura Jumpstyle brasileira conectando gerações.</p>
      <div class="link-grid">
        ${externalLink("instagram", "Instagram oficial")}
        ${externalLink("whatsapp", "Grupo WhatsApp")}
        ${externalLink("discord", "Servidor Discord")}
        ${externalLink("jun", "Museu global JUN")}
      </div>
    </div>
  </footer>
  <script src="${sitePath("assets/main.js")}" defer></script>
</body>
</html>`;
}

function renderJunShell({ title, description, route, body }) {
  const canonical = new URL(route.slice(1), siteData.site.url).href;
  const socialImage = new URL("assets/jun-logo.png", siteData.site.url).href;
  const signal = ["JUMPSTYLE UNITED NATIONS", "GLOBAL TIMELINE", "DANCE ARCHIVE", "MEETINGS", "LEAGUES", "MUSIC", "KEY FIGURES", "OPEN KNOWLEDGE"];
  const signalSequence = signal.map((item) => `<span>${item}</span>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="keywords" content="Jumpstyle history, Jumpstyle timeline, Jumpstyle museum, Jumpstyle dancers, Jumpstyle meetings, Hardjump, Ownstyle, Sidejump, Tekstyle, Patrick Jumpen">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="theme-color" content="#092da8">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${canonical}">
  <link rel="icon" href="${sitePath("assets/jun-logo.png")}" type="image/png">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="Jumpstyle United Nations">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${socialImage}">
  <meta property="og:image:width" content="1080">
  <meta property="og:image:height" content="1080">
  <meta property="og:image:alt" content="Jumpstyle United Nations pixel-art emblem">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${socialImage}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${sitePath("assets/site.css")}">
  <script type="application/ld+json">${JSON.stringify(jsonLd(route))}</script>
</head>
<body class="jun-page">
  <div class="scroll-meter" data-scroll-meter aria-hidden="true"></div>
  <a class="skip-link" href="#content">Skip to content</a>
  <div class="signal-bar jun-signal" aria-hidden="true"><div class="signal-track"><div class="signal-sequence">${signalSequence}</div><div class="signal-sequence">${signalSequence}</div></div></div>
  <header class="site-header jun-header">
    <div class="header-inner">
      <a class="brand jun-brand" href="${sitePath("/JUN/")}" aria-label="Jumpstyle United Nations home"><span class="brand-mark"><img src="${sitePath("assets/jun-logo.png")}" alt="" width="1080" height="1080"></span><span class="brand-copy"><b>JUN</b><small>Jumpstyle United Nations</small></span></a>
      <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav" data-menu-button>
        <span class="menu-icon" aria-hidden="true"></span><span class="sr-only">Open menu</span>
      </button>
      <nav id="site-nav" class="site-nav jun-nav" aria-label="JUN sections" data-site-nav>
        <a href="#timeline">Timeline</a><a href="#nations">Nations</a><a href="#figures">Key figures</a><a href="#sources">Sources</a><a class="jun-back-link" href="${sitePath()}">Jumpstyle Brasil</a>
        ${renderJunTranslation()}
      </nav>
    </div>
  </header>
  <main id="content">${body}</main>
  <nav class="social-rail jun-social-rail" aria-label="JUN links">
    <a href="${junData.repositoryUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open the JUN repository"><span aria-hidden="true">GH</span></a>
    <a href="${junData.instagramUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open JUN on Instagram"><span aria-hidden="true">IG</span></a>
    <a href="${junData.timelineUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open the full global timeline"><span aria-hidden="true">TL</span></a>
  </nav>
  <nav class="mobile-dock jun-mobile-dock" aria-label="JUN shortcuts"><a href="#timeline"><span aria-hidden="true"></span>Timeline</a><a href="#nations"><span aria-hidden="true"></span>Nations</a><a href="#figures"><span aria-hidden="true"></span>Figures</a><a href="#sources"><span aria-hidden="true"></span>Sources</a><button type="button" data-dock-menu aria-label="Open full menu"><span aria-hidden="true"></span>More</button></nav>
  <footer class="site-footer jun-footer">
    <div class="footer-inner">
      <div class="footer-brand"><img src="${sitePath("assets/jun-logo.png")}" alt="" width="1080" height="1080"><strong>Jumpstyle United Nations</strong></div>
      <p>An open global archive built to preserve the culture, credit its people and give future generations a reliable place to begin.</p>
      <div class="link-grid"><a class="button secondary external" href="${junData.repositoryUrl}" target="_blank" rel="noopener noreferrer">Open repository</a><a class="button secondary external" href="${junData.timelineUrl}" target="_blank" rel="noopener noreferrer">Full timeline</a><a class="button secondary external" href="${junData.figuresUrl}" target="_blank" rel="noopener noreferrer">Key figures data</a><a class="button secondary" href="${sitePath()}">Jumpstyle Brasil</a></div>
    </div>
  </footer>
  <script src="${sitePath("assets/main.js")}" defer></script>
</body>
</html>`;
}

function renderHero(page) {
  const primary = page.primaryCta ? `<a class="button" href="${sitePath(page.primaryCta.route)}">${escapeHtml(page.primaryCta.label)}<span aria-hidden="true">→</span></a>` : "";
  const secondary = page.secondaryCta ? `<a class="button secondary" href="${sitePath(page.secondaryCta.route)}">${escapeHtml(page.secondaryCta.label)}</a>` : "";
  return `<section class="hero">
  <div class="section-inner hero-grid">
    <div class="hero-copy">
      <p class="eyebrow"><span>JSB</span>${escapeHtml(page.eyebrow)}</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="lead">${escapeHtml(page.lead)}</p>
      ${primary || secondary ? `<div class="actions">${primary}${secondary}</div>` : ""}
    </div>
    <aside class="hero-visual" aria-label="Seletor visual de batidas por minuto" data-beat-stage>
      <div class="logo-stage"><span class="orbit orbit-one"></span><span class="orbit orbit-two"></span><img src="${sitePath("assets/jumper-logo.png")}" alt="Silhueta de um jumper executando um chute" width="199" height="181"></div>
      <div class="beat-bars" aria-hidden="true">${Array.from({ length: 12 }, (_, index) => `<i style="--i:${index}"></i>`).join("")}</div>
      <div class="measure-status">
        <span class="tempo-readout" aria-live="polite"><strong data-bpm-readout>140</strong> BPM <small>4/4</small></span>
        <div class="beat-count" aria-hidden="true"><i>1</i><i>2</i><i>3</i><i>4</i></div>
      </div>
      <div class="bpm-control" role="group" aria-label="Escolha o BPM da animação">
        <button type="button" data-bpm="140" aria-pressed="true"><strong>140</strong><span>Jump</span></button>
        <button type="button" data-bpm="150" aria-pressed="false"><strong>150</strong><span>Hardstyle</span></button>
        <button type="button" data-bpm="180" aria-pressed="false"><strong>180</strong><span>Hardcore</span></button>
      </div>
    </aside>
  </div>
</section>`;
}

function renderRouteContent(page) {
  switch (page.route) {
    case "/":
      return renderHome();
    case "/all-star/":
      return renderAllStar();
    case "/historia/":
      return renderHistory();
    case "/como-dancar/":
      return renderHowTo();
    case "/roadmap/":
      return renderRoadmap();
    case "/manifesto/":
      return renderManifesto();
    case "/musicas/":
      return renderMusic();
    case "/criadores/":
      return renderCreators();
    case "/fireborn-squad/":
      return renderFbs();
    case "/JUN/":
      return renderJun();
    case "/faq/":
      return renderFaq();
    default:
      return "";
  }
}

function renderHome() {
  const quick = [
    ["Como dançar", "/como-dancar/", "Fundamentos, movimentos avançados e playlists para começar."],
    ["All-Star", "/all-star/", "Área Jumper, votação e resultados da competição."],
    ["História", "/historia/", "Da origem do Jumpstyle à comunidade global de hoje."],
    ["Músicas", "/musicas/", "BPMs, faixas marcantes e playlists para treinar."],
    ["Manifesto", "/manifesto/", "Valores, princípios e missão da comunidade."],
    ["Creators", "/criadores/", "Quem cria conteúdo e movimenta o Jumpstyle brasileiro."],
    ["Fireborn Squad", "/fireborn-squad/", "A ordem, os graus e o registro do time nacional brasileiro."],
    ["JUN", "/JUN/", "O museu global de história, encontros e figuras do Jumpstyle."]
  ];
  return `<section class="section">
  <div class="section-inner">
    <div class="section-head"><h2>Entre no passo</h2><p>Escolha seu caminho e mergulhe na cultura Jumpstyle brasileira.</p></div>
    <div class="quick-grid">${quick.map(([title, href, text], index) => `<article class="route-card" data-reveal><span class="route-number">0${index + 1}</span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(text)}</p></div><a href="${sitePath(href)}" aria-label="Abrir ${escapeHtml(title)}"><span>Abrir área</span><b aria-hidden="true">↗</b></a></article>`).join("")}</div>
  </div>
</section>
<section class="section">
  <div class="section-inner">
    <div class="section-head"><h2>Comunidade</h2><p>Encontre outros jumpers, acompanhe novidades e participe do movimento.</p></div>
    <div class="link-grid">
      ${externalLink("whatsapp", "Grupo WhatsApp")}
      ${externalLink("discord", "Servidor Discord")}
      ${externalLink("instagram", "Instagram oficial")}
      ${externalLink("tiktokHub", "Conteúdo Jumpstyle no TikTok")}
    </div>
  </div>
</section>
<section class="section">
  <div class="section-inner card-grid">
    ${card("JUN", "Explore a memória da comunidade global de Jumpstyle.", `<a class="button" href="${sitePath("/JUN/")}">Abrir museu global</a>`)}
    ${card("Timeline global", "Viaje pelos momentos que transformaram o Jumpstyle ao redor do mundo.", externalLink("junTimeline", "Ver timeline"))}
    ${card("Figuras históricas", "Conheça nomes que deixaram sua marca em diferentes gerações.", externalLink("junFigures", "Ver figuras"))}
  </div>
</section>`;
}

function renderAllStar() {
  return `<section class="section"><div class="section-inner">
    <div class="section-head"><h2>Entre no All-Star</h2><p>Acesse a área dos participantes, vote nos seus favoritos e acompanhe os resultados.</p></div>
    <div class="card-grid">
      ${card("Área Jumper", "Espaço dos participantes do All-Star.", externalLink("allStarArea", "Abrir área"))}
      ${card("Votar", "Escolha os destaques de cada round.", externalLink("allStarVote", "Votar"))}
      ${card("Resultados", "Acompanhe os rounds e seus vencedores.", externalLink("allStarResults", "Ver resultados"))}
    </div>
  </div></section>`;
}

function renderHistory() {
  return `<section class="section"><div class="section-inner">
    <div class="section-head"><h2>Linha do tempo</h2><p>Descubra como o Jumpstyle nasceu, atravessou fronteiras e ganhou novas gerações.</p></div>
    <ol class="timeline">${siteData.timeline.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
  </div></section>
  <section class="section"><div class="section-inner card-grid">
    ${card("Museu global JUN", "Explore histórias, equipes e movimentos da cena mundial.", externalLink("jun", "Abrir museu"))}
    ${card("Timeline global", "Veja a evolução do Jumpstyle em diferentes países.", externalLink("junTimeline", "Abrir timeline"))}
    ${card("Uma dança global", "Jumpstyle é uma dança digital, expressiva e competitiva que conecta jumpers do mundo inteiro.", "")}
  </div></section>`;
}

function renderHowTo() {
  return `<section class="section"><div class="section-inner">
    <div class="section-head"><h2>Trilha de aprendizado</h2><p>Comece pelas bases, evolua seus movimentos e construa seu próprio estilo.</p></div>
    <div class="card-grid">
      ${card("Tutorial fundamental", "Aprenda base, ritmo e execução desde o começo.", externalLink("fundamentalYoutube", "Assistir no YouTube"))}
      ${card("Tutoriais avançados", "Aulas e referências para ampliar seu repertório e acompanhar sua evolução.", externalLink("youtubePlaylists", "Ver tutoriais"))}
    </div>
  </div></section>
  <section class="section"><div class="section-inner">${card("Roadmap", "Acompanhe sua evolução dos fundamentos aos movimentos avançados.", `<a class="button" href="${sitePath("/roadmap/")}">Abrir roadmap</a>`)}</div></section>`;
}

function renderRoadmap() {
  return `<section class="section"><div class="section-inner">
    <div class="section-head"><h2>Sua evolução</h2><p>Marque o que você já domina e acompanhe seu progresso em cada nível.</p></div>
    <div class="roadmap">${siteData.roadmap.map((level) => `<article class="roadmap-level" data-roadmap-level>
      <div class="roadmap-top"><h3>${escapeHtml(level.level)}</h3><strong data-roadmap-count>0/${level.items.length}</strong></div>
      <div class="meter" data-roadmap-meter aria-hidden="true"></div>
      <div class="check-list">${level.items.map((item) => `<label><input data-roadmap-check type="checkbox" value="${slug(level.level)}:${slug(item)}"> ${escapeHtml(item)}</label>`).join("")}</div>
    </article>`).join("")}</div>
  </div></section>`;
}

function renderManifesto() {
  const original = originalByPage.get(6).text;
  const lines = original.split("\n").filter((line) => line.trim() && line !== "Mr.");
  return `<section class="section"><div class="section-inner">
    <div class="section-head"><h2>Índice</h2><p>Prólogo, Liberdade de Expressão, Dedicação e Evolução, Integridade e Justiça, Comunidade e Inclusão.</p></div>
    <article class="prose">${lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}</article>
  </div></section>`;
}

function renderMusic() {
  const jump = ["Holiday - Patrick Jumpen", "The Return - DJ Coone", "Madness - Mark with a K"];
  const hardstyle = ["Tonight - Headhunterz & Wildstylez ft. Noisecontrollers", "Imaginary - Brennan Heart", "Symbols - Frontliner"];
  return `<section class="section"><div class="section-inner card-grid">
    ${card("Jump / 140 BPM", "Antes da dança ganhar o mundo, Jump também era o nome do gênero musical.", jump.map((item) => `<p>${escapeHtml(item)}</p>`).join(""))}
    ${card("Hardstyle / 150 BPM", "Hardstyle aumenta a intensidade e abre espaço para movimentos mais explosivos.", hardstyle.map((item) => `<p>${escapeHtml(item)}</p>`).join(""))}
    ${card("Hardcore / 180 BPM", "Hardcore leva velocidade e energia ao treino sem abandonar as raízes Oldschool.", `${externalLink("officialPlaylist", "Playlist oficial")} ${externalLink("youtubeMusicPlaylist", "Playlist YouTube")}`)}
  </div></section>`;
}

function renderCreators() {
  return `<section class="section"><div class="section-inner">
    <div class="section-head"><h2>Creators brasileiros</h2><p>Quem transforma treino, técnica, história e vivência em conteúdo para fortalecer a comunidade brasileira de Jumpstyle.</p></div>
    <div class="creator-grid">${siteData.creators.map((name) => `<article class="creator-card"><strong>@${escapeHtml(name)}</strong><p>Creator da comunidade brasileira, compartilhando o movimento e inspirando novos jumpers.</p></article>`).join("")}</div>
  </div></section>`;
}

function renderJunHero() {
  const startYear = junData.timeline[0].year;
  const endYear = junData.timeline.at(-1).year;
  return `<section class="jun-hero">
  <div class="jun-world-lines" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
  <div class="section-inner jun-hero-grid">
    <div class="jun-hero-copy">
      <p class="jun-kicker"><span>JUN // EST. 2024</span> Open global archive</p>
      <h1><span>Jumpstyle</span> United Nations</h1>
      <p class="jun-museum-title">${escapeHtml(junData.tagline)}</p>
      <p class="lead">${escapeHtml(junData.lead)}</p>
      <div class="jun-actions"><a class="jun-button" href="#timeline">Enter the timeline <span aria-hidden="true">↓</span></a><a class="jun-button jun-button-ghost" href="#complete-archive" data-jun-open-complete>Read the complete record <span aria-hidden="true">↓</span></a></div>
    </div>
    <div class="jun-emblem" aria-label="Jumpstyle United Nations emblem">
      <span class="jun-emblem-axis" aria-hidden="true"></span>
      <img src="${sitePath("assets/jun-logo.png")}" alt="Pixel-art Jumpstyle United Nations emblem: a jumper over a blue and green globe framed by laurel branches" width="1080" height="1080">
      <p><span>Archive coordinates</span> 50.8503 N / 4.3517 E</p>
    </div>
  </div>
  <div class="jun-hero-stats" aria-label="Archive overview"><div><strong>${startYear}-${endYear}</strong><span>documented range</span></div><div><strong>${junData.timeline.length}/${globalTimeline.events.length}</strong><span>featured / full records</span></div><div><strong>${junData.countries.length}</strong><span>national archives</span></div><div><strong>${junData.figures.length}</strong><span>key figures</span></div></div>
</section>`;
}

function renderJun() {
  const countryOptions = junData.countries.map((country) => `<option value="${country.code}">${escapeHtml(country.name)}</option>`).join("");
  const documentedCountries = junData.countries.filter((country) => country.status === "research-in-progress").length;
  return `<section class="jun-section jun-timeline-section" id="timeline">
  <div class="section-inner">
    <p class="jun-section-code">01 // THE GLOBAL TIMELINE</p>
    <div class="jun-section-heading"><h2>From club floors to a world network</h2><p>Every milestone links back to a record, publication, video or preserved community page. The full research timeline remains open for national perspectives and new evidence.</p></div>
    <div class="jun-view-tabs" role="tablist" aria-label="Global Timeline views">
      <button type="button" role="tab" aria-selected="true" aria-controls="jun-curated-timeline" data-jun-view="curated"><span>Curated highlights</span><small>${junData.timeline.length} milestones</small></button>
      <button type="button" role="tab" aria-selected="false" aria-controls="complete-archive" data-jun-view="complete"><span>Complete record</span><small>${globalTimeline.events.length} detailed entries</small></button>
    </div>
    <div id="jun-curated-timeline" role="tabpanel" data-jun-view-panel="curated">
      <div class="jun-timeline-tools">
      <div class="jun-era-filter" role="group" aria-label="Filter timeline by era"><button type="button" data-jun-era="all" aria-pressed="true">All eras</button>${junData.eras.map((era) => `<button type="button" data-jun-era="${era.id}" aria-pressed="false"><span>${escapeHtml(era.label)}</span><small>${era.years}</small></button>`).join("")}</div>
      <div class="jun-search-row"><label><span>Search the archive</span><input type="search" data-jun-search placeholder="Name, event, country or year"></label><label><span>National view</span><select data-jun-country><option value="all">All countries</option>${countryOptions}</select></label></div>
      </div>
      <div class="jun-timeline-meta"><p data-jun-count>${junData.timeline.length} milestones on view</p><button type="button" data-jun-switch-complete>Open all ${globalTimeline.events.length} detailed records <span aria-hidden="true">→</span></button></div>
      <div class="jun-timeline" data-jun-timeline>${junData.timeline.map(renderJunEvent).join("")}</div>
      <p class="jun-empty" data-jun-empty hidden>No milestones match this view.</p>
    </div>
    <div id="complete-archive" class="jun-full-archive" role="tabpanel" data-jun-view-panel="complete" hidden>
      ${renderJunFullTimeline()}
    </div>
  </div>
</section>
<section class="jun-section jun-nations-section" id="nations">
  <div class="section-inner">
    <p class="jun-section-code">02 // NATIONAL MEMORY</p>
    <div class="jun-section-heading"><h2>One history, many points of view</h2><p>The global record is built from national histories. The catalog now provides a research structure for every ISO 3166-1 country and territory, plus Kosovo under XK, while clearly separating sourced archives from open research queues.</p></div>
    <div class="jun-nation-tools">
      <label><span>Find a national archive</span><input type="search" data-jun-nation-search placeholder="Country, territory or code"></label>
      <div class="jun-nation-filter" role="group" aria-label="Filter national archives"><button type="button" data-jun-nation-filter="all" aria-pressed="true">All <span>${junData.countries.length}</span></button><button type="button" data-jun-nation-filter="documented" aria-pressed="false">Documented <span>${documentedCountries}</span></button><button type="button" data-jun-nation-filter="pending" aria-pressed="false">Research queue <span>${junData.countries.length - documentedCountries}</span></button></div>
      <p data-jun-nation-count>${junData.countries.length} national and territorial archives on view</p>
    </div>
    <div class="jun-country-grid">${junData.countries.map(renderJunCountry).join("")}</div>
    <p class="jun-empty" data-jun-nation-empty hidden>No national archives match this view.</p>
  </div>
</section>
<section class="jun-section jun-figures-section" id="figures">
  <div class="section-inner">
    <p class="jun-section-code">03 // KEY FIGURES WORLDWIDE</p>
    <div class="jun-section-heading"><h2>The jumpers who moved the language forward</h2><p>A community-curated hall of influence across eras and countries. It is an evolving historical index, not a final ranking.</p></div>
    <div class="jun-figure-grid">${junData.figures.map(renderJunFigure).join("")}</div>
    <a class="jun-inline-link" href="${junData.figuresUrl}" target="_blank" rel="noopener noreferrer">Explore the complete Key Figures Worldwide dataset <span aria-hidden="true">↗</span></a>
  </div>
</section>
<section class="jun-section jun-sources-section" id="sources">
  <div class="section-inner">
    <p class="jun-section-code">04 // EVIDENCE NETWORK</p>
    <div class="jun-section-heading"><h2>History with a source trail</h2><p>Official labels and charts establish public milestones. Contemporary press gives cultural context. Video titles, descriptions and upload dates locate meetings. Wayback snapshots recover forums, calendars and leagues that disappeared from the live web.</p></div>
    <div class="jun-source-list">${junData.sourceTypes.map((source, index) => `<a href="${source.url}" target="_blank" rel="noopener noreferrer"><span>${String(index + 1).padStart(2, "0")}</span><div><small>${escapeHtml(source.type)} // ${escapeHtml(source.locale)}</small><strong>${escapeHtml(source.label)}</strong></div><b aria-hidden="true">↗</b></a>`).join("")}</div>
    <div class="jun-method">
      <div><span>01</span><strong>Event date</strong><p>Use the date stated in a title or description.</p></div><div><span>02</span><strong>Upload fallback</strong><p>If no event date survives, retain the upload date as an explicit approximation.</p></div><div><span>03</span><strong>Archive proof</strong><p>Preserve the original URL and the closest useful Wayback snapshot.</p></div><div><span>04</span><strong>Open review</strong><p>National contributors can add context and challenge uncertain claims.</p></div>
    </div>
  </div>
</section>
<section class="jun-final"><div class="section-inner"><img src="${sitePath("assets/jun-logo.png")}" alt="" width="1080" height="1080"><p>Jumpstyle United Nations</p><strong>Every country holds a piece.<br>The archive keeps them together.</strong><div><a class="jun-button" href="${junData.repositoryUrl}" target="_blank" rel="noopener noreferrer">Contribute on GitHub <span aria-hidden="true">↗</span></a><a class="jun-button jun-button-dark" href="#timeline">Return to timeline <span aria-hidden="true">↑</span></a></div></div></section>`;
}

function renderJunFullTimeline() {
  const years = [...new Set(globalTimeline.eras.flatMap((era) => era.years.map((year) => year.year)))];
  const anchoredYears = new Set();
  return `<div class="jun-full-head">
    <div><p>Canonical source transcription</p><h3>Every Global Timeline record</h3><p>${escapeHtml(globalTimeline.preamble)} The complete view below preserves all ${globalTimeline.events.length} detailed entries, the foundational context and empty year markers from the source Markdown.</p></div>
    <a href="${sitePath("JUN/global-timeline.md")}" target="_blank" rel="noopener noreferrer">Open raw Markdown <span aria-hidden="true">↗</span></a>
  </div>
  <div class="jun-full-tools">
    <label><span>Search all details</span><input type="search" data-jun-full-search placeholder="Person, meeting, country, track, year or source"></label>
    <p data-jun-full-count>${globalTimeline.events.length} detailed records on view</p>
  </div>
  <nav class="jun-year-nav" aria-label="Complete timeline years">${years.map((year) => `<a href="#jun-full-${year}">${year}</a>`).join("")}</nav>
  <div class="jun-full-eras">${globalTimeline.eras.map((era, index) => renderJunFullEra(era, index, anchoredYears)).join("")}</div>
  <p class="jun-empty" data-jun-full-empty hidden>No complete records match this search.</p>`;
}

function renderJunFullEra(era, eraIndex, anchoredYears) {
  return `<section class="jun-full-era" data-jun-full-era>
    <header><span>${String(eraIndex + 1).padStart(2, "0")}</span><h3>${escapeHtml(era.title)}</h3></header>
    <div>${era.years.map((year, yearIndex) => renderJunFullYear(year, yearIndex, anchoredYears)).join("")}</div>
  </section>`;
}

function renderJunFullYear(year, yearIndex, anchoredYears) {
  const shouldAnchor = !anchoredYears.has(year.year);
  if (shouldAnchor) anchoredYears.add(year.year);
  const id = shouldAnchor ? ` id="jun-full-${year.year}"` : "";
  const context = year.context.map((text) => `<blockquote data-jun-full-context>${renderTimelineInline(text)}</blockquote>`).join("");
  const yearMeta = `${year.year} ${year.context.join(" ")}`.toLowerCase();
  const records = year.events.length
    ? `<ol>${year.events.map((event) => `<li data-jun-full-event data-jun-full-searchable="${escapeHtml(`${year.year} ${event.month} ${event.markdown}`.toLowerCase())}"><span>${escapeHtml(event.month)}</span><div>${renderTimelineInline(event.markdown)}</div></li>`).join("")}</ol>`
    : `<p class="jun-full-pending">No detailed record has been added for this year yet.</p>`;
  return `<details class="jun-full-year" data-jun-full-year data-jun-full-meta="${escapeHtml(yearMeta)}"${id}${yearIndex === 0 ? " open" : ""}><summary><strong>${year.year}</strong><span>${year.events.length} ${year.events.length === 1 ? "record" : "records"}</span></summary><div class="jun-full-year-body">${context}${records}</div></details>`;
}

function renderTimelineInline(markdown) {
  let result = "";
  let cursor = 0;
  const links = /\[([^\]]+)\]\(([^)]+)\)/g;
  for (const match of markdown.matchAll(links)) {
    result += renderTimelineText(markdown.slice(cursor, match.index));
    const href = /^https?:\/\//.test(match[2])
      ? match[2]
      : `${junData.repositoryUrl}/blob/main/JumpstyleTimeline/Global/${match[2]}`;
    result += `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${renderTimelineText(match[1])}<span aria-hidden="true">↗</span></a>`;
    cursor = match.index + match[0].length;
  }
  return result + renderTimelineText(markdown.slice(cursor));
}

function renderTimelineText(text) {
  return escapeHtml(text).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function timelinePlainText(markdown) {
  return String(markdown)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replaceAll("`", "");
}

function timelineCitation(markdown) {
  return String(markdown).match(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/)?.[1];
}

function parseGlobalTimeline(markdown) {
  const eras = [];
  const events = [];
  const preamble = [];
  let era = null;
  let year = null;
  let month = "Context";
  let beforeGlobal = true;

  for (const line of markdown.split(/\r?\n/)) {
    if (/^## Global/.test(line)) {
      beforeGlobal = false;
      continue;
    }
    if (beforeGlobal && line && !line.startsWith("#")) preamble.push(line);
    const eraMatch = line.match(/^#{2,3} (?!Global)(.+)$/);
    if (eraMatch) {
      era = { title: eraMatch[1].trim(), years: [] };
      eras.push(era);
      year = null;
      continue;
    }
    const yearMatch = line.match(/^#### (\d{4})/);
    if (yearMatch) {
      if (!era) {
        era = { title: "Global context", years: [] };
        eras.push(era);
      }
      year = { year: yearMatch[1], context: [], events: [] };
      era.years.push(year);
      month = "Context";
      continue;
    }
    const monthMatch = line.match(/^\s*-\s+\*\*([^*]+)\*\*:\s*$/);
    if (monthMatch) {
      month = monthMatch[1].trim();
      continue;
    }
    if (year && /^>/.test(line)) {
      year.context.push(line.replace(/^>\s?/, ""));
      continue;
    }
    if (year && /^[ ]{2}-[ ]+/.test(line)) {
      const event = { year: year.year, month, markdown: line.replace(/^[ ]{2}-[ ]+/, "") };
      year.events.push(event);
      events.push(event);
    }
  }

  return { preamble: preamble.join(" ").trim(), eras, events };
}

function renderJunEvent(event) {
  return `<article class="jun-event" data-jun-event data-jun-era="${event.era}" data-jun-country="${event.code}">
    <time>${escapeHtml(event.year)}</time>
    <div class="jun-event-copy"><p><span>${escapeHtml(event.country)}</span>${escapeHtml(event.date)}</p><h3>${escapeHtml(event.title)}</h3><p>${escapeHtml(event.text)}</p></div>
    <a href="${event.url}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(event.source)}</span><b aria-hidden="true">↗</b></a>
  </article>`;
}

function renderJunCountry(country) {
  const documented = country.status === "research-in-progress";
  return `<article class="jun-country" data-jun-nation data-jun-nation-status="${documented ? "documented" : "pending"}" data-jun-nation-searchable="${escapeHtml(`${country.code} ${country.name}`.toLowerCase())}"><div><span>${country.code}</span><small>${documented ? "Sourced records" : "Research needed"}</small></div><h3>${escapeHtml(country.name)}</h3><p>${escapeHtml(country.focus)}</p><dl><dt>${escapeHtml(country.figuresLabel || "Key figures")}</dt><dd>${escapeHtml(country.figures)}</dd></dl><a href="${country.archive}" target="_blank" rel="noopener noreferrer">Open ${escapeHtml(country.name)} archive <span aria-hidden="true">↗</span></a></article>`;
}

function renderJunTranslation() {
  const options = translationData.languages
    .map((language) => `<option value="${escapeHtml(language.code)}">${escapeHtml(language.name)}</option>`)
    .join("");
  return `<div class="jun-translate" data-jun-translate>
    <button type="button" class="jun-translate-button" aria-expanded="false" aria-controls="jun-translate-panel" data-jun-translate-toggle><span aria-hidden="true">A/文</span>Translate</button>
    <div id="jun-translate-panel" class="jun-translate-panel" data-jun-translate-panel hidden>
      <label for="jun-translate-language">Automatic translation</label>
      <select id="jun-translate-language" data-jun-translate-language><option value="">Select a language</option>${options}</select>
      <p>Opens this page through Google Translate.</p>
    </div>
  </div>`;
}

function renderJunFigure(figure, index) {
  return `<article class="jun-figure"><span class="jun-figure-order">${String(index + 1).padStart(2, "0")}</span><div class="jun-figure-meta"><span>${figure.code}</span><small>${escapeHtml(figure.country)} // ${escapeHtml(figure.era)}</small></div><h3>${escapeHtml(figure.name)}</h3><p>${escapeHtml(figure.note)}</p><a href="${figure.url}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">▶</span> Watch archive</a></article>`;
}

function renderFbsHero(page) {
  const team = siteData.fbsTeam;
  const active = team.members.filter((member) => member.active).length;
  const praetors = team.members.filter((member) => member.titles.includes("praetor")).length;
  return `<section class="fbs-hero" data-fbs-sanctum>
  <div class="fbs-embers" aria-hidden="true">${Array.from({ length: 18 }, (_, index) => `<i style="--ember:${index}"></i>`).join("")}</div>
  <div class="section-inner fbs-hero-grid">
    <div class="fbs-hero-copy">
      <p class="fbs-kicker"><span>FBS // ${team.founded}</span>${escapeHtml(page.eyebrow)}</p>
      <h1><span>Fireborn</span> Squad</h1>
      <p class="fbs-oath">${escapeHtml(team.motto)}</p>
      <p class="lead">${escapeHtml(page.lead)}</p>
      <div class="fbs-actions">
        <a class="fbs-button" href="#ordem">Conhecer a ordem <span aria-hidden="true">↓</span></a>
        <button class="fbs-button fbs-button-ghost" type="button" data-fbs-ignite aria-pressed="false"><span class="fbs-button-flame" aria-hidden="true">◆</span> Acender o brasão</button>
      </div>
    </div>
    <div class="fbs-emblem-wrap">
      <div class="fbs-emblem-halo" aria-hidden="true"></div>
      <img src="${sitePath("assets/fireborn-squad.png")}" alt="Brasão pixel-art da Fireborn Squad, com uma grande chama laranja" width="620" height="1041">
      <p data-fbs-ignite-message aria-live="polite">A chama reconhece os que voltam a se levantar.</p>
    </div>
  </div>
  <div class="fbs-stats" aria-label="Resumo da ordem">
    <div><strong>${String(team.members.length).padStart(2, "0")}</strong><span>nomes no registro</span></div>
    <div><strong>${String(active).padStart(2, "0")}</strong><span>membros ativos</span></div>
    <div><strong>${String(praetors).padStart(2, "0")}</strong><span>Praetors</span></div>
    <div><strong>BR</strong><span>uma só bandeira</span></div>
  </div>
</section>`;
}

function renderFbs() {
  const team = siteData.fbsTeam;
  return `<section class="fbs-section fbs-intro" id="ordem">
  <div class="section-inner">
    <p class="fbs-section-code">I // ORDEM DE IGNIÇÃO</p>
    <div class="fbs-section-heading"><h2>${escapeHtml(team.name)}</h2><p>Não é uma lista aberta. É o registro de quem recebeu a responsabilidade de manter acesa a chama brasileira e representar o país dentro e fora das ligas.</p></div>
    <div class="fbs-grade-grid">${team.grades.map((grade) => `<article class="fbs-grade" data-reveal>
      <span class="fbs-grade-number">${grade.number}</span>
      <span class="fbs-grade-symbol" aria-hidden="true">${grade.symbol}</span>
      <h3>${escapeHtml(grade.name)}</h3>
      <p>${escapeHtml(grade.rule)}</p>
    </article>`).join("")}</div>
  </div>
</section>
<section class="fbs-section fbs-titles-section">
  <div class="section-inner">
    <p class="fbs-section-code">II // TÍTULOS FILOSÓFICOS</p>
    <div class="fbs-title-list">${team.titles.map((title) => `<article class="fbs-title-row">
      <span aria-hidden="true">${title.symbol}</span><h3>${escapeHtml(title.name)}</h3><p>${escapeHtml(title.rule)}</p>
    </article>`).join("")}</div>
  </div>
</section>
<section class="fbs-section fbs-registry-section" id="registro">
  <div class="section-inner">
    <p class="fbs-section-code">III // REGISTRO DOS RENASCIDOS</p>
    <div class="fbs-section-heading"><h2>Os nomes na chama</h2><p>Verde indica presença ativa na formação. Vermelho preserva no arquivo quem hoje carrega o título de Desertor.</p></div>
    <div class="fbs-filter" role="group" aria-label="Filtrar membros da Fireborn Squad">
      <button type="button" data-fbs-filter="all" aria-pressed="true">Todos</button>
      <button type="button" data-fbs-filter="active" aria-pressed="false">Ativos</button>
      <button type="button" data-fbs-filter="dominus" aria-pressed="false">🥇 Dominus</button>
      <button type="button" data-fbs-filter="revelator" aria-pressed="false">🥈 Revelator</button>
      <button type="button" data-fbs-filter="neophytus" aria-pressed="false">🥉 Neophytus</button>
      <button type="button" data-fbs-filter="praetor" aria-pressed="false">🎖️ Praetor</button>
      <button type="button" data-fbs-filter="desertor" aria-pressed="false">💀 Desertores</button>
    </div>
    <p class="fbs-result-count" data-fbs-count>${team.members.length} nomes revelados</p>
    <div class="fbs-roster" role="list">${team.members.map((member) => renderFbsMember(member)).join("")}</div>
  </div>
</section>
<section class="fbs-section fbs-legacy" id="legado">
  <div class="section-inner">
    <p class="fbs-section-code">IV // ARQUIVO DE COMBUSTÃO</p>
    <div class="fbs-section-heading"><h2>A Fênix deixa rastro</h2><p>Como a Fênix, a ordem renasce para representar o Brasil, reconectar gerações e transformar retorno em movimento coletivo.</p></div>
    <ol class="fbs-chronicle">
      <li><time>2016</time><div><strong>A centelha</strong><p>Mreaggle retorna ao Jumpstyle, convida Dourado e inicia o movimento de reencontro com a velha guarda.</p></div></li>
      <li><time>2017</time><div><strong>Nasce a Fireborn Squad</strong><p>Oito fundadores formam um time nacional para reunir os melhores jumpers de cada geração e região e defender o Brasil em ligas internacionais.</p></div></li>
      <li><time>2024</time><div><strong>Jumpstyle Never Dies</strong><p>A comunidade grava com D-Stroyer no Ibirapuera. No mês seguinte, a FBS é convidada a se apresentar ao vivo no Mais Você.</p></div></li>
      <li><time>AGORA</time><div><strong>A chama é responsabilidade</strong><p>Vinte e oito nomes compõem o registro histórico da ordem. Cada grau mede permanência; cada título registra serviço.</p></div></li>
    </ol>
  </div>
</section>
<section class="fbs-final"><div class="section-inner"><img src="${sitePath("assets/fireborn-squad.png")}" alt="" width="620" height="1041"><p>As grandes mentes por trás do Jumpstyle Brasileiro</p><strong>A Fênix não é feita de quem nunca caiu.<br>É feita de quem decidiu levantar.</strong></div></section>`;
}

function renderFbsMember(member) {
  const team = siteData.fbsTeam;
  const grade = team.grades.find((item) => item.id === member.grade);
  const titles = member.titles.map((id) => team.titles.find((item) => item.id === id)).filter(Boolean);
  const filters = [member.grade, member.active ? "active" : "desertor", ...member.titles].join(" ");
  return `<details class="fbs-member ${member.active ? "is-active" : "is-desertor"}" data-fbs-card data-fbs-tags="${filters}" role="listitem">
    <summary>
      <span class="fbs-order">${roman(member.order)}</span>
      <span class="fbs-member-main"><span class="fbs-status ${member.active ? "is-online" : "is-out"}" aria-hidden="true"></span><strong>${escapeHtml(member.name)}</strong><small>${member.active ? "Na formação" : "Desertor"}</small></span>
      <span class="fbs-member-symbols" aria-label="${escapeHtml([grade.name, ...titles.map((title) => title.name)].join(", "))}">${grade.symbol}${titles.map((title) => title.symbol).join("")}</span>
    </summary>
    <div class="fbs-member-detail"><span>Grau ${grade.number}</span><strong>${escapeHtml(grade.name)}</strong>${titles.length ? `<p>${titles.map((title) => `${title.symbol} ${escapeHtml(title.name)}`).join(" · ")}</p>` : "<p>Sem título filosófico adicional.</p>"}</div>
  </details>`;
}

function renderFaq() {
  return `<section class="section"><div class="section-inner">
    <div class="faq-tools"><label class="sr-only" for="faq-filter">Filtrar FAQ</label><input id="faq-filter" data-faq-filter type="search" placeholder="Buscar técnica, evento, história..."><span data-faq-count>${siteData.faq.length} respostas</span></div>
    <div class="faq-list">${siteData.faq.map((item, index) => `<details class="faq-item" data-faq-item ${index === 0 ? "open" : ""}><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join("")}</div>
  </div></section>`;
}

function render404() {
  return renderShell({
    title: "Página não encontrada | Jumpstyle Brasil",
    description: "Esta página não foi encontrada na Jumpstyle Brasil.",
    route: "/404.html",
    body: `<section class="hero"><div class="section-inner"><p class="eyebrow">404</p><h1>Página fora do beat</h1><p class="lead">Não encontramos este caminho. Volte ao início ou explore as perguntas mais frequentes.</p><div class="actions"><a class="button" href="${sitePath()}">Início</a><a class="button secondary" href="${sitePath("/faq/")}">FAQ</a></div></div></section>`
  });
}

function renderSitemap() {
  const urls = siteData.pages.map((page) => `<url><loc>${new URL(page.route === "/" ? "" : page.route.slice(1), siteData.site.url).href}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>\n`;
}

function renderFavicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#070b12"/><path d="M10 42h14V14h10v28c0 8-5 12-13 12-4 0-8-1-11-3l4-9c2 1 4 2 6 2 3 0 4-1 4-5V24H10V14h24v40H10V42Zm30 1c3 2 7 3 10 3 3 0 5-1 5-3 0-6-18-2-18-17 0-8 7-13 16-13 5 0 10 1 14 4l-5 9c-3-2-6-3-9-3s-5 1-5 3c0 6 18 2 18 17 0 8-7 13-17 13-6 0-12-2-16-5l7-8Z" fill="#00f0c8"/></svg>`;
}

function card(title, text, extra = "") {
  return `<article class="card"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(text)}</p>${extra}</article>`;
}

function externalLink(key, label = undefined) {
  const link = siteData.externalLinks[key];
  return `<a class="button secondary external" href="${link.url}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label || link.label)} - abre site externo">${escapeHtml(label || link.label)}</a>`;
}

function renderSocialRail() {
  const items = [
    ["whatsapp", "WA", "Entrar no grupo do WhatsApp"],
    ["instagram", "IG", "Abrir o Instagram da comunidade"],
    ["discord", "DC", "Entrar no servidor do Discord"]
  ];
  return `<nav class="social-rail" aria-label="Comunidade nas redes">${items.map(([key, mark, label]) => {
    const link = siteData.externalLinks[key];
    return `<a class="social-${key}" href="${link.url}" target="_blank" rel="noopener noreferrer" aria-label="${label}" data-label="${label}"><span aria-hidden="true">${mark}</span></a>`;
  }).join("")}</nav>`;
}

function renderMobileDock(route) {
  if (route === "/fireborn-squad/") {
    return `<nav class="mobile-dock fbs-mobile-dock" aria-label="Atalhos Fireborn Squad"><a href="${sitePath()}" class="fbs-dock-back"><span aria-hidden="true"></span>JSB</a><a href="#ordem"><span aria-hidden="true"></span>Ordem</a><a href="#registro"><span aria-hidden="true"></span>Registro</a><a href="#legado"><span aria-hidden="true"></span>Legado</a><button type="button" data-dock-menu aria-label="Abrir menu completo"><span aria-hidden="true"></span>Mais</button></nav>`;
  }
  const items = [
    ["Início", "/"],
    ["Dançar", "/como-dancar/"],
    ["FBS", "/fireborn-squad/"],
    ["Roadmap", "/roadmap/"]
  ];
  return `<nav class="mobile-dock" aria-label="Atalhos mobile">${items.map(([label, href]) => `<a href="${sitePath(href)}"${route === href ? ' aria-current="page"' : ""}><span aria-hidden="true"></span>${label}</a>`).join("")}<button type="button" data-dock-menu aria-label="Abrir menu completo"><span aria-hidden="true"></span>Mais</button></nav>`;
}

function sitePath(value = "/") {
  const base = siteData.site.base || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  if (value === "/") return cleanBase;
  return `${cleanBase}${String(value).replace(/^\//, "")}`;
}

function renderLlmsIndex() {
  return `# Jumpstyle Brasil\n\nOfficial site: ${siteData.site.url}\n\n## Primary sections\n\n- Jumpstyle Brasil: ${siteData.site.url}\n- Fireborn Squad: ${new URL("fireborn-squad/", siteData.site.url).href}\n- Jumpstyle United Nations global museum: ${new URL("JUN/", siteData.site.url).href}\n- JUN machine-readable guide: ${new URL("JUN/llms.txt", siteData.site.url).href}\n`;
}

function renderJunLlms() {
  const timeline = junData.timeline.map((event) => `- ${event.date} | ${event.country} | ${event.title}: ${event.text} Source: ${event.url}`).join("\n");
  const figures = junData.figures.map((figure) => `- ${figure.name} (${figure.country}, ${figure.era}): ${figure.note} Archive: ${figure.url}`).join("\n");
  const nations = junData.countries.map((country) => `- ${country.name}: ${country.focus} Key figures: ${country.figures}. National archive: ${country.archive}`).join("\n");
  return `# Jumpstyle United Nations (JUN)\n\n> ${junData.tagline}\n\nJUN is an open, living archive of Jumpstyle history, dance, music, meetings, leagues and key figures. The public museum is available at ${new URL("JUN/", siteData.site.url).href}. The canonical collaborative repository is ${junData.repositoryUrl}.\n\n## Editorial policy\n\nEvents should use a date stated in a title or description. When neither survives, the upload date may be used as an explicitly identified approximation. Existing timeline records are preserved while new sourced material is added. National contributors review local perspectives.\n\n## Featured Global Timeline\n\n${timeline}\n\n## National archives\n\n${nations}\n\n## Key figures worldwide\n\n${figures}\n\n## Complete Global Timeline source\n\n${globalTimelineMarkdown}\n\n## Canonical research files\n\n- Complete local transcription: ${new URL("JUN/global-timeline.md", siteData.site.url).href}\n- Global Timeline repository source: ${junData.timelineUrl}\n- Key Figures Worldwide: ${junData.figuresUrl}\n- Repository: ${junData.repositoryUrl}\n`;
}

function jsonLd(route) {
  if (route === "/JUN/") {
    const url = new URL("JUN/", siteData.site.url).href;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${url}#organization`,
          name: "Jumpstyle United Nations",
          alternateName: "JUN",
          url,
          logo: new URL("assets/jun-logo.png", siteData.site.url).href,
          sameAs: [junData.repositoryUrl, junData.instagramUrl]
        },
        {
          "@type": "CollectionPage",
          "@id": `${url}#museum`,
          url,
          name: "Jumpstyle United Nations - The World's Largest Jumpstyle Museum",
          description: junData.lead,
          inLanguage: "en",
          isPartOf: { "@type": "WebSite", name: "Jumpstyle Brasil", url: siteData.site.url },
          about: ["Jumpstyle", "Hardjump", "Ownstyle", "Sidejump", "Tekstyle", "Jump dance history"],
          mainEntity: { "@id": `${url}#timeline` },
          publisher: { "@id": `${url}#organization` }
        },
        {
          "@type": "ItemList",
          "@id": `${url}#timeline`,
          name: "Jumpstyle Global Timeline",
          numberOfItems: globalTimeline.events.length,
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          itemListElement: globalTimeline.events.map((event, index) => {
            const citation = timelineCitation(event.markdown);
            return {
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "CreativeWork",
                name: `${event.year} ${event.month}: ${timelinePlainText(event.markdown)}`,
                description: timelinePlainText(event.markdown),
                temporalCoverage: event.year,
                ...(citation ? { citation } : {})
              }
            };
          })
        }
      ]
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Jumpstyle Brasil",
    url: siteData.site.url,
    sameAs: [
      siteData.externalLinks.instagram.url,
      siteData.externalLinks.jun.url
    ]
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slug(value) {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function roman(value) {
  const numerals = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let number = value;
  let result = "";
  for (const [amount, symbol] of numerals) {
    while (number >= amount) {
      result += symbol;
      number -= amount;
    }
  }
  return result;
}
