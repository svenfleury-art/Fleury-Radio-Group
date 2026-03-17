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

  // ✅ Listener über DEINEN Worker
  loadListeners("rhywalle", "rhywalle-live", "rhywalle-today");
  loadListeners("winterlordfm", "winterlord-live", "winterlord-today");
  loadListeners("rhyrockradio", "rhyrock-live", "rhyrock-today");

  setInterval(() => {
    loadListeners("rhywalle", "rhywalle-live", "rhywalle-today");
    loadListeners("winterlordfm", "winterlord-live", "winterlord-today");
    loadListeners("rhyrockradio", "rhyrock-live", "rhyrock-today");
  }, 30000);
});

/* -------------------------
PARTIAL LOADER
------------------------- */
async function loadPartial(slotId, url) {
  const slot = document.getElementById(slotId);
  if (!slot) return;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Partial konnte nicht geladen werden:", url);
      return;
    }
    slot.innerHTML = await res.text();
  } catch (err) {
    console.error("Fetch Fehler:", err);
  }
}

/* -------------------------
MENU SYSTEM & DROPDOWNS
------------------------- */
function initMenu() {
  const btn = document.getElementById("hamburgerBtn");
  const nav = document.getElementById("mainNav");
  const overlay = document.getElementById("menu-overlay");
  if (!btn || !nav) return;

  function closeMenu() {
    nav.classList.remove("open");
    btn.classList.remove("active");
    btn.textContent = "☰";
    if (overlay) overlay.classList.remove("active");
  }

  function openMenu() {
    nav.classList.add("open");
    btn.classList.add("active");
    btn.textContent = "✕";
    if (overlay) overlay.classList.add("active");
  }

  closeMenu();

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    nav.classList.contains("open") ? closeMenu() : openMenu();
  });

  if (overlay) overlay.addEventListener("click", closeMenu);

  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) closeMenu();
  });

  nav.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest(".dropdown-toggle");
    if (!toggleBtn) return;
    e.preventDefault();
    e.stopPropagation();
    const dropdown = toggleBtn.closest(".nav-dropdown");
    if (!dropdown) return;
    nav.querySelectorAll(".nav-dropdown").forEach(d => {
      if (d !== dropdown) d.classList.remove("open");
    });
    dropdown.classList.toggle("open");
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
    setTimeout(() => banner.style.display = "none", 600);
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
        event.style.display = (filter === "all" || event.classList.contains(filter)) ? "block" : "none";
      });
    });
  });
}

/* -------------------------
FRG EVENTS
------------------------- */
const frgEvents = [
  { title:"FRG Crossover Night", date:"2026-04-25T20:00:00" },
  { title:"FRG Simulcast", date:"2026-05-30T19:00:00" },
  { title:"FRG Crossover Night", date:"2026-06-27T19:00:00" },
  { title:"FRG Schweiz Special", date:"2026-08-01T12:00:00" },
  { title:"FRG Crossover Night", date:"2026-09-26T19:00:00" },
  { title:"1 Jahr Fleury Radio Group", date:"2026-10-28T12:00:00" },
  { title:"FRG Halloween Special", date:"2026-10-31T12:00:00" },
  { title:"FRG Crossover Night", date:"2026-11-28T20:00:00" },
  { title:"FRG Weihnachts Special", date:"2026-12-19T00:00:00" },
  { title:"FRG Neujahres Special", date:"2026-12-31T13:00:00" }
];

/* -------------------------
COUNTDOWN
------------------------- */
function initCountdown() {
  const daysEl = document.getElementById("cdDays");
  const hoursEl = document.getElementById("cdHours");
  const minutesEl = document.getElementById("cdMinutes");
  const secondsEl = document.getElementById("cdSeconds");
  const container = document.getElementById("countdown-container");
  if (!daysEl || !container) return;

  const lastValues = { days: null, hours: null, minutes: null, seconds: null };

  function flipUpdate(el, value, key) {
    if (lastValues[key] !== value) {
      const front = el.querySelector(".front");
      const flipTop = el.querySelector(".flip-top");
      const flipBottom = el.querySelector(".flip-bottom");

      if (!front || !flipTop || !flipBottom) return;

      flipTop.textContent = front.textContent;
      flipBottom.textContent = value;

      el.querySelector(".flip-card").classList.add("is-flipping");

      setTimeout(() => {
        front.textContent = value;
        el.querySelector(".flip-card").classList.remove("is-flipping");
        lastValues[key] = value;
      }, 500);
    }
  }

  function getNextEvent() {
    const now = new Date();
    for (const e of frgEvents) {
      const dateObj = new Date(e.date);
      if (dateObj > now) return { ...e, dateObj };
    }
    return null;
  }

  function updateCountdown() {
    const event = getNextEvent();
    if (!event) {
      container.style.display = "none";
      return;
    }

    const now = new Date();
    const diff = event.dateObj - now;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    // Nur auf Startseite prüfen
    const isHome = window.location.pathname === "/" || window.location.pathname.includes("index");

    if (isHome && diff > sevenDays) {
      container.style.display = "none";
      return;
    }

    container.style.display = "flex";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    flipUpdate(daysEl, days, "days");
    flipUpdate(hoursEl, hours, "hours");
    flipUpdate(minutesEl, minutes, "minutes");
    flipUpdate(secondsEl, seconds, "seconds");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* -------------------------
LISTENER ZAHLEN (✅ FIX MIT WORKER)
------------------------- */
fetch('https://api.laut.fm/station/Rhywaelle/listeners')
  .then(r => r.text())
  .then(t => console.log('Rhywaelle:', t))
  .catch(e => console.error('Fehler:', e));

async function loadListeners() {
  const stations = {
    "Rhywaelle": "Rhywaelle",
    "winterlord-fm": "winterlord-fm",
    "rhyrock-radio": "rhyrock-radio"
  };

  for (const id in stations) {
    try {
      const res = await fetch(`https://api.laut.fm/station/${stations[id]}/listeners`);
      const text = await res.text();
      const listeners = parseInt(text) || 0;
      const el = document.getElementById(`${id}-live`);
      if (el) el.textContent = listeners;
    } catch (err) {
      const el = document.getElementById(`${id}-live`);
      if (el) el.textContent = "–";
      console.error(`Fehler bei ${id}:`, err);
    }
  }
}

// Laden, sobald die Seite bereit ist + alle 30 Sekunden aktualisieren
document.addEventListener("DOMContentLoaded", () => {
  loadListeners();
  setInterval(loadListeners, 30000);
});
