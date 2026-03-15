document.addEventListener("DOMContentLoaded", async () => {

  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  initMenu();
  initDropdown();
  initCookies();
  initFilter();
  initCountdown();

});


/* -------------------------
PARTIAL LOADER
------------------------- */

async function loadPartial(slotId, url){

  const slot = document.getElementById(slotId);
  if(!slot) return;

  try{

    const res = await fetch(url);

    if(!res.ok){
      console.error("Partial konnte nicht geladen werden:", url);
      return;
    }

    slot.innerHTML = await res.text();

  }catch(err){
    console.error("Fetch Fehler:", err);
  }

}


/* -------------------------
MENU SYSTEM
------------------------- */

function initMenu(){

  const btn = document.getElementById("hamburgerBtn");
  const nav = document.getElementById("mainNav");
  const overlay = document.getElementById("menu-overlay");

  if(!btn || !nav) return;

  function closeMenu(){
    nav.classList.remove("open");
    btn.classList.remove("active");
    btn.textContent = "☰";
    if(overlay) overlay.classList.remove("active");
  }

  function openMenu(){
    nav.classList.add("open");
    btn.classList.add("active");
    btn.textContent = "✕";
    if(overlay) overlay.classList.add("active");
  }

  closeMenu();

  btn.addEventListener("click", (e)=>{
    e.stopPropagation();
    nav.classList.contains("open") ? closeMenu() : openMenu();
  });

  if(overlay) overlay.addEventListener("click", closeMenu);

  document.addEventListener("click", (e)=>{
    if(!nav.contains(e.target) && !btn.contains(e.target)){
      closeMenu();
    }
  });

}


/* -------------------------
RADIO DROPDOWN
------------------------- */

function initDropdown(){

  const nav = document.getElementById("mainNav");
  if(!nav) return;

  const dropdownBtns = nav.querySelectorAll(".dropdown-toggle");

  dropdownBtns.forEach(btn => {

    btn.addEventListener("click", (e)=>{

      e.preventDefault();
      e.stopPropagation();

      const dropdown = btn.closest(".nav-dropdown");
      if(!dropdown) return;

      /* andere Dropdowns schliessen */

      nav.querySelectorAll(".nav-dropdown").forEach(d=>{
        if(d !== dropdown) d.classList.remove("open");
      });

      /* aktuelles öffnen */

      dropdown.classList.toggle("open");

    });

  });

}


/* -------------------------
COOKIE BANNER
------------------------- */

function initCookies(){

  const banner = document.getElementById("cookie-banner");
  const button = document.getElementById("cookie-accept");

  if(!banner || !button) return;

  if(localStorage.getItem("frgCookiesAccepted")){
    banner.style.display = "none";
    return;
  }

  banner.style.display = "flex";

  button.addEventListener("click", ()=>{
    localStorage.setItem("frgCookiesAccepted","true");
    banner.style.display = "none";
  });

}


/* -------------------------
EVENT FILTER
------------------------- */

function initFilter(){

  const buttons = document.querySelectorAll(".filter-btn");
  const events = document.querySelectorAll(".event-card");

  if(!buttons.length) return;

  buttons.forEach(button=>{

    button.addEventListener("click", ()=>{

      const filter = button.dataset.filter;

      buttons.forEach(b=>b.classList.remove("active"));
      button.classList.add("active");

      events.forEach(event=>{

        if(filter === "all"){
          event.style.display = "block";
        }

        else if(event.classList.contains(filter)){
          event.style.display = "block";
        }

        else{
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

function getNextEvent(){

  const now = new Date();

  return frgEvents
  .map(e => ({ ...e, dateObj:new Date(e.date) }))
  .filter(e => e.dateObj > now)
  .sort((a,b)=>a.dateObj - b.dateObj)[0];

}


/* -------------------------
COUNTDOWN
------------------------- */

function initCountdown(){

  const daysEl = document.getElementById("cdDays");
  const hoursEl = document.getElementById("cdHours");
  const minutesEl = document.getElementById("cdMinutes");
  const secondsEl = document.getElementById("cdSeconds");
  const container = document.getElementById("countdown-container");

  if(!daysEl) return;

  function updateCountdown(){

    const event = getNextEvent();
    if(!event) return;

    const now = new Date();
    const diff = event.dateObj - now;

    const days = Math.floor(diff/(1000*60*60*24));
    const hours = Math.floor((diff/(1000*60*60))%24);
    const minutes = Math.floor((diff/(1000*60))%60);
    const seconds = Math.floor((diff/1000)%60);

    daysEl.textContent = days;
    hoursEl.textContent = hours;
    minutesEl.textContent = minutes;
    secondsEl.textContent = seconds;

  }

  updateCountdown();
  setInterval(updateCountdown,1000);

}
