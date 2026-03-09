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

{ title:"FRG Crossover Night", date:"2026-04-25T20:00:00" },
{ title:"FRG Simulcast", date:"2026-05-30T20:00:00" },
{ title:"FRG Crossover Night", date:"2026-06-27T20:00:00" },
{ title:"FRG Schweiz Special", date:"2026-08-01T20:00:00" },
{ title:"FRG Crossover Night", date:"2026-09-26T20:00:00" },
{ title:"FRG Halloween Special", date:"2026-10-31T20:00:00" },
{ title:"FRG Crossover Night", date:"2026-11-28T20:00:00" },
{ title:"FRG Weihnachts Special", date:"2026-12-19T20:00:00" },
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




function initCountdown() {
  const title = document.getElementById("nextEventTitle");
  const date  = document.getElementById("nextEventDate");

  const daysEl = document.getElementById("cdDays");
  const hoursEl = document.getElementById("cdHours");
  const minutesEl = document.getElementById("cdMinutes");
  const secondsEl = document.getElementById("cdSeconds");

  if (!daysEl) return;

  // letzte Werte speichern, auch Sekunden
  const lastValues = { days: null, hours: null, minutes: null, seconds: null };

  function flipUpdate(el, value, key) {
    if (lastValues[key] !== value) {
      const front = el.querySelector(".flip-card-front");
      const back  = el.querySelector(".flip-card-back");

      back.textContent = value;
      el.querySelector(".flip-card").classList.add("is-flipping");

      setTimeout(() => {
        front.textContent = value;
        el.querySelector(".flip-card").classList.remove("is-flipping");
        lastValues[key] = value;
      }, 500); // Dauer der Flip-Animation
    }
  }

  function updateCountdown() {
    const event = getNextEvent(); // Muss ein Event-Objekt mit title und dateObj liefern
    if (!event) return;

    if (title) title.textContent = event.title;
    if (date) {
      date.textContent = event.dateObj.toLocaleDateString("de-CH", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    }

    const now = new Date();
    const diff = event.dateObj - now;
    if (diff <= 0) return;

    const days = Math.floor(diff / (1000*60*60*24)).toString();
    const hours = String(Math.floor((diff/(1000*60*60)) % 24)).padStart(2,"0");
    const minutes = String(Math.floor((diff/(1000*60)) % 60)).padStart(2,"0");
    const seconds = String(Math.floor((diff/1000) % 60)).padStart(2,"0");

    flipUpdate(daysEl, days, "days");
    flipUpdate(hoursEl, hours, "hours");
    flipUpdate(minutesEl, minutes, "minutes");
    flipUpdate(secondsEl, seconds, "seconds"); // jetzt auch Sekunden flippen
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}
