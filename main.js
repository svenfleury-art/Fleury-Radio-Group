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
PARTIALS & DOMContentLoaded
------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  initMenu();
  initCookies();
  initFilter();
  initCountdown();
  initJinglePlayer(); // 🔥 WICHTIG: Jingle Player initialisieren

  refreshAllStations();
  initPlayerCounting();
  setInterval(refreshAllStations, 30000);
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
MENU SYSTEM & DROPDOWNS
------------------------- */
function initMenu() {
  const btn = document.getElementById("hamburgerBtn")
  const nav = document.getElementById("mainNav")
  const overlay = document.getElementById("menu-overlay")
  if (!btn || !nav) return

  function closeMenu() {
    nav.classList.remove("open")
    btn.classList.remove("active")
    btn.textContent = "☰"
    if (overlay) overlay.classList.remove("active")
  }
  function openMenu() {
    nav.classList.add("open")
    btn.classList.add("active")
    btn.textContent = "✕"
    if (overlay) overlay.classList.add("active")
  }
  closeMenu()

  btn.addEventListener("click", e => {
    e.stopPropagation()
    nav.classList.contains("open") ? closeMenu() : openMenu()
  })
  if (overlay) overlay.addEventListener("click", closeMenu)
  document.addEventListener("click", e => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) closeMenu()
  })
  nav.addEventListener("click", e => {
    const toggleBtn = e.target.closest(".dropdown-toggle")
    if (!toggleBtn) return
    e.preventDefault()
    e.stopPropagation()
    const dropdown = toggleBtn.closest(".nav-dropdown")
    if (!dropdown) return
    nav.querySelectorAll(".nav-dropdown").forEach(d => { if (d !== dropdown) d.classList.remove("open") })
    dropdown.classList.toggle("open")
  })
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
          filter === "all" || event.classList.contains(filter) ? "block" : "none";
      });
    });
  });
}



/* -------------------------
Countdown
------------------------- */
const frgEvents = [
  { title: "FRG Showcase Week", date: "2026-03-23T00:00:00" },
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

// ⭐ PAGE MODE: "home" oder "special"
const PAGE_MODE = "special";

function pad(num) {
  return String(num).padStart(2, "0");
}

// 🔥 nächstes Event finden
function getNextEvent() {
  const now = new Date();

  return frgEvents
    .map(e => ({ ...e, dateObj: new Date(e.date) }))
    .filter(e => e.dateObj > now)
    .sort((a, b) => a.dateObj - b.dateObj)[0] || null;
}

// 🧠 Anzeige-Regel
function shouldShow(event) {
  const now = new Date();
  const diff = event.dateObj - now;

  // ⭐ Spezial-Seite: immer anzeigen
  if (PAGE_MODE === "special") return true;

  // 🏠 Startseite: nur 7 Tage vorher
  return diff <= 7 * 24 * 60 * 60 * 1000;
}

// 🎬 Flip Update
function updateUnit(id, newValue) {
  const flipCard = document.getElementById(id);
  const staticTop = flipCard.querySelector(".static .top");
  const staticBottom = flipCard.querySelector(".static .bottom");

  const currentValue = staticTop.textContent;

  if (currentValue === newValue) return;

  const animTop = flipCard.querySelector(".flip-animation .top");
  const animBottom = flipCard.querySelector(".flip-animation .bottom");

  animTop.textContent = currentValue;
  animBottom.textContent = newValue;

  flipCard.classList.add("flip");

  setTimeout(() => {
    staticTop.textContent = newValue;
    staticBottom.textContent = newValue;
    flipCard.classList.remove("flip");
  }, 1000);
}

// 🔄 aktuelles Event merken
let currentEventId = null;

// 🚀 Hauptloop
function updateCountdown() {
  const event = getNextEvent();
  const wrapper = document.querySelector(".countdown");

  if (!event || !wrapper) return;

  // 🔄 Event Wechsel erkennen
  if (currentEventId !== event.date) {
    currentEventId = event.date;

    ["flipDays", "flipHours", "flipMinutes", "flipSeconds"].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      el.querySelector(".static .top").textContent = "00";
      el.querySelector(".static .bottom").textContent = "00";
    });
  }

  // ⭐ Anzeige-Regel
  if (!shouldShow(event)) {
    wrapper.style.display = "none";
    return;
  } else {
    wrapper.style.display = "block";
  }

  // 🏷️ Titel setzen
  const titleEl = document.getElementById("countdown-title");
  if (titleEl) titleEl.textContent = event.title;

  const now = new Date();
  const diff = event.dateObj - now;

  if (diff <= 0) return;

  const d = pad(Math.floor(diff / (1000 * 60 * 60 * 24)));
  const h = pad(Math.floor((diff / (1000 * 60 * 60)) % 24));
  const m = pad(Math.floor((diff / (1000 * 60)) % 60));
  const s = pad(Math.floor((diff / 1000) % 60));

  updateUnit("flipDays", d);
  updateUnit("flipHours", h);
  updateUnit("flipMinutes", m);
  updateUnit("flipSeconds", s);
}

// 🧱 Initial Reset
["flipDays", "flipHours", "flipMinutes", "flipSeconds"].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;

  el.querySelector(".static .top").textContent = "00";
  el.querySelector(".static .bottom").textContent = "00";
});

// ▶ Start
setInterval(updateCountdown, 500);
updateCountdown();

/* -------------------------
FRG JINGLE PLAYER
------------------------- */
function initJinglePlayer() {
  const buttons = document.querySelectorAll(".playBtn");
  const audio = document.getElementById("audioPlayer");

  if (!buttons.length || !audio) return;

  let hasPlayedJingle = false;

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const streamUrl = button.getAttribute("data-stream");
      if (!streamUrl) return;

      audio.pause();
      audio.currentTime = 0;

      if (!hasPlayedJingle) {
        hasPlayedJingle = true;

        console.log("▶️ Jingle startet");

        audio.src = "frg-jingle.mp3"; // ✅ Datei liegt im gleichen Ordner wie HTML
        audio.play().catch(err => console.log(err));

        const handleEnd = () => {
          console.log("🎧 Stream startet");

          audio.src = streamUrl;
          audio.play().catch(err => console.log(err));

          audio.removeEventListener("ended", handleEnd);
        };

        audio.addEventListener("ended", handleEnd);

      } else {
        console.log("🎧 Direkt Stream");

        audio.src = streamUrl;
        audio.play().catch(err => console.log(err));
      }
    });
  });
}

// Künstler-Formular Submission – FRG
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("artist-form");
  const msg = document.getElementById("form-msg");

  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        msg.style.display = "block";
        msg.textContent = "Vielen Dank! Dein Track wurde erfolgreich eingereicht.";
        form.reset();
      } else {
        response.json().then(data => {
          msg.style.display = "block";
          msg.textContent = data.errors ? data.errors.map(e => e.message).join(", ") : "Fehler beim Senden.";
        });
      }
    }).catch(() => {
      msg.style.display = "block";
      msg.textContent = "Fehler beim Senden. Bitte versuche es später erneut.";
    });
  });
});

// main.js – nur die AGB Checkbox Logik
const agbCheckbox = document.getElementById('agb');
const submitBtn = document.getElementById('submitBtn');

if (agbCheckbox && submitBtn) {
  agbCheckbox.addEventListener('change', () => {
    submitBtn.disabled = !agbCheckbox.checked;
  });
}
