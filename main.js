/* =========================
CONFIG
========================= */

const routes = {
  "/": "/pages/home.html?relaunch-nowplaying-v2",

  "/radios": "/pages/radios.html",
  "/rhywaelle": "/pages/rhywaelle.html",
  "/winterlord": "/pages/winterlord.html",
  "/rhyrock": "/pages/rhyrock.html",

  "/frg-inside": "/pages/frg-inside.html",
  "/geschichte": "/pages/geschichte.html",
  "/about": "/pages/about.html",
  "/mitmachen": "/pages/mitmachen.html",
  "/gewinnspiel": "/pages/gewinnspiel.html",

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
let giveawayCountdownInterval = null;

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

  // Interne Seiten werden auch aus statischen Einstiegsseiten innerhalb der
  // bestehenden Shell geladen, damit der Audio-Stream nicht neu startet.

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
  const edgePlayer = document.getElementById("edgePlayer");
  const edgeToggle = document.getElementById("edgeToggle");
  if (!header) return;

  edgeToggle?.addEventListener("click", () => {
    const collapsed = edgePlayer?.classList.toggle("is-collapsed") || false;
    edgeToggle.setAttribute("aria-expanded", String(!collapsed));
    edgeToggle.setAttribute("aria-label", collapsed ? "Jetzt-läuft-Player ausklappen" : "Jetzt-läuft-Player einklappen");
  });

  window.addEventListener("scroll", () => {
    const scroll = window.scrollY;

    if (scroll > 80) {
      header.classList.add("shrink");
      edgePlayer?.classList.add("is-collapsed");
      edgeToggle?.setAttribute("aria-expanded", "false");
      edgeToggle?.setAttribute("aria-label", "Jetzt-läuft-Player ausklappen");
    } else {
      header.classList.remove("shrink");
      edgePlayer?.classList.remove("is-collapsed");
      edgeToggle?.setAttribute("aria-expanded", "true");
      edgeToggle?.setAttribute("aria-label", "Jetzt-läuft-Player einklappen");
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

  const validStations = ["rhywaelle", "winterlord", "rhyrock"];
  const storedStation = localStorage.getItem("frg_selected_station");
  let current = validStations.includes(storedStation) ? storedStation : "rhywaelle";
  let playing = false;
  let songInterval = null;
  const heroPlayBtn = document.getElementById("heroPlayBtn");
  const edgePlayBtn = document.getElementById("edgePlayBtn");
  const edgeTitle = document.getElementById("edgeNowPlayingTitle");
  const edgeArtist = document.getElementById("edgeNowPlayingArtist");
  const edgeStation = document.getElementById("edgeStation");

  function updateHeroPlayState() {
    if (!heroPlayBtn) return;
    heroPlayBtn.textContent = playing ? "⏸" : "▶";
    heroPlayBtn.setAttribute("aria-label", playing ? "Radio pausieren" : "Radio starten");
    heroPlayBtn.classList.toggle("is-playing", playing);
  }

  function updateEdgePlayState() {
    if (!edgePlayBtn) return;
    edgePlayBtn.textContent = playing ? "⏸" : "▶";
    edgePlayBtn.setAttribute("aria-label", playing ? "Radio pausieren" : "Radio starten");
    edgePlayBtn.classList.toggle("is-playing", playing);
  }

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
    if (!validStations.includes(s)) return;
    current = s;
    localStorage.setItem("frg_selected_station", current);
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
    if (edgeStation) edgeStation.textContent = stationNames[current];

    updateNowPlaying();
    initSongHistory();
  }

  stations.forEach(btn => {
    btn.addEventListener("click", () => {
      setStation(btn.dataset.station);
    });
  });

  edgePlayBtn?.addEventListener("click", () => playBtn.click());

  playBtn.addEventListener("click", () => {
    if (!playing) {
      audio.src = streams[current];
      audio.play();
      playing = true;
      playBtn.textContent = "⏸";
      updateHeroPlayState();
      updateEdgePlayState();
      document.querySelectorAll(".header-live-visual, .live-visual").forEach(el => el.classList.add("is-playing"));
      startSongUpdates();
    } else {
      audio.pause();
      playing = false;
      playBtn.textContent = "▶";
      updateHeroPlayState();
      updateEdgePlayState();
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
      const heroTitle = document.getElementById("heroNowPlayingTitle");
      const heroArtist = document.getElementById("heroNowPlayingArtist");
      const legacyHeroNowPlaying = document.getElementById("heroNowPlaying");
      if (heroTitle) heroTitle.textContent = title;
      if (heroArtist) heroArtist.textContent = artist || "Fleury Radio Group™";
      if (legacyHeroNowPlaying) legacyHeroNowPlaying.textContent = text;
      if (edgeTitle) edgeTitle.textContent = title;
      if (edgeArtist) edgeArtist.textContent = artist || "Fleury Radio Group™";
      document.querySelectorAll("[data-station-now-playing]").forEach(card => {
        const isCurrent = card.dataset.stationNowPlaying === current;
        card.hidden = !isCurrent;
        if (isCurrent) {
          card.querySelector(".station-now-title")?.replaceChildren(document.createTextNode(title));
          card.querySelector(".station-now-artist")?.replaceChildren(document.createTextNode(artist || "Fleury Radio Group™"));
        }
      });

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
      const heroTitle = document.getElementById("heroNowPlayingTitle");
      const heroArtist = document.getElementById("heroNowPlayingArtist");
      if (heroTitle) heroTitle.textContent = "Live Stream";
      if (heroArtist) heroArtist.textContent = "Bereit zum Hören";
      if (edgeTitle) edgeTitle.textContent = "Live Stream";
      if (edgeArtist) edgeArtist.textContent = "Bereit zum Hören";
      document.querySelectorAll("[data-station-now-playing]").forEach(card => {
        card.hidden = card.dataset.stationNowPlaying !== current;
        if (!card.hidden) {
          card.querySelector(".station-now-title")?.replaceChildren(document.createTextNode("Live Stream"));
          card.querySelector(".station-now-artist")?.replaceChildren(document.createTextNode("Bereit zum Hören"));
        }
      });
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

  setStation(current);
  updateEdgePlayState();
}

/* =========================
SONG HISTORY & PROGRAM OVERVIEW
========================= */

const frgProgram = [
  { title: "FRG Schweiz Special", date: "2026-08-01T12:00:00+02:00", end: "2026-08-02T00:00:00+02:00", description: "Alle Sender widmen sich der Schweiz zum Nationalfeiertag." },
  { title: "FRG Crossover Night", date: "2026-09-26T19:00:00+02:00", end: "2026-09-26T22:00:00+02:00", description: "Genre-Öffnung zwischen den Sendern." },
  { title: "1 Jahr FRG Jubiläum", date: "2026-10-28T12:00:00+01:00", end: "2026-10-29T00:00:00+01:00", description: "Ein Jahr Fleury Radio Group – mit einem besonderen Rückblick." },
  { title: "FRG Halloween Special", date: "2026-10-31T16:00:00+01:00", end: "2026-10-31T23:59:00+01:00", description: "Spezialprogramm mit dunklen Sounds und besonderen Sets." },
  { title: "FRG Crossover Night", date: "2026-11-28T19:00:00+01:00", end: "2026-11-28T22:00:00+01:00", description: "Die FRG-Sender öffnen ihre Genres füreinander." },
  { title: "FRG Weihnachten", date: "2026-12-19T00:00:00+01:00", end: "2026-12-26T23:59:00+01:00", description: "Weihnachtsspecial auf allen Sendern." },
  { title: "FRG Neujahres Special", date: "2026-12-31T13:00:00+01:00", end: "2027-01-01T01:00:00+01:00", description: "Jahresabschluss und Hits des Jahres." }
];

const frgStationConfig = {
  rhywaelle: { name: "Radio Rhywälle", api: "https://api.laut.fm/station/rhywaelle/last_songs" },
  winterlord: { name: "Winterlord FM", api: "https://api.laut.fm/station/winterlord-fm/last_songs" },
  rhyrock: { name: "RhyRock Radio", api: "https://api.laut.fm/station/rhyrock-radio/last_songs" }
};

function formatSwissDate(value) {
  return new Intl.DateTimeFormat("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function initSongHistory() {
  const root = document.getElementById("song-history");
  if (!root) return;
  const current = localStorage.getItem("frg_selected_station") || "rhywaelle";
  const station = frgStationConfig[current] || frgStationConfig.rhywaelle;
  const title = root.querySelector("[data-history-station]");
  if (title) title.textContent = station.name;
  root.setAttribute("aria-busy", "true");

  fetch(station.api)
    .then(res => { if (!res.ok) throw new Error("History unavailable"); return res.json(); })
    .then(songs => {
      const list = root.querySelector("[data-history-list]");
      if (!list) return;
      const entries = songs.filter(item => item.type === "song").slice(0, 6);
      list.innerHTML = entries.length ? entries.map((item, index) => `
        <li class="history-item">
          <span class="history-index">${String(index + 1).padStart(2, "0")}</span>
          <span class="history-copy"><strong>${escapeHtml(item.title || "Unbekannter Titel")}</strong><small>${escapeHtml(item.artist?.name || "Unbekannter Interpret")}</small></span>
          <time>${item.started_at ? formatSwissDate(item.started_at).split(", ")[1] : ""}</time>
        </li>`).join("") : "<li class=\"history-empty\">Noch keine Titel verfügbar.</li>";
    })
    .catch(() => {
      const list = root.querySelector("[data-history-list]");
      if (list) list.innerHTML = "<li class=\"history-empty\">Die Song-History ist momentan nicht erreichbar.</li>";
    })
    .finally(() => root.setAttribute("aria-busy", "false"));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>\"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\\\"": "&quot;", "'": "&#039;" }[char] || char));
}

function initProgramOverview() {
  const root = document.getElementById("program-overview");
  if (!root) return;
  const list = root.querySelector("[data-program-list]");
  if (!list) return;
  const now = new Date();
  const upcoming = frgProgram.filter(item => new Date(item.end) > now).slice(0, 5);
  list.innerHTML = upcoming.length ? upcoming.map(item => `
    <article class="program-item">
      <time>${formatSwissDate(item.date)}</time>
      <div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.description)}</p></div>
    </article>`).join("") : "<p class=\"history-empty\">Neue Spezialsendungen werden bald angekündigt.</p>";
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
GEWINNSPIEL-COUNTDOWN
========================= */
function initGiveawayCountdown() {
  if (giveawayCountdownInterval) {
    clearInterval(giveawayCountdownInterval);
    giveawayCountdownInterval = null;
  }

  const root = document.querySelector("[data-giveaway-countdown]");
  if (!root) return;

  const deadline = new Date("2026-09-26T20:00:00+02:00").getTime();
  const days = root.querySelector("[data-giveaway-days]");
  const hours = root.querySelector("[data-giveaway-hours]");
  const minutes = root.querySelector("[data-giveaway-minutes]");
  const seconds = root.querySelector("[data-giveaway-seconds]");
  const status = root.querySelector(".giveaway-countdown-status");

  function setValue(element, value) {
    if (element) element.textContent = String(value).padStart(2, "0");
  }

  function update() {
    const diff = deadline - Date.now();
    if (diff <= 0) {
      setValue(days, 0);
      setValue(hours, 0);
      setValue(minutes, 0);
      setValue(seconds, 0);
      root.dataset.expired = "true";
      if (status) status.textContent = "Das Gewinnspiel ist beendet.";
      clearInterval(giveawayCountdownInterval);
      giveawayCountdownInterval = null;
      return;
    }

    setValue(days, Math.floor(diff / 86400000));
    setValue(hours, Math.floor((diff % 86400000) / 3600000));
    setValue(minutes, Math.floor((diff % 3600000) / 60000));
    setValue(seconds, Math.floor((diff % 60000) / 1000));
  }

  update();
  giveawayCountdownInterval = setInterval(update, 1000);
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
  initGiveawayCountdown();
  initEventFilter();
  initAccordion(); // Neu hinzugefügt
  initSongHistory();
  initProgramOverview();

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
    // Die geöffnete Senderseite darf den bewusst gewählten Sender nicht überschreiben.
    // Der Player bleibt auf dem zuletzt ausgewählten Sender, bis der Nutzer aktiv wechselt.
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
    if (pageStation.classList.contains("station-now-playing-button")) {
      document.getElementById("playBtn")?.click();
    }
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
