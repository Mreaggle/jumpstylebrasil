import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const siteData = readJson("src/data/site-data.json");
const originalContent = readJson("src/data/original-content.json");
const originalByPage = new Map(originalContent.pages.map((page) => [page.page, page]));

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
copyFile("src/styles/site.css", "assets/site.css");
copyFile("src/scripts/main.js", "assets/main.js");
copyFile("width_200.png", "assets/jumper-logo.png");
copyFile("fbs.png", "assets/fireborn-squad.png");
copyFile("width_200.png", "favicon.png");

for (const page of siteData.pages) {
  writeRoute(page.route, renderPage(page));
}

writeRoute("/404.html", render404());
writeText("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${siteData.site.url}sitemap.xml\n`);
writeText("sitemap.xml", renderSitemap());
writeText("favicon.svg", renderFavicon());

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
  fs.writeFileSync(path.join(dist, file), text);
}

function renderPage(page) {
  const isFbs = page.route === "/fireborn-squad/";
  const body = isFbs
    ? [renderFbsHero(page), renderFbs()].join("\n")
    : [renderHero(page), renderRouteContent(page)].join("\n");

  return renderShell({
    title: page.route === "/" ? siteData.site.title : `${page.title} | Jumpstyle Brasil`,
    description: page.lead,
    route: page.route,
    body
  });
}

function renderShell({ title, description, route, body }) {
  const canonical = new URL(route === "/" ? "" : route.slice(1), siteData.site.url).href;
  const isFbs = route === "/fireborn-squad/";
  const socialImage = isFbs ? "assets/fireborn-squad.png" : "assets/jumper-logo.png";
  const signal = isFbs
    ? ["FIREBORN SQUAD", "ORDEM DE IGNIÇÃO", "BRASIL", "DESDE 2017", "RENASCIDOS DO FOGO", "FIREBORN SQUAD", "ORDEM DE IGNIÇÃO", "BRASIL"]
    : ["JUMPSTYLE BRASIL", "OLD SCHOOL", "HARDJUMP", "ON BEAT", "POWER", "COMUNIDADE", "JUMPSTYLE BRASIL", "OLD SCHOOL"];
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
  <div class="signal-bar" aria-hidden="true"><div class="signal-track">${signal.map((item) => `<span>${item}</span>`).join("")}</div></div>
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
    ["Fireborn Squad", "/fireborn-squad/", "A ordem, os graus e o registro do time nacional brasileiro."]
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
    ${card("JUN", "Explore a memória da comunidade global de Jumpstyle.", externalLink("jun", "Abrir JUN"))}
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
      <span class="fbs-member-main"><span class="fbs-status" aria-hidden="true"></span><strong>${escapeHtml(member.name)}</strong><small>${member.active ? "Na formação" : "Desertor"}</small></span>
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

function jsonLd() {
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
