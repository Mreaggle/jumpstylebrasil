const body = document.body;
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-site-nav]");

function setMenu(open) {
  menuButton?.setAttribute("aria-expanded", String(open));
  body.classList.toggle("nav-open", open);
  if (open) {
    const firstControl = nav?.querySelector("[data-translate-toggle]") || nav?.querySelector("a");
    firstControl?.focus();
  }
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (translateToggle?.getAttribute("aria-expanded") === "true") {
    setTranslate(false);
    translateToggle.focus();
    return;
  }
  setMenu(false);
});

const translate = document.querySelector("[data-translate]");
const translateToggle = document.querySelector("[data-translate-toggle]");
const translatePanel = document.querySelector("[data-translate-panel]");
const translateLanguage = document.querySelector("[data-translate-language]");

function setTranslate(open) {
  if (!translateToggle || !translatePanel) return;
  translateToggle.setAttribute("aria-expanded", String(open));
  translatePanel.hidden = !open;
  if (open) translateLanguage?.focus();
}

translateToggle?.addEventListener("click", () => {
  setTranslate(translateToggle.getAttribute("aria-expanded") !== "true");
});

translateLanguage?.addEventListener("change", () => {
  if (!translateLanguage.value) return;
  const target = new URL("https://translate.google.com/translate");
  target.searchParams.set("sl", "en");
  target.searchParams.set("tl", translateLanguage.value);
  target.searchParams.set("u", window.location.href);
  window.location.assign(target.href);
});

document.addEventListener("click", (event) => {
  if (translate && !translate.contains(event.target)) setTranslate(false);
});

const cards = [...document.querySelectorAll("[data-event]")];
const search = document.querySelector("[data-search]");
let activeEra = "all";

function update() {
  const query = search?.value.trim().toLocaleLowerCase("en") || "";
  let visible = 0;
  for (const card of cards) {
    const eraMatches = activeEra === "all" || card.dataset.era === activeEra;
    const queryMatches = !query || card.textContent.toLocaleLowerCase("en").includes(query);
    const show = eraMatches && queryMatches;
    card.hidden = !show;
    if (show) visible += 1;
  }
  const count = document.querySelector("[data-count]");
  if (count) count.textContent = `${visible} ${visible === 1 ? "timeline block" : "timeline blocks"} on view`;
  const empty = document.querySelector("[data-empty]");
  if (empty) empty.hidden = visible !== 0;
}

document.querySelectorAll("[data-era]").forEach((button) => {
  button.addEventListener("click", () => {
    activeEra = button.dataset.era || "all";
    document.querySelectorAll("[data-era]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    update();
  });
});

search?.addEventListener("input", update);
