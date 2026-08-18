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
  "/geschichte": "/pages/geschichte.html",
  "/about": "/pages/about.html",
  "/mitmachen": "/pages/mitmachen.html",

  "/spezial-programm": "/pages/spezial-programm.html",
  "/artists": "/pages/Artists.html",

  "/werbung": "/pages/werbung.html",
  "/kontakt": "/pages/kontakt.html",
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
  document.body.dataset.currentRoute = clean.slice(1) || "home";
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

  const routeStations = { "/rhywaelle": "rhywaelle", "/winterlord": "winterlord", "/rhyrock": "rhyrock" };
  const routeStation = routeStations[clean];
  if (routeStation) document.querySelector(`[data-station="${routeStation}"]`)?.click();
}

/* =========================
SPA NAVIGATION
========================= */

document.addEventListener("click", (e) => {

  const link = e.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href) return;

  if (href.startsWith("#")) {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  const external =
    href.startsWith("http") ||
    href.startsWith("https") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:");

  if (external) return;

  // Eigenständige SEO-Seiten sollen normale Dokument-Navigation verwenden.
  if (document.documentElement.dataset.staticPage === "true") return;

  e.preventDefault();

  history.pushState({}, "", href);
  loadPage(href);

  const nav = document.getElementById("mainNav");
  const overlay = document.getElementById("menu-overlay");
  const burger = document.getElementById("hamburgerBtn");
  
  nav?.classList.remove("open");
  overlay?.classList.remove("active");
  document.body.classList.remove("nav-open");
  if (burger) {
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menü öffnen");
  }
});

window.addEventListener("popstate", () => {
  loadPage(location.pathname);
});

/* =========================
GLOBAL UI
========================= */

