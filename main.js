
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
  "/artists": "/pages/Artists.html",

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
  if (!path) return "/";
  path = path.replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

/* =========================
SAFE FETCH
========================= */

async function safeFetch(file) {
  try {
    const res = await fetch(file);
    if (!res.ok) return "<h2 style='color:white;text-align:center'>Seite nicht gefunden</h2>";
    return await res.text();
  } catch {
    return "<h2 style='color:white;text-align:center'>Fehler beim Laden</h2>";
  }
}

/* =========================
PAGE LOADER
========================= */

async function loadPage(path) {
  const app = document.getElementById("app");
  if (!app) return;

  const clean = normalizePath(path);
  const file = routes[clean] || routes["/404"];

  let html;

  if (cache.has(file)) {
    html = cache.get(file);
  } else {
    html = await safeFetch(file);
    cache.set(file, html);
  }

  app.innerHTML = html;

  window.scrollTo(0, 0);

  runPageScriptsSafe();
}

/* =========================
NAVIGATION
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
MENU
========================= */

function initMenu() {
  const btn = document.getElementById("hamburgerBtn");
  const nav = document.getElementById("mainNav");
  const overlay = document.getElementById("menu-overlay");

  if (!btn || !nav) return;

  btn.onclick = () => {
    nav.classList.toggle("open");
    overlay?.classList.toggle("active");
  };

  overlay?.onclick = () => {
    nav.classList.remove("open");
    overlay.classList.remove("active");
  };
}

/* =========================
EVENT FILTER
========================= */

function initEventFilter() {
  const btns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".event-card");

  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.onclick = () => {

      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        if (card.classList.contains("hinweis")) return;

        const show = filter === "all" || card.classList.contains(filter);
        card.style.display = show ? "block" : "none";
      });

    };
  });
}

/* =========================
RADIO
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

  document.querySelectorAll(".station").forEach(btn => {
    btn.onclick = () => {
      current = btn.dataset.station;

      document.querySelectorAll(".station")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      if (playing) {
        audio.src = streams[current];
        audio.play();
      }
    };
  });

  playBtn.onclick = () => {
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
COUNTDOWN (SAFE + FIXED)
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
  const wrapper = document.querySelector(".countdown");
  if (!wrapper) return;

  if (countdownInterval) clearInterval(countdownInterval);

  const now = Date.now();

  const next = frgEvents
    .map(e => ({ ...e, time: new Date(e.date).getTime() }))
    .filter(e => e.time > now)
    .sort((a, b) => a.time - b.time)[0];

  if (!next) {
    wrapper.style.display = "none";
    return;
  }

  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  if (next.time - now > sevenDays) {
    wrapper.style.display = "none";
    return;
  }

  wrapper.style.display = "block";

  countdownInterval = setInterval(() => {
    const diff = next.time - Date.now();

    if (diff <= 0) {
      wrapper.style.display = "none";
      clearInterval(countdownInterval);
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    ["days","hours","minutes","seconds"].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String([d,h,m,s][i]).padStart(2,"0");
    });

  }, 1000);
}

/* =========================
BOOT SAFE
========================= */

function runPageScriptsSafe() {
  try {
    initMenu();
    initEventFilter();
    initRadioPlayer();
    initCountdown();
  } catch (e) {
    console.warn("Init error:", e);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const path = normalizePath(location.pathname);

  if (routes[path]) {
    loadPage(path);
  } else {
    loadPage("/404");
  }
});
