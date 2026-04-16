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
    if (!res.ok) return console.error("Partial Fehler:", url);
    slot.innerHTML = await res.text();
  } catch (err) {
    console.error(err);
  }
}


/* =========================
INIT SYSTEM
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  // sicherstellen dass DOM wirklich drin ist
  setTimeout(() => {
    initMenu();
  }, 50);

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

  // DROPDOWNS FIX
  nav.addEventListener("click", (e) => {
    const toggle = e.target.closest(".dropdown-toggle");
    if (!toggle) return;

    e.preventDefault();
    e.stopPropagation();

    const dropdown = toggle.closest(".nav-dropdown");
    if (!dropdown) return;

    nav.querySelectorAll(".nav-dropdown").forEach(d => {
      if (d !== dropdown) d.classList.remove("open");
    });

    dropdown.classList.toggle("open");
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
COUNTDOWN (7 TAGE LOGIK)
========================= */

const frgEvents = [
  { title: "FRG Showcase Week", date: "2026-03-23T00:00:00" },
  { title: "Labirinth Premiere", date: "2026-03-24T12:30:00" },
  { title: "Oldies Special", date: "2026-03-30T15:00:00" },
  { title: "FRG Crossover Night", date: "2026-04-25T20:00:00" }
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
  if (!event) return false;
  if (!isHome) return false;

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
RADIO PLAYER (JINGLE → STREAM)
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
      url: "https://stream.laut.fm/rhywaelle"
    },
    winterlord: {
      name: "Winterlord FM",
      url: "https://stream.laut.fm/winterlord-fm"
    },
    rhyrock: {
      name: "RhyRock Radio",
      url: "https://stream.laut.fm/rhyrock-radio"
    }
  };

  let current = "rhywaelle";
  let isPlaying = false;
  let jinglePlayed = false;

  function playStream() {
    audio.src = streams[current].url;
    audio.play().catch(console.log);

    if (nowPlaying) {
      nowPlaying.textContent = "Live: " + streams[current].name;
    }
  }

  function playJingleThenStream() {
    audio.src = "frg-jingle.mp3";

    audio.play().catch(() => {
      playStream();
      return;
    });

    audio.onended = () => {
      playStream();
      audio.onended = null;
    };
  }

  stations.forEach(btn => {
    btn.addEventListener("click", () => {
      stations.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      current = btn.dataset.station;

      if (isPlaying) playStream();
    });
  });

  playBtn.addEventListener("click", () => {
    if (!isPlaying) {
      if (!jinglePlayed) {
        jinglePlayed = true;
        playJingleThenStream();
      } else {
        playStream();
      }

      playBtn.textContent = "⏸";
      isPlaying = true;

    } else {
      audio.pause();
      playBtn.textContent = "▶";
      isPlaying = false;

      if (nowPlaying) nowPlaying.textContent = "Pause";
    }
  });
}
