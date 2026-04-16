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
PARTIAL LOADER SYSTEM
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  initMenu();
  initCookies();
  initFilter();
  initCountdown();
  initJinglePlayer();
  initRadioPlayer(); // 🎧 FRG GLOBAL PLAYER

  setInterval(refreshAllStations, 30000);
});


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
MENU SYSTEM
========================= */
function initMenu() {
  const btn = document.getElementById("hamburgerBtn");
  const nav = document.getElementById("mainNav");
  const overlay = document.getElementById("menu-overlay");

  if (!btn || !nav) return;

  const close = () => {
    nav.classList.remove("open");
    btn.textContent = "☰";
    if (overlay) overlay.classList.remove("active");
  };

  const open = () => {
    nav.classList.add("open");
    btn.textContent = "✕";
    if (overlay) overlay.classList.add("active");
  };

  close();

  btn.addEventListener("click", e => {
    e.stopPropagation();
    nav.classList.contains("open") ? close() : open();
  });

  document.addEventListener("click", e => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) close();
  });

  if (overlay) overlay.addEventListener("click", close);
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
COUNTDOWN
========================= */
function initCountdown() {
  const el = document.querySelector(".countdown");
  if (!el) return;

  setInterval(() => {
    el.textContent = "Countdown läuft...";
  }, 1000);
}


/* =========================
FRG RADIO PLAYER (FIXED)
========================= */
function initRadioPlayer() {
  const audio = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playBtn");
  const nowPlaying = document.getElementById("nowPlaying");
  const stations = document.querySelectorAll(".station");

  if (!audio || !playBtn || !stations.length) return;

  const streams = {
    rhywaelle: {
      name: "Radio Rhywälle",
      url: "https://dein-stream-link/rhywaelle.mp3"
    },
    winterlord: {
      name: "Winterlord FM",
      url: "https://dein-stream-link/winterlord.mp3"
    },
    rhyrock: {
      name: "RhyRock Radio",
      url: "https://dein-stream-link/rhyrock.mp3"
    }
  };

  let currentStation = "rhywaelle";
  let isPlaying = false;

  stations.forEach(btn => {
    btn.addEventListener("click", () => {

      stations.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      currentStation = btn.dataset.station;

      audio.src = streams[currentStation].url;
      nowPlaying.textContent = "Bereit: " + streams[currentStation].name;

      if (isPlaying) audio.play();
    });
  });

  playBtn.addEventListener("click", async () => {

    if (!audio.src) {
      audio.src = streams[currentStation].url;
    }

    if (isPlaying) {
      audio.pause();
      playBtn.textContent = "▶";
      nowPlaying.textContent = "Pause: " + streams[currentStation].name;
    } else {
      await audio.play().catch(() => {});
      playBtn.textContent = "⏸";
      nowPlaying.textContent = "Live: " + streams[currentStation].name;
    }

    isPlaying = !isPlaying;
  });
}


/* =========================
JINGLE PLAYER (FIXED)
========================= */
function initJinglePlayer() {
  const buttons = document.querySelectorAll(".playBtn");
  const audio = document.getElementById("audioPlayer");

  if (!buttons.length || !audio) return;

  let hasPlayedJingle = false;

  buttons.forEach(button => {
    button.addEventListener("click", () => {

      const streamUrl = button.getAttribute("data-stream");
      if (!streamUrl) return;

      if (hasPlayedJingle === false) {
        hasPlayedJingle = true;

        audio.src = "frg-jingle.mp3";

        audio.onended = () => {
          audio.src = streamUrl;
          audio.play();
        };

        audio.play();
      } else {
        audio.src = streamUrl;
        audio.play();
      }
    });
  });
}
