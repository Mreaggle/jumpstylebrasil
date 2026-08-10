const body = document.body;
const menuButton = document.querySelector("[data-menu-button]");
const dockMenuButton = document.querySelector("[data-dock-menu]");
const siteNav = document.querySelector("[data-site-nav]");

function setMenu(open) {
  if (!menuButton || !siteNav) return;
  menuButton.setAttribute("aria-expanded", String(open));
  body.classList.toggle("nav-open", open);
  if (open) {
    const firstControl = siteNav.querySelector("[data-jun-translate-toggle]") || siteNav.querySelector("a");
    firstControl?.focus();
  }
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

dockMenuButton?.addEventListener("click", () => setMenu(true));

siteNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) setMenu(false);
});

const junTranslate = document.querySelector("[data-jun-translate]");
const junTranslateToggle = document.querySelector("[data-jun-translate-toggle]");
const junTranslatePanel = document.querySelector("[data-jun-translate-panel]");
const junTranslateLanguage = document.querySelector("[data-jun-translate-language]");

function setJunTranslate(open) {
  if (!junTranslateToggle || !junTranslatePanel) return;
  junTranslateToggle.setAttribute("aria-expanded", String(open));
  junTranslatePanel.hidden = !open;
  if (open) junTranslateLanguage?.focus();
}

junTranslateToggle?.addEventListener("click", () => {
  setJunTranslate(junTranslateToggle.getAttribute("aria-expanded") !== "true");
});

junTranslateLanguage?.addEventListener("change", () => {
  if (!junTranslateLanguage.value) return;
  const target = new URL("https://translate.google.com/translate");
  target.searchParams.set("sl", "en");
  target.searchParams.set("tl", junTranslateLanguage.value);
  target.searchParams.set("u", window.location.href);
  window.location.assign(target.href);
});

document.addEventListener("click", (event) => {
  if (junTranslate && !junTranslate.contains(event.target)) setJunTranslate(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (junTranslateToggle?.getAttribute("aria-expanded") === "true") {
    setJunTranslate(false);
    junTranslateToggle.focus();
    return;
  }
  if (!body.classList.contains("nav-open")) return;
  setMenu(false);
  menuButton?.focus();
});

document.querySelectorAll("[data-beat-stage]").forEach((stage) => {
  stage.querySelectorAll("[data-bpm]").forEach((button) => {
    button.addEventListener("click", () => {
      const bpm = Number(button.dataset.bpm || 140);
      const beatSeconds = 60 / bpm;
      const measureSeconds = beatSeconds * 4;
      stage.style.setProperty("--beat-speed", `${beatSeconds}s`);
      stage.style.setProperty("--measure-speed", `${measureSeconds}s`);
      const readout = stage.querySelector("[data-bpm-readout]");
      if (readout) readout.textContent = String(bpm);
      stage.querySelectorAll("[data-bpm]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });

      const animatedItems = stage.querySelectorAll(".logo-stage img, .beat-bars i, .beat-count i");
      animatedItems.forEach((item) => { item.style.animation = "none"; });
      void stage.offsetWidth;
      animatedItems.forEach((item) => { item.style.animation = ""; });
    });
  });
});

document.querySelectorAll("[data-fbs-ignite]").forEach((button) => {
  button.addEventListener("click", () => {
    const ignited = !body.classList.contains("is-ignited");
    body.classList.toggle("is-ignited", ignited);
    button.setAttribute("aria-pressed", String(ignited));
    const message = document.querySelector("[data-fbs-ignite-message]");
    if (message) message.textContent = ignited
      ? "O brasão está aceso. A chama reconhece os que voltam a se levantar."
      : "A chama reconhece os que voltam a se levantar.";
  });
});

const fbsCards = [...document.querySelectorAll("[data-fbs-card]")];
document.querySelectorAll("[data-fbs-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.fbsFilter || "all";
    let visible = 0;
    document.querySelectorAll("[data-fbs-filter]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    fbsCards.forEach((card) => {
      const tags = (card.dataset.fbsTags || "").split(" ");
      const matches = filter === "all" || tags.includes(filter);
      card.hidden = !matches;
      if (!matches) card.open = false;
      if (matches) visible += 1;
    });
    const count = document.querySelector("[data-fbs-count]");
    if (count) count.textContent = `${visible} ${visible === 1 ? "nome revelado" : "nomes revelados"}`;
  });
});

