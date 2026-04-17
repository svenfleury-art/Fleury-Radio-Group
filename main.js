/* =========================
CONFIG
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

let countdownInterval = null;

/* =========================
PARTIAL LOADER
========================= */
async function loadPartial(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(file);

    el.innerHTML = await res.text();
  } catch (err) {
    console.error("Partial Fehler:", file, err);
  }
}

/* =========================
SPA PAGE LOADER
========================= */
async function loadPage(path) {
  const app = document.getElementById("app");
  if (!app) return;

  const file = routes[path] || "/pages/404.html";

  try {
    const res = await fetch(file);
    app.innerHTML = await res.text();

    window.scrollTo(0, 0);

    reInitPage();

  } catch (err) {
    console.error(err);
    app.innerHTML = "<h2 style='color:white;text-align:center;'>Fehler beim Laden</h2>";
  }
}

/* =========================
REINIT (nach Seitenwechsel)
========================= */
function reInitPage() {
  initCountdown();
  initCookieBanner();
}

/* =========================
SPA NAVIGATION (NUR data-link)
========================= */
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-link]");
  if (!link) return;

  const href = link.getAttribute("href");

  if (href && routes[href]) {
    e.preventDefault();
    history.pushState({}, "", href);
    loadPage(href);
  }
});

window.addEventListener("popstate", () => {
  loadPage(location.pathname);
});

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
MENU + DROPDOWN (FIXED)
========================= */
function initMenu() {
  const btn = document.getElementById("hamburgerBtn");
  const nav = document.getElementById("mainNav");
  const overlay = document.getElementById("menu-overlay");

  if (!btn || !nav) return;

  // HAMBURGER
  btn.onclick = (e) => {
    e.stopPropagation();
    nav.classList.toggle("open");
    overlay?.classList.toggle("active");
  };

  // OVERLAY
  overlay?.addEventListener("click", () => {
    nav.classList.remove("open");
    overlay.classList.remove("active");
  });

  // OUTSIDE CLICK
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) {
      nav.classList.remove("open");
      overlay?.classList.remove("active");
    }
  });

  // DROPDOWNS 🔥
  nav.querySelectorAll(".dropdown-toggle").forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();

      const dropdown = toggle.closest(".nav-dropdown");

      nav.querySelectorAll(".nav-dropdown").forEach(d => {
        if (d !== dropdown) d.classList.remove("open");
      });

      dropdown.classList.toggle("open");
    });
  });
}

/* =========================
COOKIE BANNER (FIXED)
========================= */
function initCookieBanner() {
  const banner = document.getElementById("cookie-banner");
  const btn = document.getElementById("cookie-accept");

  if (!banner || !btn) return;

  if (localStorage.getItem("frg_cookie") === "1") {
    banner.style.display = "none";
    return;
  }

  banner.style.display = "flex";

  btn.onclick = () => {
    localStorage.setItem("frg_cookie", "1");

    banner.style.opacity = "0";
    setTimeout(() => {
      banner.style.display = "none";
    }, 300);
  };
}

/* =========================
COUNTDOWN
========================= */
const frgEvents = [
  { title: "FRG Showcase", date: "2026-04-25T20:00:00" },
  { title: "FRG Special", date: "2026-06-01T20:00:00" }
];

function initCountdown() {
  const wrapper = document.querySelector(".countdown");
  if (!wrapper) return;

  if (countdownInterval) clearInterval(countdownInterval);

  const next = frgEvents.find(e => new Date(e.date) > Date.now());
  if (!next) return;

  const target = new Date(next.date);

  countdownInterval = setInterval(() => {
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
RADIO PLAYER
========================= */
function initRadioPlayer() {
  const audio = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playBtn");
  const nowPlaying = document.getElementById("nowPlaying");
  const stations = document.querySelectorAll(".station");

  if (!audio || !playBtn) return;

  const streams = {
    rhywaelle: { url: "https://stream.laut.fm/rhywaelle", api: "rhywaelle" },
    winterlord: { url: "https://stream.laut.fm/winterlord-fm", api: "winterlord-fm" },
    rhyrock: { url: "https://stream.laut.fm/rhyrock-radio", api: "rhyrock-radio" }
  };

  let current = localStorage.getItem("frg_station") || "rhywaelle";
  let isPlaying = localStorage.getItem("frg_playing") === "true";

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

      if (nowPlaying && isPlaying) {
        nowPlaying.textContent = `🎵 ${data.title || ""} - ${data.artist?.name || ""}`;
      }
    } catch {}
  }

  function play() {
    audio.src = streams[current].url;
    audio.play().catch(() => {});

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
    if (!streams[s]) return;
    current = s;
    play();
  };

  updateUI();

  if (isPlaying) {
    setTimeout(play, 300);
  }

  setInterval(() => {
    if (isPlaying) fetchSong();
  }, 10000);
}

/* =========================
BOOT
========================= */
window.addEventListener("DOMContentLoaded", async () => {
  initLoader();

  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  initMenu();
  initCookieBanner();
  initCountdown();
  initRadioPlayer();

  loadPage(location.pathname);
});
