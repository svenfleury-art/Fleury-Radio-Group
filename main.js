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
  const link = e.target.closest("a[data-link]");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href || href.startsWith("http")) return;

  e.preventDefault();
  history.pushState({}, "", href);
  loadPage(href);
});

window.addEventListener("popstate", () => {
  loadPage(location.pathname);
});

/* =========================
GLOBAL EVENT SYSTEM (KEY PART)
========================= */

function initGlobalEvents() {

  document.addEventListener("click", (e) => {

    /* =========================
    HAMBURGER MENU
    ========================= */
    const hamburger = e.target.closest("#hamburgerBtn");
    const nav = document.getElementById("mainNav");
    const overlay = document.getElementById("menu-overlay");

    if (hamburger && nav) {
      nav.classList.toggle("open");
      overlay?.classList.toggle("active");
      return;
    }

    /* =========================
    DROPDOWNS
    ========================= */
    const toggle = e.target.closest(".dropdown-toggle");

    if (toggle) {
      const dropdown = toggle.closest(".nav-dropdown");
      const menu = dropdown?.querySelector(".dropdown-menu");

      if (menu) menu.classList.toggle("open");
      return;
    }

    /* CLOSE DROPDOWNS */
    document.querySelectorAll(".dropdown-menu.open")
      .forEach(m => m.classList.remove("open"));

    /* =========================
    COOKIE BANNER
    ========================= */
    const cookieBtn = e.target.closest("#cookie-accept");
    const cookieBanner = document.getElementById("cookie-banner");

    if (cookieBtn && cookieBanner) {
      localStorage.setItem("frg_cookies", "true");
      cookieBanner.style.display = "none";
    }

    /* =========================
    PLAYER STATIONS
    ========================= */
    const station = e.target.closest(".station");
    if (station) {
      window.setStation?.(station.dataset.station);
      return;
    }

    /* =========================
    PLAY BUTTON
    ========================= */
    const playBtn = e.target.closest("#playBtn");
    if (playBtn) {
      window.togglePlay?.();
    }
  });
}

/* =========================
RADIO PLAYER (GLOBAL STATE)
========================= */

function initRadioPlayer() {

  const audio = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playBtn");

  if (!audio || !playBtn) return;

  const streams = {
    rhywaelle: "https://stream.laut.fm/rhywaelle",
    winterlord: "https://stream.laut.fm/winterlord-fm",
    rhyrock: "https://stream.laut.fm/rhyrock-radio"
  };

  let current = "rhywaelle";
  let playing = false;

  window.setStation = (station) => {
    current = station;
    if (playing) {
      audio.src = streams[current];
      audio.play();
    }
  };

  window.togglePlay = () => {
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
  };
}

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
PAGE INIT
========================= */

function initPageScripts() {
  initCountdown();

  const banner = document.getElementById("cookie-banner");
  if (banner && localStorage.getItem("frg_cookies") === "true") {
    banner.style.display = "none";
  }
}

/* =========================
BOOT
========================= */

window.addEventListener("DOMContentLoaded", async () => {

  console.log("🚀 FRG SYSTEM START");

  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  initGlobalEvents();
  initRadioPlayer();

  loadPage(location.pathname);
});
