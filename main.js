document.addEventListener("DOMContentLoaded", async () => {

  // -------------------------
  // Partials laden
  // -------------------------
  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  // Initialisierungen
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
MENU SYSTEM & DROPDOWNS
------------------------- */
function initMenu() {

  const btn = document.getElementById("hamburgerBtn");
  const nav = document.getElementById("mainNav");
  const overlay = document.getElementById("menu-overlay");

  if (!btn || !nav) return;

  // Menü schließen
  function closeMenu() {
    nav.classList.remove("open");
    btn.classList.remove("active");
    btn.textContent = "☰";
    if (overlay) overlay.classList.remove("active");
  }

  // Menü öffnen
  function openMenu() {
    nav.classList.add("open");
    btn.classList.add("active");
    btn.textContent = "✕";
    if (overlay) overlay.classList.add("active");
  }

  closeMenu();

  // Hamburger Klick
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    nav.classList.contains("open") ? closeMenu() : openMenu();
  });

  // Overlay Klick
  if (overlay) overlay.addEventListener("click", closeMenu);

  // Klick außerhalb schließt das Menü
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) {
      closeMenu();
    }
  });

  // -------------------------
  // Dropdown Navigation (Event Delegation)
  // -------------------------
  nav.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest(".dropdown-toggle");
    if (!toggleBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const dropdown = toggleBtn.closest(".nav-dropdown");
    if (!dropdown) return;

    // andere Dropdowns schließen
    nav.querySelectorAll(".nav-dropdown").forEach(d => {
      if (d !== dropdown) d.classList.remove("open");
    });

    // aktuelles öffnen/schließen
    dropdown.classList.toggle("open");
  });

}


/* -------------------------
COOKIE BANNER – FRG STYLE MIT SLIDE-OUT
------------------------- */
function initCookies() {

  const banner = document.getElementById("cookie-banner");
  const button = document.getElementById("cookie-accept");

  if (!banner || !button) return;

  // Prüfen, ob der Nutzer schon zugestimmt hat
  if (localStorage.getItem("frgCookiesAccepted")) {
    banner.style.display = "none";
    return;
  }

  // Banner anzeigen
  banner.style.display = "flex";

  // Klick auf "Akzeptieren"
  button.addEventListener("click", () => {
    localStorage.setItem("frgCookiesAccepted", "true");
    // Slide-Out Animation starten
    banner.classList.add("hide");
    // Nach Animation ausblenden
    setTimeout(() => {
      banner.style.display = "none";
    }, 600); // Dauer = CSS transition
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
        if (filter === "all" || event.classList.contains(filter)) {
          event.style.display = "block";
        } else {
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
COUNTDOWN
------------------------- */
function initCountdown() {

  const title = document.getElementById("nextEventTitle");
  const date  = document.getElementById("nextEventDate");

  const daysEl = document.getElementById("cdDays");
  const hoursEl = document.getElementById("cdHours");
  const minutesEl = document.getElementById("cdMinutes");
  const secondsEl = document.getElementById("cdSeconds");

  const container = document.getElementById("countdown-container");

  if (!daysEl) return;

  const lastValues = { days:null, hours:null, minutes:null, seconds:null };

  function flipUpdate(el, value, key) {

    if (lastValues[key] !== value) {

      const front = el.querySelector(".front");
      const flipTop = el.querySelector(".flip-top");
      const flipBottom = el.querySelector(".flip-bottom");

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

  function updateCountdown(){

    const event = getNextEvent();
    if(!event) return;

    const now = new Date();
    const diff = event.dateObj - now;

    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if(document.body.classList.contains("home")){
      if(diff > sevenDays){
        container.style.display = "none";
        return;
      }
    }

    container.style.display = "flex";

    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff/(1000*60*60)) % 24);
    const minutes = Math.floor((diff/(1000*60)) % 60);
    const seconds = Math.floor((diff/1000) % 60);

    flipUpdate(daysEl, days, "days");
    flipUpdate(hoursEl, hours, "hours");
    flipUpdate(minutesEl, minutes, "minutes");
    flipUpdate(secondsEl, seconds, "seconds");

  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

}


async function loadListeners(station, liveId, todayId) {

  try {

    const response = await fetch("https://api.laut.fm/station/" + station);
    const data = await response.json();

    document.getElementById(liveId).textContent = data.listeners;
    document.getElementById(todayId).textContent = data.listener_peak;

  } catch {

    document.getElementById(liveId).textContent = "-";
    document.getElementById(todayId).textContent = "-";

  }

}

setInterval(() => {

loadListeners("rhywaelle", "rhywaelle-live", "rhywaelle-today");
loadListeners("winterlordfm", "winterlord-live", "winterlord-today");
loadListeners("rhyrockradio", "rhyrock-live", "rhyrock-today");

}, 30000);
