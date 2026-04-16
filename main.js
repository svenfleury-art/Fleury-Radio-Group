/* -------------------------
PAGE LOADER
------------------------- */
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


/* -------------------------
PARTIALS & INIT
------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  initMenu();
  initCookies();
  initFilter();

  updateCountdown();
  setInterval(updateCountdown, 1000);

  initRadioPlayer(); // 🔥 NUR EIN PLAYER
});


/* -------------------------
PARTIAL LOADER
------------------------- */
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


/* -------------------------
MENU SYSTEM
------------------------- */
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

  btn.addEventListener("click", () => {
    nav.classList.contains("open") ? closeMenu() : openMenu();
  });

  overlay?.addEventListener("click", closeMenu);
}


/* -------------------------
COOKIE BANNER
------------------------- */
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


/* -------------------------
FILTER
------------------------- */
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


/* -------------------------
COUNTDOWN SYSTEM
------------------------- */
const frgEvents = [
  { title: "FRG Showcase Week", date: "2026-03-23T00:00:00" },
  { title: "Labirinth Premiere", date: "2026-03-24T12:30:00" },
  { title: "Oldies Special", date: "2026-03-30T15:00:00" }
];

function getNextEvent() {
  const now = Date.now();

  return frgEvents
    .map(e => ({ ...e, dateObj: new Date(e.date) }))
    .filter(e => e.dateObj > now)
    .sort((a, b) => a.dateObj - b.dateObj)[0];
}

function pad(n) {
  return String(Math.floor(n)).padStart(2, "0");
}

function updateCountdown() {
  const event = getNextEvent();
  if (!event) return;

  const diff = event.dateObj - Date.now();

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = pad(val);
  };

  set("days", diff / (1000 * 60 * 60 * 24));
  set("hours", (diff / (1000 * 60 * 60)) % 24);
  set("minutes", (diff / (1000 * 60)) % 60);
  set("seconds", (diff / 1000) % 60);
}


/* -------------------------
RADIO PLAYER (JINGLE + STREAM)
------------------------- */
function initRadioPlayer() {
  const audio = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playBtn");
  const nowPlaying = document.getElementById("nowPlaying");
  const stations = document.querySelectorAll(".station");

  if (!audio || !playBtn || !stations.length) return;

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

  function setStation(id) {
    current = id;
    if (nowPlaying) nowPlaying.textContent = "Bereit: " + streams[id].name;
  }

  stations.forEach(btn => {
    btn.addEventListener("click", () => {
      stations.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      setStation(btn.dataset.station);

      if (isPlaying) playStream();
    });
  });

  function playStream() {
    audio.src = streams[current].url;
    audio.play().catch(console.log);
  }

  async function playWithJingle() {
    try {
      audio.src = "frg-jingle.mp3";
      await audio.play();

      audio.onended = () => {
        playStream();
        audio.onended = null;
      };
    } catch (e) {
      console.log("Jingle Fehler:", e);
      playStream();
    }
  }

  playBtn.addEventListener("click", async () => {
    if (!isPlaying) {
      if (!jinglePlayed) {
        jinglePlayed = true;
        await playWithJingle();
      } else {
        playStream();
      }

      playBtn.textContent = "⏸";
      isPlaying = true;

    } else {
      audio.pause();
      playBtn.textContent = "▶";
      isPlaying = false;
    }
  });
}