fbsCards.forEach((card) => {
  card.addEventListener("toggle", () => {
    if (!card.open) return;
    fbsCards.forEach((other) => {
      if (other !== card) other.open = false;
    });
  });
});

const junEvents = [...document.querySelectorAll("[data-jun-event]")];
const junSearch = document.querySelector("[data-jun-search]");
const junCountry = document.querySelector("[data-jun-country]");
let junEra = "all";

function updateJunTimeline() {
  const query = junSearch?.value.trim().toLocaleLowerCase("en") || "";
  const country = junCountry?.value || "all";
  let visible = 0;

  junEvents.forEach((event) => {
    const countries = (event.dataset.junCountry || "").split(" ");
    const matchesEra = junEra === "all" || event.dataset.junEra === junEra;
    const matchesCountry = country === "all" || countries.includes(country);
    const matchesQuery = !query || event.textContent.toLocaleLowerCase("en").includes(query);
    const matches = matchesEra && matchesCountry && matchesQuery;
    event.hidden = !matches;
    if (matches) visible += 1;
  });

  const count = document.querySelector("[data-jun-count]");
  if (count) count.textContent = `${visible} ${visible === 1 ? "milestone" : "milestones"} on view`;
  const empty = document.querySelector("[data-jun-empty]");
  if (empty) empty.hidden = visible !== 0;
}

