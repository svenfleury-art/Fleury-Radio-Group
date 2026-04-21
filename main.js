
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
let countdownInterval = null;

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
PARTIALS
========================= */

async function loadPartial(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  try {
    const res = await fetch(file);
    if (!res.ok) return;
    el.innerHTML = await res.text();
  } catch {}
}

/* =========================
PAGE LOADER
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
SPA NAVIGATION
========================= */

document.addEventListener("click", (e) => {

  const link = e.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href) return;

  const external =
    href.startsWith("http") ||
    href.startsWith("https") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:");

  if (external) return;

  e.preventDefault();

  history.pushState({}, "", href);
  loadPage(href);

  // MENU SCHLIESSEN BEI NAVIGATION
  const nav = document.getElementById("mainNav");
  const overlay = document.getElementById("menu-overlay");
  nav?.classList.remove("open");
  overlay?.classList.remove("active");
});

window.addEventListener("popstate", () => {
  loadPage(location.pathname);
});

/* =========================
GLOBAL UI (MENU + DROPDOWN + COOKIE)
========================= */

document.addEventListener("click", (e) => {

  const nav = document.getElementById("mainNav");
  const overlay = document.getElementById("menu-overlay");

  /* =========================
     HAMBURGER MENU
  ========================= */
  const burger = e.target.closest("#hamburgerBtn");
  if (burger && nav) {
    nav.classList.toggle("open");
    overlay?.classList.toggle("active");
    return;
  }

  /* OVERLAY CLOSE */
  if (e.target.id === "menu-overlay") {
    nav?.classList.remove("open");
    overlay?.classList.remove("active");
    return;
  }

  /* =========================
     🔥 DROPDOWN FIX (TOGGLE)
  ========================= */
  const dropdownBtn = e.target.closest(".dropdown-toggle");

  if (dropdownBtn) {
    const dropdown = dropdownBtn.closest(".nav-dropdown");

    const isOpen = dropdown.classList.contains("open");

    document.querySelectorAll(".nav-dropdown.open")
      .forEach(d => d.classList.remove("open"));

    if (!isOpen) {
      dropdown.classList.add("open");
    }

    return;
  }

  /* CLOSE ON OUTSIDE CLICK */
  document.querySelectorAll(".nav-dropdown.open")
    .forEach(d => d.classList.remove("open"));

  /* COOKIE */
  const cookieBtn = e.target.closest("#cookie-accept");
  const cookie = document.getElementById("cookie-banner");

  if (cookieBtn && cookie) {
    localStorage.setItem("frg_cookies", "true");
    cookie.style.display = "none";
  }
});

/* =========================
HEADER SHRINK
========================= */

function initHeader() {
  const header = document.getElementById("mainHeader");
  if (!header) return;

  window.addEventListener("scroll", () => {
    header.classList.toggle("shrink", window.scrollY > 80);
  });
}

/* =========================
RADIO PLAYER
========================= */

function initRadioPlayer() {
  const audio = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playBtn");

  if (!audio || !playBtn) return;

  let current = "rhywaelle";
  let playing = false;

  const streams = {
    rhywaelle: "https://stream.laut.fm/rhywaelle",
    winterlord: "https://stream.laut.fm/winterlord-fm",
    rhyrock: "https://stream.laut.fm/rhyrock-radio"
  };

  window.setStation = (s) => {
    current = s;
    if (playing) {
      audio.src = streams[current];
      audio.play();
    }
  };

  playBtn.addEventListener("click", () => {
    if (!playing) {
      audio.src = streams[current];
      audio.play();
      playing = true;
      playBtn.textContent = "⏸";
    } else {
      audio.pause();
      playing = false;
      playBtn.textContent = "▶";
    }
  });
}

/* =========================
EVENT FILTER
========================= */

function initEventFilter() {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".event-card");

  if (!buttons.length || !cards.length) return;

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {

      const filter = btn.dataset.filter;

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      cards.forEach(card => {

        if (card.classList.contains("hinweis")) {
          card.style.display = "block";
          return;
        }

        card.style.display =
          filter === "all" || card.classList.contains(filter)
            ? "block"
            : "none";
      });
    });
  });
}

/* =========================
COUNTDOWN
========================= */

const frgEvents = [
  { title: "FRG Crossover Night", date: "2026-04-25T20:00:00" },
  { title: "FRG Simulcast", date: "2026-05-30T19:00:00" },
  { title: "FRG Crossover Night", date: "2026-06-27T19:00:00" },
  { title: "FRG Schweiz Special", date: "2026-08-01T12:00:00" },
  { title: "FRG Crossover Night", date: "2026-09-26T19:00:00" },
  { title: "1 Jahr Fleury Radio Group", date: "2026-10-28T12:00:00" },
  { title: "FRG Halloween Special", date: "2026-10-31T12:00:00" },
  { title: "FRG Crossover Night", date: "2026-11-28T20:00:00" },
  { title: "FRG Weihnachts Special", date: "2026-12-19T00:00:00" },
  { title: "FRG Neujahres Special", date: "2026-12-31T13:00:00" }
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
PAGE INIT
========================= */

function initPageScripts() {
  initCountdown();
  initEventFilter();

  const cookie = document.getElementById("cookie-banner");
  if (cookie && localStorage.getItem("frg_cookies") === "true") {
    cookie.style.display = "none";
  }
}

/* =========================
BOOT
========================= */

window.addEventListener("DOMContentLoaded", async () => {

  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  initHeader();
  initRadioPlayer();

  const redirect = sessionStorage.getItem("spa_redirect");
  if (redirect) {
    sessionStorage.removeItem("spa_redirect");
    history.replaceState({}, "", redirect);
  }

  const path = normalizePath(location.pathname);
  loadPage(routes[path] ? path : "/404");
});
