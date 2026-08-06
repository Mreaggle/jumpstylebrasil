const body = document.body;
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-site-nav]");

function setMenu(open) {
  menuButton?.setAttribute("aria-expanded", String(open));
  body.classList.toggle("nav-open", open);
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
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
