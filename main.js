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
PARTIAL LOADER
------------------------- */
async function loadPartial(slotId, url) {
  const slot = document.getElementById(slotId);
  if (!slot) return;

  try {
    const res = await fetch(url);
    if (!res.ok) return console.error("Partial konnte nicht geladen werden:", url);
    slot.innerHTML = await res.text();
  } catch (err) {
    console.error("Fetch Fehler:", err);
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

  const dropdowns = nav.querySelectorAll(".nav-dropdown");

  function closeAllDropdowns() {
    dropdowns.forEach(d => d.classList.remove("open"));
  }

  function closeMenu() {
    nav.classList.remove("open");
    btn.classList.remove("active");
    btn.textContent = "☰";
    if (overlay) overlay.classList.remove("active");
    closeAllDropdowns();
  }

  function openMenu() {
    nav.classList.add("open");
    btn.classList.add("active");
    btn.textContent = "✕";
    if (overlay) overlay.classList.add("active");
  }

  closeMenu();

  btn.addEventListener("click", e => {
    e.stopPropagation();
    nav.classList.contains("open") ? closeMenu() : openMenu();
  });

  if (overlay) overlay.addEventListener("click", closeMenu);

  document.addEventListener("click", e => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) closeMenu();
  });

  // DROPDOWN
  nav.addEventListener("click", e => {
    const toggleBtn = e.target.closest(".dropdown-toggle");
    if (!toggleBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const dropdown = toggleBtn.closest(".nav-dropdown");
    if (!dropdown) return;

    const isOpen = dropdown.classList.contains("open");

    closeAllDropdowns();

    if (!isOpen) dropdown.classList.add("open");
  });
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
    banner.classList.add("hide");
    setTimeout(() => (banner.style.display = "none"), 600);
  });
}

/* -------------------------
EVENT FILTER
------------------------- */
function initFilter() {
  const buttons = document.querySelectorAll(".filter-btn");
  const events = document.querySelectorAll(".event-card");
  if (!buttons.length) return;

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      buttons.forEach(b => b.classList.remove("active"));
      button.classList.add("active");

      events.forEach(event => {
        event.style.display =
          filter === "all" || event.classList.contains(filter)
            ? "block"
            : "none";
      });
    });
  });
}

/* -------------------------
COUNTDOWN
------------------------- */
const frgEvents = [
  { title: "FRG Showcase Week", date: "2026-03-23T00:00:00" },
  { title: "Premiere Skip", date: "2026-03-24T12:30:00" },
  { title: "Oldies Rhywälle", date: "2026-03-30T15:00:00" }
];

const PAGE_MODE = document.body.dataset.page || "home";

function pad(n) {
  return String(Math.floor(n)).padStart(2, "0");
}

function getNextEvent() {
  const now = Date.now();

  return frgEvents
    .map(e => ({ ...e, dateObj: new Date(e.date) }))
    .filter(e => e.dateObj > now)
    .sort((a, b) => a.dateObj - b.dateObj)[0] || null;
}

function updateCountdown() {
  const wrapper = document.querySelector(".countdown");
  if (!wrapper) return;

  const event = getNextEvent();
  if (!event) return (wrapper.style.display = "none");

  const diff = event.dateObj - Date.now();
  if (diff <= 0) return;

  wrapper.style.display = "block";

  const title = document.getElementById("countdown-title");
  const days = document.getElementById("days");
  const hours = document.getElementById("hours");
  const minutes = document.getElementById("minutes");
  const seconds = document.getElementById("seconds");

  if (title) title.textContent = event.title;

  update(days, diff / 86400000);
  update(hours, (diff / 3600000) % 24);
  update(minutes, (diff / 60000) % 60);
  update(seconds, (diff / 1000) % 60);
}

function update(el, val) {
  if (!el) return;
  el.textContent = pad(val);
}

/* -------------------------
JINGLE PLAYER
------------------------- */
function initJinglePlayer() {
  const buttons = document.querySelectorAll(".playBtn");
  const audio = document.getElementById("audioPlayer");

  if (!buttons.length || !audio) return;

  let played = false;
  let isPlaying = false;

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const stream = btn.getAttribute("data-stream");
      if (!stream) return;

      if (isPlaying) {
        audio.pause();
        audio.currentTime = 0;
      }

      isPlaying = true;

      if (!played) {
        played = true;

        audio.src = "frg-jingle.mp3";

        const onEnd = () => {
          audio.src = stream;
          audio.play();
          audio.removeEventListener("ended", onEnd);
        };

        audio.addEventListener("ended", onEnd);
        audio.play();
      } else {
        audio.src = stream;
        audio.play();
      }
    });
  });
}

/* -------------------------
FORM + AGB
------------------------- */
function initForms() {
  const form = document.getElementById("artist-form");
  const msg = document.getElementById("form-msg");

  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();

      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        msg.textContent = "Erfolgreich gesendet!";
        form.reset();
      } else {
        msg.textContent = "Fehler beim Senden.";
      }
    });
  }

  const agb = document.getElementById("agb");
  const submit = document.getElementById("submitBtn");

  if (agb && submit) {
    agb.addEventListener("change", () => {
      submit.disabled = !agb.checked;
    });
  }
}

/* -------------------------
ANCHOR FIX
------------------------- */
window.addEventListener("load", () => {
  if (window.location.hash) {
    const el = document.querySelector(window.location.hash);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }
});

/* -------------------------
BOOT
------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  initMenu();
  initCookies();
  initFilter();
  initForms();
  initJinglePlayer();

  updateCountdown();
  setInterval(updateCountdown, 1000);
});