document.querySelectorAll("[data-jun-era]").forEach((button) => {
  button.addEventListener("click", () => {
    junEra = button.dataset.junEra || "all";
    document.querySelectorAll("[data-jun-era]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    updateJunTimeline();
  });
});

junSearch?.addEventListener("input", updateJunTimeline);
junCountry?.addEventListener("change", updateJunTimeline);

const junViewButtons = [...document.querySelectorAll("[data-jun-view]")];
const junViewPanels = [...document.querySelectorAll("[data-jun-view-panel]")];

function setJunView(view, { focus = false, scroll = false } = {}) {
  const activeButton = junViewButtons.find((button) => button.dataset.junView === view);
  if (!activeButton) return;
  junViewButtons.forEach((button) => {
    const active = button === activeButton;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  junViewPanels.forEach((panel) => {
    panel.hidden = panel.dataset.junViewPanel !== view;
  });
  if (focus) activeButton.focus();
  if (scroll) document.querySelector("#timeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

junViewButtons.forEach((button, index) => {
  button.addEventListener("click", () => setJunView(button.dataset.junView || "curated"));
  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = junViewButtons[(index + direction + junViewButtons.length) % junViewButtons.length];
    setJunView(next.dataset.junView || "curated", { focus: true });
  });
});

document.querySelectorAll("[data-jun-open-complete], [data-jun-switch-complete]").forEach((control) => {
  control.addEventListener("click", (event) => {
    event.preventDefault();
    setJunView("complete", { scroll: true });
    history.replaceState(null, "", "#complete-archive");
  });
});

const junFullSearch = document.querySelector("[data-jun-full-search]");
const junFullEvents = [...document.querySelectorAll("[data-jun-full-event]")];
const junFullYears = [...document.querySelectorAll("[data-jun-full-year]")];
const junFullEras = [...document.querySelectorAll("[data-jun-full-era]")];

function updateJunFullTimeline() {
  const query = junFullSearch?.value.trim().toLocaleLowerCase("en") || "";
  let visible = 0;

  junFullYears.forEach((year) => {
    const metaMatches = Boolean(query && (year.dataset.junFullMeta || "").includes(query));
    let yearVisible = 0;
    year.querySelectorAll("[data-jun-full-event]").forEach((event) => {
      const matches = !query || metaMatches || (event.dataset.junFullSearchable || "").includes(query);
      event.hidden = !matches;
      if (matches) yearVisible += 1;
    });
    year.hidden = Boolean(query && !metaMatches && yearVisible === 0);
    if (query && !year.hidden) year.open = true;
    visible += yearVisible;
  });

  junFullEras.forEach((era) => {
    era.hidden = [...era.querySelectorAll("[data-jun-full-year]")].every((year) => year.hidden);
  });
  const count = document.querySelector("[data-jun-full-count]");
  if (count) count.textContent = `${visible} detailed ${visible === 1 ? "record" : "records"} on view`;
  const empty = document.querySelector("[data-jun-full-empty]");
  if (empty) empty.hidden = visible !== 0;
}

junFullSearch?.addEventListener("input", updateJunFullTimeline);
if (location.hash === "#complete-archive") setJunView("complete");

const junNations = [...document.querySelectorAll("[data-jun-nation]")];
const junNationSearch = document.querySelector("[data-jun-nation-search]");
let junNationFilter = "all";

function updateJunNations() {
  const query = junNationSearch?.value.trim().toLocaleLowerCase("en") || "";
  let visible = 0;
  junNations.forEach((nation) => {
    const matchesStatus = junNationFilter === "all" || nation.dataset.junNationStatus === junNationFilter;
    const matchesQuery = !query || (nation.dataset.junNationSearchable || "").includes(query);
    nation.hidden = !(matchesStatus && matchesQuery);
    if (!nation.hidden) visible += 1;
  });
  const count = document.querySelector("[data-jun-nation-count]");
  if (count) count.textContent = `${visible} national and territorial ${visible === 1 ? "archive" : "archives"} on view`;
  const empty = document.querySelector("[data-jun-nation-empty]");
  if (empty) empty.hidden = visible !== 0;
}

document.querySelectorAll("[data-jun-nation-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    junNationFilter = button.dataset.junNationFilter || "all";
    document.querySelectorAll("[data-jun-nation-filter]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    updateJunNations();
  });
});

junNationSearch?.addEventListener("input", updateJunNations);

document.querySelectorAll("[data-faq-filter]").forEach((input) => {
  input.addEventListener("input", () => {
    const query = input.value.trim().toLocaleLowerCase("pt-BR");
    let visible = 0;
    document.querySelectorAll("[data-faq-item]").forEach((item) => {
      const matches = !query || item.textContent.toLocaleLowerCase("pt-BR").includes(query);
      item.hidden = !matches;
      if (matches) visible += 1;
    });
    const count = document.querySelector("[data-faq-count]");
    if (count) count.textContent = `${visible} ${visible === 1 ? "resposta" : "respostas"}`;
  });
});

document.querySelectorAll("[data-roadmap-check]").forEach((checkbox) => {
  const key = `jsb-roadmap:${checkbox.value}`;
  try { checkbox.checked = localStorage.getItem(key) === "1"; } catch {}
  checkbox.addEventListener("change", () => {
    try { localStorage.setItem(key, checkbox.checked ? "1" : "0"); } catch {}
    updateRoadmapProgress();
  });
});

function updateRoadmapProgress() {
  const allChecks = [...document.querySelectorAll("[data-roadmap-check]")];
  const totalDone = allChecks.filter((check) => check.checked).length;
  const overallProgress = allChecks.length ? Math.round((totalDone / allChecks.length) * 100) : 0;

  document.querySelectorAll("[data-roadmap-level]").forEach((level) => {
    const checks = [...level.querySelectorAll("[data-roadmap-check]")];
    const done = checks.filter((check) => check.checked).length;
    const meter = level.querySelector("[data-roadmap-meter]");
    const label = level.querySelector("[data-roadmap-count]");
    if (meter) meter.style.setProperty("--progress", `${(done / checks.length) * 100}%`);
    if (label) label.textContent = `${done}/${checks.length}`;
    level.classList.toggle("is-complete", done === checks.length);
  });

  const ring = document.querySelector("[data-roadmap-ring]");
  const percent = document.querySelector("[data-roadmap-percent]");
  if (ring) ring.style.setProperty("--progress", `${overallProgress}%`);
  if (percent) percent.textContent = `${overallProgress}%`;
}

const roadmapSaveButton = document.querySelector("[data-roadmap-save]");
const roadmapShareButton = document.querySelector("[data-roadmap-share]");
const roadmapExportStatus = document.querySelector("[data-roadmap-export-status]");

function setRoadmapExportStatus(message) {
  if (roadmapExportStatus) roadmapExportStatus.textContent = message;
}

function wrapCanvasText(context, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  return lines;
}

async function createRoadmapImage() {
  if (document.fonts?.ready) await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponível");

  const colors = { blue: "#002776", green: "#009C3B", yellow: "#FFDF00", white: "#FFFFFF" };
  const levels = [...document.querySelectorAll("[data-roadmap-level]")];
  const allChecks = [...document.querySelectorAll("[data-roadmap-check]")];
  const done = allChecks.filter((check) => check.checked).length;
  const percent = allChecks.length ? Math.round((done / allChecks.length) * 100) : 0;

  context.fillStyle = colors.blue;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = colors.green;
  context.fillRect(0, 0, canvas.width, 24);
  context.fillRect(0, canvas.height - 24, canvas.width, 24);

  context.save();
  context.translate(900, 155);
  context.rotate(Math.PI / 4);
  context.fillStyle = colors.yellow;
  context.fillRect(-112, -112, 224, 224);
  context.restore();
  context.beginPath();
  context.arc(900, 155, 72, 0, Math.PI * 2);
  context.fillStyle = colors.blue;
  context.fill();
  context.strokeStyle = colors.white;
  context.lineWidth = 7;
  context.beginPath();
  context.arc(900, 155, 48, .25, 2.9);
  context.stroke();

  context.fillStyle = colors.yellow;
  context.font = '700 34px "Space Grotesk", sans-serif';
  context.fillText("JUMPSTYLE BRASIL", 74, 92);
  context.fillStyle = colors.white;
  context.font = '800 92px "Handjet", "Space Grotesk", sans-serif';
  context.fillText("MEU ROADMAP", 70, 185);
  context.font = '600 31px "Space Grotesk", sans-serif';
  context.fillText(`${done} DE ${allChecks.length} HABILIDADES DOMINADAS`, 74, 238);

  context.fillStyle = colors.white;
  context.fillRect(74, 280, 932, 12);
  context.fillStyle = colors.green;
  context.fillRect(74, 280, 932 * (percent / 100), 12);
  context.fillStyle = colors.yellow;
  context.font = '800 58px "Handjet", "Space Grotesk", sans-serif';
  context.textAlign = "right";
  context.fillText(`${percent}%`, 1006, 270);
  context.textAlign = "left";

  const cardGap = 22;
  const cardWidth = (932 - cardGap * 2) / 3;
  const cardY = 342;
  const cardHeight = 840;
  levels.forEach((level, levelIndex) => {
    const x = 74 + levelIndex * (cardWidth + cardGap);
    const checks = [...level.querySelectorAll("[data-roadmap-check]")];
    const levelDone = checks.filter((check) => check.checked).length;
    context.fillStyle = levelIndex === 1 ? colors.green : colors.white;
    context.fillRect(x, cardY, cardWidth, cardHeight);
    context.fillStyle = levelIndex === 1 ? colors.white : colors.blue;
    context.font = '800 27px "Space Grotesk", sans-serif';
    context.fillText(`0${levelIndex + 1}`, x + 24, cardY + 48);
    context.font = '800 40px "Handjet", "Space Grotesk", sans-serif';
    const levelName = level.dataset.roadmapName || "";
    wrapCanvasText(context, levelName.toLocaleUpperCase("pt-BR"), cardWidth - 48).slice(0, 2).forEach((line, lineIndex) => {
      context.fillText(line, x + 24, cardY + 105 + lineIndex * 40);
    });
    context.fillStyle = colors.yellow;
    context.fillRect(x + 24, cardY + 168, cardWidth - 48, 7);
    context.fillStyle = levelIndex === 1 ? colors.white : colors.green;
    context.font = '700 25px "Space Grotesk", sans-serif';
    context.fillText(`${levelDone}/${checks.length}`, x + 24, cardY + 215);

    let itemY = cardY + 270;
    checks.forEach((check) => {
      const itemText = check.closest("label")?.textContent.trim() || check.value;
      context.strokeStyle = levelIndex === 1 ? colors.white : colors.blue;
      context.lineWidth = 4;
      context.strokeRect(x + 24, itemY - 19, 24, 24);
      if (check.checked) {
        context.fillStyle = colors.yellow;
        context.fillRect(x + 24, itemY - 19, 24, 24);
        context.strokeStyle = colors.blue;
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(x + 29, itemY - 6);
        context.lineTo(x + 35, itemY);
        context.lineTo(x + 45, itemY - 13);
        context.stroke();
      }
      context.fillStyle = levelIndex === 1 ? colors.white : colors.blue;
      context.font = '600 21px "Space Grotesk", sans-serif';
      const lines = wrapCanvasText(context, itemText, cardWidth - 86).slice(0, 2);
      lines.forEach((line, lineIndex) => context.fillText(line, x + 62, itemY + lineIndex * 25));
      itemY += Math.max(67, lines.length * 26 + 32);
    });
  });

  context.fillStyle = colors.yellow;
  context.font = '700 28px "Space Grotesk", sans-serif';
  context.fillText("JUMPSTYLE.COM.BR", 74, 1265);
  context.fillStyle = colors.white;
  context.font = '500 23px "Space Grotesk", sans-serif';
  context.fillText("MOVIMENTO • MEMÓRIA • COMUNIDADE", 74, 1305);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Falha ao gerar imagem")), "image/png", 1);
  });
}