document.addEventListener("click", (e) => {

  const nav = document.getElementById("mainNav");
  const overlay = document.getElementById("menu-overlay");

  const burger = e.target.closest("#hamburgerBtn");
  if (burger && nav) {
    const isOpen = nav.classList.toggle("open");
    overlay?.classList.toggle("active");
    document.body.classList.toggle("nav-open", isOpen);
    
    burger.classList.toggle("is-open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    burger.setAttribute("aria-label", isOpen ? "Menü schliessen" : "Menü öffnen");
    return;
  }

  if (e.target.id === "menu-overlay") {
    nav?.classList.remove("open");
    overlay?.classList.remove("active");
    document.body.classList.remove("nav-open");
    const burgerButton = document.getElementById("hamburgerBtn");
    burgerButton?.classList.remove("is-open");
    burgerButton?.setAttribute("aria-expanded", "false");
    burgerButton?.setAttribute("aria-label", "Menü öffnen");
    return;
  }

  const dropdownBtn = e.target.closest(".dropdown-toggle");

  if (dropdownBtn) {
    const dropdown = dropdownBtn.closest(".nav-dropdown");

    const isOpen = dropdown.classList.contains("open");

    document.querySelectorAll(".nav-dropdown.open")
      .forEach(d => d.classList.remove("open"));

    if (!isOpen) dropdown.classList.add("open");
    return;
  }

  document.querySelectorAll(".nav-dropdown.open")
    .forEach(d => d.classList.remove("open"));

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
    const scroll = window.scrollY;

    if (scroll > 80) {
      header.classList.add("shrink");
    } else {
      header.classList.remove("shrink");
    }

    const progress = Math.min(scroll / 150, 1);
    header.style.backdropFilter = `blur(${progress * 10}px)`;

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

  const stationThemes = {
    rhywaelle: { accent: "#315bdb", accentStrong: "#1d3fa8", glow: "rgba(49,91,219,.26)", name: "rhywaelle" },
    winterlord: { accent: "#9bd8ff", accentStrong: "#4c9fd4", glow: "rgba(155,216,255,.22)", name: "winterlord" },
    rhyrock: { accent: "#ff7043", accentStrong: "#d9431d", glow: "rgba(255,112,67,.24)", name: "rhyrock" }
  };

  function applyStationTheme(s) {
    const theme = stationThemes[s] || stationThemes.rhywaelle;
    const root = document.documentElement;
    root.style.setProperty("--station-accent", theme.accent);
    root.style.setProperty("--station-accent-strong", theme.accentStrong);
    root.style.setProperty("--station-glow", theme.glow);
    document.body.dataset.stationTheme = theme.name;
  }

  function setStation(s) {
    current = s;
    applyStationTheme(s);

    stations.forEach(btn => btn.classList.remove("active"));
    document.querySelector(`[data-station="${s}"]`)?.classList.add("active");
    document.querySelectorAll(".hero-station").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.heroStation === s);
    });

    if (playing) {
      audio.src = streams[current];
      audio.play();
    }

    const stationNames = {
      rhywaelle: "Radio Rhywälle™",
      winterlord: "Winterlord FM™",
      rhyrock: "RhyRock Radio™"
    };
    const heroStation = document.getElementById("heroStationLabel");
    if (heroStation) heroStation.textContent = stationNames[current];

    updateNowPlaying();
  }

  stations.forEach(btn => {
    btn.addEventListener("click", () => {
      setStation(btn.dataset.station);
    });
  });

  playBtn.addEventListener("click", () => {
    if (!playing) {
      audio.src = streams[current];
      audio.play();
      playing = true;
      playBtn.textContent = "⏸";
      document.querySelectorAll(".header-live-visual, .live-visual").forEach(el => el.classList.add("is-playing"));
      startSongUpdates();
    } else {
      audio.pause();
      playing = false;
      playBtn.textContent = "▶";
      document.querySelectorAll(".header-live-visual, .live-visual").forEach(el => el.classList.remove("is-playing"));
      stopSongUpdates();
    }
  });

  async function updateNowPlaying() {
    try {
      const res = await fetch(apis[current]);
      const data = await res.json();

      const title = data.title || "Unbekannt";
      const artist = data.artist?.name || "";

      const cover = "/img/Fleury Radio Group Logo.webp";
      const text = artist ? `${artist} - ${title}` : title;

      if (nowPlaying) nowPlaying.textContent = text;
      const heroNowPlaying = document.getElementById("heroNowPlaying");
      if (heroNowPlaying) heroNowPlaying.textContent = text;

      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title,
          artist,
          album: "Fleury Radio Group",
          artwork: [{ src: cover, sizes: "512x512", type: "image/png" }]
        });
      }

    } catch (err) {
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

  applyStationTheme(current);
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
COUNTDOWN (UPDATED)
========================= */

const frgEvents = [
  { title: "FRG Simulcast", date: "2026-05-30T19:00:00" },
  { title: "FRG Crossover Night", date: "2026-06-27T19:00:00" },
  { title: "FRG Schweiz Special", date: "2026-07-31T19:00:00" },
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

  const titleEl = document.getElementById("countdown-title");

  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {

    const now = Date.now();

    const next = frgEvents
      .map(e => ({ ...e, time: new Date(e.date).getTime() }))
      .filter(e => e.time > now)
      .sort((a, b) => a.time - b.time)[0];

    if (!next) {
      box.style.display = "none";
      clearInterval(countdownInterval);
      return;
    }

    const diff = next.time - now;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    box.style.display = diff <= sevenDays ? "block" : "none";

    if (titleEl) {
      titleEl.textContent = next.title;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    ["days","hours","minutes","seconds"].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = [d,h,m,s][i];
    });

    if (diff <= 0) {
      box.style.display = "none";
    }

  }, 1000);
}

/* =========================
PAGE INIT
========================= */

function initAccordion() {
  document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
      const accordionItem = button.parentElement;
      const isOpen = accordionItem.classList.contains('active');
      
      // Schliesst andere Items für bessere Übersicht auf Mobile
      document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
      });

      if (!isOpen) {
        accordionItem.classList.add('active');
      }
    });
  });
}

