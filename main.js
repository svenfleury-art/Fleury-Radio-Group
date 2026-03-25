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
  
// ================================
// FRG EVENT DATEN
// ================================
const frgEvents = [
  { title: "FRG Showcase Week", date: "2026-03-23T00:00:00" },
  { title: "premiere von Labirinth von Skip auf Radio Rhywälle", date: "2026-03-24T12:30:00" },
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

// ================================
// PAGE MODE (AUTO)
// ================================
const PAGE_MODE = document.body.dataset.page || "home";

// ================================
// HELPERS
// ================================
function pad(n) {
  return String(Math.floor(n)).padStart(2, "0");
}

// 🔥 Smooth Animation
function updateWithAnimation(el, newValue) {
  if (!el) return;
  if (el.textContent === newValue) return;

  el.classList.add("animate");

  setTimeout(() => {
    el.textContent = newValue;
    el.classList.remove("animate");
  }, 150);
}

// ================================
// NEXT EVENT FINDEN
// ================================
function getNextEvent() {
  const now = Date.now();

  const future = frgEvents
    .map(e => ({
      ...e,
      dateObj: new Date(e.date)
    }))
    .filter(e => e.dateObj.getTime() > now)
    .sort((a, b) => a.dateObj - b.dateObj);

  return future.length ? future[0] : null;
}

// ================================
// ANZEIGE LOGIK
// ================================
function shouldShow(event) {
  if (!event) return false;

  if (PAGE_MODE === "special") return true;

  const now = Date.now();
  const diff = event.dateObj.getTime() - now;

  return diff <= 7 * 24 * 60 * 60 * 1000;
}

// ================================
// MAIN COUNTDOWN
// ================================
function updateCountdown() {
  const wrapper = document.querySelector(".countdown");
  if (!wrapper) return;

  const event = getNextEvent();

  if (!event) {
    wrapper.style.display = "none";
    return;
  }

  if (!shouldShow(event)) {
    wrapper.style.display = "none";
    return;
  }

  wrapper.style.display = "block";

  const titleEl = document.getElementById("countdown-title");
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (!titleEl || !daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  titleEl.textContent = event.title;

  const now = Date.now();
  const diff = event.dateObj.getTime() - now;

  if (diff <= 0) return;

  const days = diff / (1000 * 60 * 60 * 24);
  const hours = (diff / (1000 * 60 * 60)) % 24;
  const minutes = (diff / (1000 * 60)) % 60;
  const seconds = (diff / 1000) % 60;

  updateWithAnimation(daysEl, pad(days));
  updateWithAnimation(hoursEl, pad(hours));
  updateWithAnimation(minutesEl, pad(minutes));
  updateWithAnimation(secondsEl, pad(seconds));
}

// ================================
// START
// ================================
document.addEventListener("DOMContentLoaded", () => {
  updateCountdown();
  setInterval(updateCountdown, 1000);
});



/* -------------------------
FRG JINGLE PLAYER
------------------------- */

/* -------------------------
FRG JINGLE PLAYER – STABIL
------------------------- */
function initJinglePlayer() {
  const buttons = document.querySelectorAll(".playBtn");
  const audio = document.getElementById("audioPlayer");

  if (!buttons.length || !audio) return;

  let hasPlayedJingle = false;
  let isPlaying = false; // verhindert Doppelstarts

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const streamUrl = button.getAttribute("data-stream");
      if (!streamUrl) return;

      // Abbrechen, falls gerade schon was läuft
      if (isPlaying) {
        audio.pause();
        audio.currentTime = 0;
      }

      isPlaying = true;

      // Erstes Mal: Jingle abspielen
      if (!hasPlayedJingle) {
        hasPlayedJingle = true;
        console.log("▶️ Jingle startet");

        audio.src = "frg-jingle.mp3";

        const handleEnd = () => {
          console.log("🎧 Stream startet");
          audio.src = streamUrl;
          audio.play().catch(err => console.log("Stream Play Fehler:", err));
          audio.removeEventListener("ended", handleEnd);
        };

        audio.addEventListener("ended", handleEnd);

        audio.play().catch(err => console.log("Jingle Play Fehler:", err));

      } else {
        // Stream direkt starten
        console.log("🎧 Direkt Stream");
        audio.src = streamUrl;
        audio.play().catch(err => console.log("Stream Play Fehler:", err));
      }
    });
  });
}

// Funktion aufrufen, sobald DOM bereit ist
document.addEventListener("DOMContentLoaded", initJinglePlayer);
    
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




