/* =========================
CONFIG
========================= */

const routes = {
  "/": "/pages/home.html",

  "/radios": "/pages/radios.html",
  "/rhywaelle": "/pages/rhywaelle.html",
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
HEADER SPACING FIX
========================= */

function updateHeaderSpacing() {
  const header = document.getElementById("mainHeader");
  if (!header) return;

  const height = header.offsetHeight + 20;
  document.documentElement.style.setProperty("--header-height", height + "px");
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
  updateHeaderSpacing();
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

  const nav = document.getElementById("mainNav");
  const overlay = document.getElementById("menu-overlay");

  nav?.classList.remove("open");
  overlay?.classList.remove("active");

  document.querySelectorAll(".nav-dropdown.open")
    .forEach(d => d.classList.remove("open"));
});

window.addEventListener("popstate", () => {
  loadPage(location.pathname);
});

/* =========================
GLOBAL HEADER UI (FIXED DROPDOWN)
========================= */

document.addEventListener("click", (e) => {

  const nav = document.getElementById("mainNav");
  const overlay = document.getElementById("menu-overlay");

  /* =========================
  HAMBURGER
  ========================= */
  if (e.target.closest("#hamburgerBtn")) {

    nav?.classList.toggle("open");
    overlay?.classList.toggle("active");

    if (!nav?.classList.contains("open")) {
      document.querySelectorAll(".nav-dropdown.open")
        .forEach(d => d.classList.remove("open"));
    }

    return;
  }

  /* =========================
  OVERLAY CLOSE
  ========================= */
  if (e.target.id === "menu-overlay") {

    nav?.classList.remove("open");
    overlay?.classList.remove("active");

    document.querySelectorAll(".nav-dropdown.open")
      .forEach(d => d.classList.remove("open"));

    return;
  }

  /* =========================
  DROPDOWN TOGGLE (FIXED)
  ========================= */
  const dropdownBtn = e.target.closest(".dropdown-toggle");

  if (dropdownBtn) {

    const dropdown = dropdownBtn.closest(".nav-dropdown");
    if (!dropdown) return;

    const isOpen = dropdown.classList.contains("open");

    document.querySelectorAll(".nav-dropdown.open")
      .forEach(d => {
        if (d !== dropdown) d.classList.remove("open");
      });

    dropdown.classList.toggle("open", !isOpen);

    return;
  }

  /* =========================
  CLICK OUTSIDE CLOSE
  ========================= */
  if (!e.target.closest("#mainNav")) {
    document.querySelectorAll(".nav-dropdown.open")
      .forEach(d => d.classList.remove("open"));
  }

});

/* =========================
HEADER SHRINK
========================= */

function initHeader() {
  const header = document.getElementById("mainHeader");
  if (!header) return;

  window.addEventListener("scroll", () => {

    const nav = document.getElementById("mainNav");
    if (nav?.classList.contains("open")) return;

    if (window.scrollY > 80) {
      header.classList.add("shrink");
    } else {
      header.classList.remove("shrink");
    }

    updateHeaderSpacing();
  });
}

/* =========================
RADIO PLAYER
========================= */

function initRadioPlayer() {
  const audio = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playBtn");
  const stations = document.querySelectorAll(".station");
  const nowPlaying = document.getElementById("nowPlaying");

  if (!audio || !playBtn) return;

  let current = "rhywaelle";
  let playing = false;
  let songInterval = null;

  const streams = {
    rhywaelle: "https://stream.laut.fm/rhywaelle",
    winterlord: "https://stream.laut.fm/winterlord-fm",
    rhyrock: "https://stream.laut.fm/rhyrock-radio"
  };

  const apis = {
    rhywaelle: "https://api.laut.fm/station/rhywaelle/current_song",
    winterlord: "https://api.laut.fm/station/winterlord-fm/current_song",
    rhyrock: "https://api.laut.fm/station/rhyrock-radio/current_song"
  };

  function setStation(s) {
    current = s;

    stations.forEach(btn => btn.classList.remove("active"));
    document.querySelector(`[data-station="${s}"]`)?.classList.add("active");

    if (playing) {
      audio.src = streams[current];
      audio.play();
    }

    updateNowPlaying();
  }

  stations.forEach(btn => {
    btn.addEventListener("click", () => setStation(btn.dataset.station));
  });

  playBtn.addEventListener("click", () => {
    if (!playing) {
      audio.src = streams[current];
      audio.play();
      playing = true;
      playBtn.textContent = "⏸";
      startSongUpdates();
    } else {
      audio.pause();
      playing = false;
      playBtn.textContent = "▶";
      stopSongUpdates();
    }
  });

  async function updateNowPlaying() {
    try {
      const res = await fetch(apis[current]);
      const data = await res.json();

      const title = data.title || "Unbekannt";
      const artist = data.artist?.name || "";

      const text = artist ? `${artist} - ${title}` : title;

      if (nowPlaying) nowPlaying.textContent = text;

    } catch {
      if (nowPlaying) nowPlaying.textContent = "Live Stream";
    }
  }

  function startSongUpdates() {
    updateNowPlaying();
    if (songInterval) clearInterval(songInterval);
    songInterval = setInterval(updateNowPlaying, 10000);
  }

  function stopSongUpdates() {
    if (songInterval) {
      clearInterval(songInterval);
      songInterval = null;
    }
  }
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
  { title: "FRG Simulcast", date: "2026-05-30T19:00:00" },
  { title: "FRG Crossover Night", date: "2026-06-27T19:00:00" },
  { title: "FRG Schweiz Special", date: "2026-08-01T12:00:00" },
  { title: "FRG Crossover Night", date: "2026-09-26T19:00:00" },
  { title: "1 Jahr Fleury Radio Group", date: "2026-10-28T12:00:00" },
  { title: "FRG Halloween Special", date: "2026-10-31T12:00:00" },
  { title: "FRG Weihnachts Special", date: "2026-12-19T00:00:00" }
];

function initCountdown() {
  const box = document.querySelector(".countdown");
  if (!box) return;

  const titleEl = document.getElementById("countdown-title");

  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {

    const now = Date.now();

    const next = frgEvents
      .map(e => ({ ...e, time: new Date(e.date).getTime() }))
      .filter(e => e.time > now)
      .sort((a, b) => a.time - b.time)[0];

    if (!next) return;

    const diff = next.time - now;

    if (titleEl) titleEl.textContent = next.title;

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
}

/* =========================
BOOT
========================= */

window.addEventListener("DOMContentLoaded", async () => {

  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  initHeader();
  initRadioPlayer();

  updateHeaderSpacing();
  window.addEventListener("resize", updateHeaderSpacing);

  const path = normalizePath(location.pathname);
  loadPage(routes[path] ? path : "/404");
});