function initPageScripts() {
  initCountdown();
  initEventFilter();
  initAccordion(); // Neu hinzugefügt

  const cookie = document.getElementById("cookie-banner");
  if (cookie && localStorage.getItem("frg_cookies") === "true") {
    cookie.style.display = "none";
  }
}

/* =========================
BOOT
========================= */

window.addEventListener("DOMContentLoaded", async () => {

  const isStaticPage = document.documentElement.dataset.staticPage === "true";
  const initialPath = normalizePath(location.pathname);
  document.body.dataset.currentRoute = initialPath.slice(1) || "home";

  // Die Startseite bleibt eine SPA. Indexierbare Unterseiten enthalten Navigation,
  // Footer und Hauptinhalt bereits direkt im ausgelieferten HTML.
  if (!isStaticPage) {
    await loadPartial("nav-slot", "partials/nav.html");
    await loadPartial("footer-slot", "partials/footer.html");
  }

  initHeader();
  initRadioPlayer();

  updateHeaderSpacing();
  window.addEventListener("resize", updateHeaderSpacing);

  if (isStaticPage) {
    initPageScripts();
    const staticStationRoutes = { "/rhywaelle": "rhywaelle", "/winterlord": "winterlord", "/rhyrock": "rhyrock" };
    const staticStation = staticStationRoutes[initialPath];
    if (staticStation) document.querySelector(`[data-station="${staticStation}"]`)?.click();
    return;
  }

  const redirect = sessionStorage.getItem("spa_redirect");
  if (redirect) {
    sessionStorage.removeItem("spa_redirect");
    history.replaceState({}, "", redirect);
  }

  const path = normalizePath(location.pathname);
  loadPage(routes[path] ? path : "/404");
});

/* =========================
FORM HANDLING
========================= */

document.addEventListener("click", (e) => {
  if (e.target.closest("#heroPlayBtn")) {
    document.getElementById("playBtn")?.click();
  }

  const heroStation = e.target.closest(".hero-station");
  if (heroStation) {
    const headerStation = document.querySelector(`[data-station="${heroStation.dataset.heroStation}"]`);
    headerStation?.click();
  }

  const pageStation = e.target.closest(".page-station-button");
  if (pageStation) {
    const headerStation = document.querySelector(`[data-station="${pageStation.dataset.pageStation}"]`);
    headerStation?.click();
  }
});

document.addEventListener("change", (e) => {
  if (e.target.id === "agb-1") {
    const btn = document.getElementById("submitBtn-1");
    if (btn) btn.disabled = !e.target.checked;
  }

  if (e.target.id === "agb-2") {
    const btn = document.getElementById("submitBtn-2");
    if (btn) btn.disabled = !e.target.checked;
  }
});

/* =========================
FORM SUBMIT
========================= */

document.addEventListener("submit", async (e) => {

  const form = e.target;

  if (form.id === "artist-form-1") {
    e.preventDefault();
    const msg = document.getElementById("form-msg-1");

    try {
      await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      });

      form.reset();

      if (msg) {
        msg.style.display = "block";
        msg.textContent = "🎉 Danke! Dein Track wurde erfolgreich eingereicht. Wir prüfen ihn und melden uns bei dir.";
      }

    } catch {
      if (msg) {
        msg.style.display = "block";
        msg.textContent = "❌ Fehler beim Senden. Bitte versuch es erneut.";
      }
    }
    return;
  }

  if (form.id === "artist-form-2") {
    e.preventDefault();
    const msg = document.getElementById("form-msg-2");

    try {
      await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      });

      form.reset();

      if (msg) {
        msg.style.display = "block";
        msg.textContent = "✅ Nachricht gesendet! Danke für deine Anfrage – wir melden uns so schnell wie möglich.";
      }

    } catch {
      if (msg) {
        msg.style.display = "block";
        msg.textContent = "❌ Fehler beim Senden. Bitte versuch es erneut.";
      }
    }
    return;
  }
});