function downloadRoadmapImage(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "meu-roadmap-jumpstyle-brasil.png";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

roadmapSaveButton?.addEventListener("click", async () => {
  roadmapSaveButton.disabled = true;
  setRoadmapExportStatus("Preparando sua imagem...");
  try {
    downloadRoadmapImage(await createRoadmapImage());
    setRoadmapExportStatus("Imagem salva em PNG.");
  } catch {
    setRoadmapExportStatus("Não foi possível salvar a imagem neste navegador.");
  } finally {
    roadmapSaveButton.disabled = false;
  }
});

roadmapShareButton?.addEventListener("click", async () => {
  roadmapShareButton.disabled = true;
  setRoadmapExportStatus("Preparando seu compartilhamento...");
  try {
    const blob = await createRoadmapImage();
    const file = new File([blob], "meu-roadmap-jumpstyle-brasil.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Meu Roadmap Jumpstyle Brasil" });
      setRoadmapExportStatus("Imagem compartilhada.");
    } else {
      downloadRoadmapImage(blob);
      setRoadmapExportStatus("Imagem salva em PNG para você compartilhar.");
    }
  } catch (error) {
    if (error?.name !== "AbortError") setRoadmapExportStatus("Não foi possível compartilhar a imagem neste navegador.");
  } finally {
    roadmapShareButton.disabled = false;
  }
});

function updateScrollMeter() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
  document.documentElement.style.setProperty("--scroll-progress", `${progress}%`);
}

window.addEventListener("scroll", updateScrollMeter, { passive: true });
updateScrollMeter();
updateRoadmapProgress();

const revealItems = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: .12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
