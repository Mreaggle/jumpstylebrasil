const body = document.body;
const menuButton = document.querySelector("[data-menu-button]");
const dockMenuButton = document.querySelector("[data-dock-menu]");
const siteNav = document.querySelector("[data-site-nav]");

function setMenu(open) {
  if (!menuButton || !siteNav) return;
  menuButton.setAttribute("aria-expanded", String(open));
  body.classList.toggle("nav-open", open);
  if (open) siteNav.querySelector("a")?.focus();
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

dockMenuButton?.addEventListener("click", () => setMenu(true));

siteNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && body.classList.contains("nav-open")) {
    setMenu(false);
    menuButton?.focus();
  }
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
  document.querySelectorAll("[data-roadmap-level]").forEach((level) => {
    const checks = [...level.querySelectorAll("[data-roadmap-check]")];
    const done = checks.filter((check) => check.checked).length;
    const meter = level.querySelector("[data-roadmap-meter]");
    const label = level.querySelector("[data-roadmap-count]");
    if (meter) meter.style.setProperty("--progress", `${(done / checks.length) * 100}%`);
    if (label) label.textContent = `${done}/${checks.length}`;
    level.classList.toggle("is-complete", done === checks.length);
  });
}

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
