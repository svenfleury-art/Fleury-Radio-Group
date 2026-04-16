async function loadPartial(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  try {
    const res = await fetch(file);
    const html = await res.text();
    el.innerHTML = html;
  } catch (err) {
    console.error("Partial Fehler:", file, err);
  }
}


/* =========================
ROUTES
========================= */
const routes = {
  "/": "/pages/home.html",
  "/rhywälle": "/pages/rhywaelle.html",
  "/winterlord": "/pages/winterlord.html",
  "/rhyrock": "/pages/rhyrock.html",
  "/radios": "/pages/radios.html",
  "/geschichte": "/pages/geschichte.html",
  "/artists": "/pages/artists.html",
  "/team": "/pages/team.html"
};

/* =========================
LOADER
========================= */
function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => loader.remove(), 400);
  }, 500);
}

/* =========================
PAGE LOADER (SPA)
========================= */
async function loadPage(path) {
  const app = document.getElementById("app");

  const file = routes[path] || "/pages/404.html";

  try {
    const res = await fetch(file);
    const html = await res.text();

    app.innerHTML = html;

    reInitPage();
    window.scrollTo(0, 0);

  } catch (err) {
    console.error(err);
    app.innerHTML = "<h2 style='color:white;text-align:center;'>Fehler beim Laden</h2>";
  }
}

/* =========================
NAVIGATION (SPA LINKS)
========================= */
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");

  if (href && href.startsWith("/")) {
    e.preventDefault();
    history.pushState({}, "", href);
    loadPage(href);
  }
});

window.addEventListener("popstate", () => {
  loadPage(location.pathname);
});

/* =========================
REINIT AFTER PAGE CHANGE
========================= */
function reInitPage() {
  initMenu();
  initCountdown();
}

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
  };

  overlay?.addEventListener("click", () => {
    nav.classList.remove("open");
  });
}

/* =========================
COUNTDOWN (MINI FIXED)
========================= */
const frgEvents = [
  { title: "FRG Showcase", date: "2026-04-25T20:00:00" },
  { title: "FRG Special", date: "2026-06-01T20:00:00" }
];

function initCountdown() {
  const wrapper = document.querySelector(".countdown");
  if (!wrapper) return;

  const next = frgEvents.find(e => new Date(e.date) > Date.now());
  if (!next) return;

  const target = new Date(next.date);

  setInterval(() => {
    const diff = target - Date.now();

    if (diff <= 0) return;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val).padStart(2, "0");
    };

    set("days", d);
    set("hours", h);
    set("minutes", m);
    set("seconds", s);

  }, 1000);
}

/* =========================
GLOBAL RADIO PLAYER
========================= */
function initRadioPlayer() {

  const audio = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playBtn");
  const nowPlaying = document.getElementById("nowPlaying");
  const stations = document.querySelectorAll(".station");

  if (!audio || !playBtn) return;

  const streams = {
    rhywaelle: {
      url: "https://stream.laut.fm/rhywaelle",
      api: "rhywaelle"
    },
    winterlord: {
      url: "https://stream.laut.fm/winterlord-fm",
      api: "winterlord-fm"
    },
    rhyrock: {
      url: "https://stream.laut.fm/rhyrock-radio",
      api: "rhyrock-radio"
    }
  };

  let current = localStorage.getItem("frg_station") || "rhywaelle";
  let isPlaying = localStorage.getItem("frg_playing") === "true";
  let songTimer = null;

  function play() {
    audio.src = streams[current].url;
    audio.play();

    isPlaying = true;
    localStorage.setItem("frg_playing", "true");
    localStorage.setItem("frg_station", current);

    updateUI();
    fetchSong();
  }

  function pause() {
    audio.pause();
    isPlaying = false;
    localStorage.setItem("frg_playing", "false");
    updateUI();
  }

  function updateUI() {
    stations.forEach(b => {
      b.classList.toggle("active", b.dataset.station === current);
    });

    playBtn.textContent = isPlaying ? "⏸" : "▶";
  }

  async function fetchSong() {
    try {
      const res = await fetch(`https://api.laut.fm/station/${streams[current].api}/current_song`);
      const data = await res.json();

      const text = `${data.title || ""} - ${data.artist?.name || ""}`;

      clearTimeout(songTimer);

      songTimer = setTimeout(() => {
        if (isPlaying && nowPlaying) {
          nowPlaying.textContent = "🎵 " + text;
        }
      }, 6000);

    } catch (e) {}
  }

  stations.forEach(btn => {
    btn.addEventListener("click", () => {
      current = btn.dataset.station;
      play();
    });
  });

  playBtn.addEventListener("click", () => {
    isPlaying ? pause() : play();
  });

  window.setStation = (s) => {
    current = s;
    play();
  };

  function autoResume() {
    updateUI();
    setTimeout(() => {
      if (isPlaying) play();
    }, 300);
  }

  autoResume();

  setInterval(() => {
    if (isPlaying) fetchSong();
  }, 10000);
}

/* =========================
INIT SYSTEM
========================= */
window.addEventListener("DOMContentLoaded", () => {
  initLoader();
  loadPage(location.pathname);
  initRadioPlayer();
});
