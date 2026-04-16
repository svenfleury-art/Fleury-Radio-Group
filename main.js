/* =========================
PAGE LOADER
========================= */
function initLoader() {
  const loader = document.createElement("div");
  loader.id = "loader";
  loader.innerHTML = '<div class="radio">📻</div>';
  document.body.prepend(loader);
}
initLoader();

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.style.opacity = "0";
  setTimeout(() => loader.remove(), 400);
});


/* =========================
PARTIAL LOADER
========================= */
async function loadPartial(slotId, url) {
  const slot = document.getElementById(slotId);
  if (!slot) return;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(url);
    slot.innerHTML = await res.text();
  } catch (err) {
    console.error("Partial Fehler:", err);
  }
}


/* =========================
INIT SYSTEM
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  // WICHTIG: Kein setTimeout mehr nötig
  initMenu();
  initCookies();
  initFilter();
  initCountdown();
  initRadioPlayer();
});


/* =========================
MENU + DROPDOWNS
========================= */
function initMenu() {
  const btn = document.getElementById("hamburgerBtn");
  const nav = document.getElementById("mainNav");
  const overlay = document.getElementById("menu-overlay");

  if (!btn || !nav) return;

  function closeMenu() {
    nav.classList.remove("open");
    btn.textContent = "☰";
    overlay?.classList.remove("active");

    // alle Dropdowns schliessen
    nav.querySelectorAll(".nav-dropdown").forEach(d => {
      d.classList.remove("open");
    });
  }

  function openMenu() {
    nav.classList.add("open");
    btn.textContent = "✕";
    overlay?.classList.add("active");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    nav.classList.contains("open") ? closeMenu() : openMenu();
  });

  overlay?.addEventListener("click", closeMenu);

  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) {
      closeMenu();
    }
  });

  // DROPDOWN FIX
  nav.querySelectorAll(".dropdown-toggle").forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = toggle.closest(".nav-dropdown");
      if (!dropdown) return;

      // andere schliessen
      nav.querySelectorAll(".nav-dropdown").forEach(d => {
        if (d !== dropdown) d.classList.remove("open");
      });

      dropdown.classList.toggle("open");
    });
  });
}


/* =========================
COOKIE BANNER
========================= */
function initCookies() {
  const banner = document.getElementById("cookie-banner");
  const button = document.getElementById("cookie-accept");
  if (!banner || !button) return;

  if (localStorage.getItem("frgCookiesAccepted")) {
    banner.style.display = "none";
    return;
  }

  banner.style.display = "flex";

  button.addEventListener("click", () => {
    localStorage.setItem("frgCookiesAccepted", "true");
    banner.style.display = "none";
  });
}


/* =========================
FILTER SYSTEM
========================= */
function initFilter() {
  const buttons = document.querySelectorAll(".filter-btn");
  const events = document.querySelectorAll(".event-card");
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      events.forEach(ev => {
        ev.style.display =
          filter === "all" || ev.classList.contains(filter)
            ? "block"
            : "none";
      });
    });
  });
}


/* =========================
COUNTDOWN (FIXED)
========================= */

const frgEvents = [
   { title: "FRG Showcase Week", date: "2026-04-17T00:00:00" },
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

const isHome = document.body.dataset.page === "home";

function getNextEvent() {
  const now = Date.now();

  return frgEvents
    .map(e => ({ ...e, dateObj: new Date(e.date) }))
    .filter(e => e.dateObj.getTime() > now)
    .sort((a, b) => a.dateObj - b.dateObj)[0] || null;
}

function shouldShowCountdown(event) {
  if (!event || !isHome) return false;

  const diff = event.dateObj.getTime() - Date.now();
  return diff <= 7 * 24 * 60 * 60 * 1000;
}

function pad(n) {
  return String(Math.floor(n)).padStart(2, "0");
}

function updateCountdown() {
  const wrapper = document.querySelector(".countdown");
  if (!wrapper) return;

  const event = getNextEvent();

  if (!shouldShowCountdown(event)) {
    wrapper.style.display = "none";
    return;
  }

  wrapper.style.display = "block";

  const diff = event.dateObj.getTime() - Date.now();
  if (diff <= 0) return;

  const days = diff / (1000 * 60 * 60 * 24);
  const hours = (diff / (1000 * 60 * 60)) % 24;
  const minutes = (diff / (1000 * 60)) % 60;
  const seconds = (diff / 1000) % 60;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = pad(val);
  };

  set("days", days);
  set("hours", hours);
  set("minutes", minutes);
  set("seconds", seconds);
}

function initCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}


/* =========================
RADIO PLAYER
========================= */
function initRadioPlayer() {
  const audio = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playBtn");
  const nowPlaying = document.getElementById("nowPlaying");
  const stations = document.querySelectorAll(".station");

  if (!audio || !playBtn) return;

  const streams = {
    rhywaelle: {
      name: "Radio Rhywälle",
      url: "https://stream.laut.fm/rhywaelle",
      api: "rhywaelle"
    },
    winterlord: {
      name: "Winterlord FM",
      url: "https://stream.laut.fm/winterlord-fm",
      api: "winterlord-fm"
    },
    rhyrock: {
      name: "RhyRock Radio",
      url: "https://stream.laut.fm/rhyrock-radio",
      api: "rhyrock-radio"
    }
  };

  let current = localStorage.getItem("frgStation") || "rhywaelle";
  let isPlaying = localStorage.getItem("frgPlaying") === "true";
  let songTimeout = null;

  /* =========================
  UI UPDATE
  ========================= */
  function updateUI() {
    stations.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.station === current);
    });

    playBtn.textContent = isPlaying ? "⏸" : "▶";

    if (!isPlaying) {
      nowPlaying.textContent = "Pause";
    }
  }

  /* =========================
  STREAM CONTROL
  ========================= */
  function playStream() {
    audio.src = streams[current].url;
    audio.play().catch(console.log);

    isPlaying = true;
    localStorage.setItem("frgPlaying", "true");
    localStorage.setItem("frgStation", current);

    updateUI();
    fetchNowPlaying();
  }

  function pauseStream() {
    audio.pause();
    isPlaying = false;
    localStorage.setItem("frgPlaying", "false");

    updateUI();
  }

  /* =========================
  NOW PLAYING (LAUT.FM)
  ========================= */
  async function fetchNowPlaying() {
    const station = streams[current].api;

    try {
      const res = await fetch(`https://api.laut.fm/station/${station}/current_song`);
      const data = await res.json();

      const artist = data.artist?.name || "Unbekannt";
      const title = data.title || "Kein Titel";

      const text = `🎵 ${title} – ${artist}`;

      // alten Timer stoppen
      clearTimeout(songTimeout);

      // dein Delay (10s)
      songTimeout = setTimeout(() => {
        if (isPlaying) {
          nowPlaying.textContent = text;
        }
      }, 10000);

    } catch (err) {
      console.error("NowPlaying Fehler:", err);
    }
  }

  /* =========================
  EVENTS
  ========================= */
  stations.forEach(btn => {
    btn.addEventListener("click", () => {
      current = btn.dataset.station;
      playStream();
    });
  });

  playBtn.addEventListener("click", () => {
    isPlaying ? pauseStream() : playStream();
  });

  /* =========================
  GLOBAL BUTTON (SEITEN)
  ========================= */
  window.setStation = function(station) {
    if (!streams[station]) return;
    current = station;
    playStream();
  };

  /* =========================
  AUTO UPDATE SONG
  ========================= */
  setInterval(() => {
    if (isPlaying) {
      fetchNowPlaying();
    }
  }, 10000);

  /* =========================
  INIT
  ========================= */
  updateUI();

  if (isPlaying) {
    playStream();
  }
}
