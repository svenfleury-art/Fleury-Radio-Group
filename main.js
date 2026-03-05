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





function updateFlip(id, newValue){

const el = document.getElementById(id);
const front = el.querySelector(".front");
const back = el.querySelector(".back");

if(front.textContent == newValue) return;

back.textContent = newValue;

el.classList.add("animate");

setTimeout(()=>{
front.textContent = newValue;
el.classList.remove("animate");
},600);

}

function updateCountdown(){

const target = new Date("2026-05-16T20:00:00");

const now = new Date();
const diff = target - now;

if(diff <= 0) return;

const days = Math.floor(diff / (1000*60*60*24));
const hours = Math.floor((diff / (1000*60*60)) % 24);
const minutes = Math.floor((diff / (1000*60)) % 60);
const seconds = Math.floor((diff / 1000) % 60);

updateFlip("cdDays", days);
updateFlip("cdHours", hours);
updateFlip("cdMinutes", minutes);
updateFlip("cdSeconds", seconds);

}

setInterval(updateCountdown,1000);
updateCountdown();



function updateFlip(id, value){

const el = document.getElementById(id);
const top = el.querySelector(".top");
const bottom = el.querySelector(".bottom");
const flipTop = el.querySelector(".flip-top");
const flipBottom = el.querySelector(".flip-bottom");

const current = top.textContent;
const newVal = String(value).padStart(2,"0");

if(current === newVal) return;

flipTop.textContent = current;
flipBottom.textContent = newVal;

el.classList.add("animate");

setTimeout(()=>{
top.textContent = newVal;
bottom.textContent = newVal;
el.classList.remove("animate");
},1000);

}
