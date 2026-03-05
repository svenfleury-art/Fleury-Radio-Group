document.addEventListener("DOMContentLoaded", async () => {

  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  initMenu();
  initCookies();
  initFilter();
  initCountdown();

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
MENU SYSTEM
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
    if (!nav.contains(e.target) && !btn.contains(e.target)) {
      closeMenu();
    }
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
    banner.style.display = "none";
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

        if (filter === "all") {
          event.style.display = "block";
        }

        else if (event.classList.contains(filter)) {
          event.style.display = "block";
        }

        else {
          event.style.display = "none";
        }

      });

    });

  });

}


/* -------------------------
FRG EVENTS
------------------------- */
const frgEvents = [
  { title:"FRG Crossover Night", date:"2026-04-25T19:00:00" },
  { title:"FRG Simulcast", date:"2026-05-30T19:00:00" },
  { title:"FRG Crossover Night", date:"2026-06-27T19:00:00" },
  { title:"FRG Schweiz Special", date:"2026-08-01T19:00:00" },
  { title:"FRG Crossover Night", date:"2026-09-26T19:00:00" },
  { title:"FRG Halloween Special", date:"2026-10-31T19:00:00" },
  { title:"FRG Crossover Night", date:"2026-11-28T19:00:00" },
  { title:"FRG Weihnachts Special", date:"2026-12-19T19:00:00" },
  { title:"FRG Neujahres Special", date:"2026-12-31T13:00:00" }
];

/* -------------------------
NEXT EVENT
------------------------- */
function getNextEvent() {
  const now = new Date();
  return frgEvents
    .map(e => ({ ...e, dateObj: new Date(e.date) }))
    .filter(e => e.dateObj > now)
    .sort((a,b) => a.dateObj - b.dateObj)[0];
}

/* -------------------------
COUNTDOWN INIT
------------------------- */
let currentEvent = null;

function initCountdown() {
  currentEvent = getNextEvent();
  if (!currentEvent) return;

  // Event-Titel & Datum
  const titleEl = document.getElementById("nextEventTitle");
  const dateEl = document.getElementById("nextEventDate");
  if (titleEl) titleEl.textContent = currentEvent.title;
  if (dateEl) dateEl.textContent = currentEvent.dateObj.toLocaleDateString("de-CH", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  // Countdown sofort initialisieren
  updateCountdown(true);

  // Jede Sekunde aktualisieren
  setInterval(() => updateCountdown(false), 1000);
}

/* -------------------------
COUNTDOWN UPDATE
------------------------- */
function updateCountdown(init = false) {
  if (!currentEvent) return;

  const now = new Date();
  let diff = currentEvent.dateObj - now;
  if (diff < 0) diff = 0;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  updateFlip("cdDays", days, init);
  updateFlip("cdHours", hours, init);
  updateFlip("cdMinutes", minutes, init);
  updateFlip("cdSeconds", seconds, init);
}

/* -------------------------
CLASSIC FLIP FUNCTION
------------------------- */
function updateFlip(id, value, init = false) {
  const el = document.getElementById(id);
  if (!el) return;

  const top = el.querySelector(".top");
  const bottom = el.querySelector(".bottom");
  const flipTop = el.querySelector(".flip-top");
  const flipBottom = el.querySelector(".flip-bottom");

  const newVal = String(value).padStart(2, "0");
  const current = top.textContent || newVal;

  if (init) {
    // Sofort setzen ohne Animation
    top.textContent = newVal;
    bottom.textContent = newVal;
    flipTop.style.display = "none";
    flipBottom.style.display = "none";
    el.classList.remove("animate");
    return;
  }

  if (current === newVal) return;

  // Flip vorbereiten
  flipTop.textContent = current;
  flipBottom.textContent = newVal;
  flipTop.style.display = "flex";
  flipBottom.style.display = "flex";

  el.classList.add("animate");

  // Animation abschließen
  setTimeout(() => {
    top.textContent = newVal;
    bottom.textContent = newVal;
    flipTop.style.display = "none";
    flipBottom.style.display = "none";
    el.classList.remove("animate");
  }, 600);
}

/* -------------------------
FRG EVENTS
------------------------- */
const frgEvents = [
  { title:"FRG Crossover Night", date:"2026-04-25T19:00:00" },
  { title:"FRG Simulcast", date:"2026-05-30T19:00:00" },
  { title:"FRG Crossover Night", date:"2026-06-27T19:00:00" },
  { title:"FRG Schweiz Special", date:"2026-08-01T19:00:00" },
  { title:"FRG Crossover Night", date:"2026-09-26T19:00:00" },
  { title:"FRG Halloween Special", date:"2026-10-31T19:00:00" },
  { title:"FRG Crossover Night", date:"2026-11-28T19:00:00" },
  { title:"FRG Weihnachts Special", date:"2026-12-19T19:00:00" },
  { title:"FRG Neujahres Special", date:"2026-12-31T13:00:00" }
];

/* -------------------------
Next Event
------------------------- */
function getNextEvent() {
  const now = new Date();
  return frgEvents
    .map(e => ({ ...e, dateObj: new Date(e.date) }))
    .filter(e => e.dateObj > now)
    .sort((a,b) => a.dateObj - b.dateObj)[0];
}

/* -------------------------
Init Countdown
------------------------- */
function initCountdown() {
  const titleEl = document.getElementById("nextEventTitle");
  const event = getNextEvent();
  if (!event) return;

  if (titleEl) titleEl.textContent = event.title;

  // Elemente vorbereiten
  const ids = ["cdDays","cdHours","cdMinutes","cdSeconds"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.querySelector(".flip-front").textContent = "00";
      el.querySelector(".flip-back").textContent = "00";
    }
  });

  // Countdown starten
  setInterval(() => updateCountdown(event), 1000);
}

/* -------------------------
Update Countdown
------------------------- */
function updateCountdown(event) {
  if (!event) return;

  const now = new Date();
  let diff = event.dateObj - now;
  if (diff < 0) diff = 0;

  const days = Math.floor(diff / (1000*60*60*24));
  const hours = Math.floor((diff / (1000*60*60)) % 24);
  const minutes = Math.floor((diff / (1000*60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  updateFlip("cdDays", days);
  updateFlip("cdHours", hours);
  updateFlip("cdMinutes", minutes);
  updateFlip("cdSeconds", seconds);
}

/* -------------------------
Flip Animation
------------------------- */
function updateFlip(id, value) {
  const el = document.getElementById(id);
  if (!el) return;

  const inner = el.querySelector(".flip-inner");
  const front = el.querySelector(".flip-front");
  const back = el.querySelector(".flip-back");

  const newVal = String(value).padStart(2,"0");
  if (front.textContent === newVal) return;

  back.textContent = newVal;
  inner.classList.add("flip");
  setTimeout(() => {
    front.textContent = newVal;
    inner.classList.remove("flip");
  }, 600);
}

/* -------------------------
DOMContentLoaded
------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initCountdown();
});
