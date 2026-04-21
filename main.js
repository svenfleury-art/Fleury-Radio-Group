/* =========================
CONFIG
========================= */

const routes = {
  "/": "/pages/home.html",

  "/radios": "/pages/radios.html",
  "/rhywälle": "/pages/rhywaelle.html",
  "/winterlord": "/pages/winterlord.html",
  "/rhyrock": "/pages/rhyrock.html",

  "/frg-inside": "/pages/frg-inside.html",
  "/team": "/pages/team.html",
  "/geschichte": "/pages/geschichte.html",
  "/about": "/pages/about.html",
  "/mitmachen": "/pages/mitmachen.html",

  "/spezial-programm": "/pages/spezial-programm.html",
  "/artists": "/pages/artists.html",

  "/werbung": "/pages/werbung.html",
  "/agb": "/pages/agb.html",
  "/datenschutz": "/pages/datenschutz.html",
  "/impressum": "/pages/impressum.html",

  "/404": "/pages/404.html"
};

const cache = new Map();

/* =========================
STATE
========================= */

let countdownInterval = null;
let eventInit = false;

/* =========================
UTILS
========================= */

function normalizePath(path) {
  try {
    const url = new URL(path, location.origin);
    let clean = url.pathname;
    if (clean.length > 1) clean = clean.replace(/\/+$/, "");
    return clean || "/";
  } catch {
    return "/";
  }
}

/* =========================
PARTIAL LOADER
========================= */

async function loadPartial(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  try {
    const res = await fetch(file);
    if (!res.ok) return;
    el.innerHTML = await res.text();
  } catch (e) {
    console.warn("Partial error:", file);
  }
}

/* =========================
FETCH PAGE
========================= */

async function loadFile(file) {
  try {
    const res = await fetch(file);
    if (!res.ok) return "<h2>Seite nicht gefunden</h2>";
    return await res.text();
  } catch {
    return "<h2>Fehler beim Laden</h2>";
  }
}

/* =========================
ROUTER
========================= */

async function loadPage(path) {
  const app = document.getElementById("app");
  if (!app) return;

  const clean = normalizePath(path);
  const file = routes[clean] || routes["/404"];

  let html = cache.get(file);

  if (!html) {
    html = await loadFile(file);
    cache.set(file, html);
  }

  app.innerHTML = html;

  window.scrollTo(0, 0);

  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  initPageScripts();
}

/* =========================
NAVIGATION
========================= */

document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-link]");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href) return;

  e.preventDefault();
  history.pushState({}, "", href);
  loadPage(href);
});

window.addEventListener("popstate", () => {
  loadPage(location.pathname);
});

/* =========================
COUNTDOWN
========================= */

const frgEvents = [
  { title: "Crossover Night", date: "2026-04-25T20:00:00" },
  { title: "Simulcast", date: "2026-05-30T19:00:00" },
  { title: "Schweiz Special", date: "2026-08-01T12:00:00" },
  { title: "1 Jahr FRG", date: "2026-10-28T12:00:00" }
];

function initCountdown() {
  const box = document.querySelector(".countdown");
  if (!box) return;

  if (countdownInterval) clearInterval(countdownInterval);

  const next = frgEvents
    .map(e => ({ ...e, time: new Date(e.date).getTime() }))
    .filter(e => e.time > Date.now())
    .sort((a, b) => a.time - b.time)[0];

  if (!next) return;

  box.style.display = "block";

  countdownInterval = setInterval(() => {

    const diff = next.time - Date.now();

    if (diff <= 0) {
      box.style.display = "none";
      clearInterval(countdownInterval);
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    ["days","hours","minutes","seconds"].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = [d,h,m,s][i];
    });

  }, 1000);
}

/* =========================
EVENT FILTER (DEIN HTML)
========================= */

function initEventFilter() {

  if (eventInit) return;
  eventInit = true;

  const btns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".event-card");

  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.addEventListener("click", () => {

      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      cards.forEach(card => {

        if (card.classList.contains("hinweis")) return;

        const show = filter === "all" || card.classList.contains(filter);
        card.style.display = show ? "block" : "none";
      });
    });
  });
}

/* =========================
PAGE INIT
========================= */

function initPageScripts() {
  initCountdown();
  initEventFilter();
}

/* =========================
BOOT
========================= */

window.addEventListener("DOMContentLoaded", async () => {

  console.log("🚀 FRG SYSTEM START");

  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  loadPage(location.pathname);
});
