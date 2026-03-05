document.addEventListener("DOMContentLoaded", async () => {
  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  initMenu();
  initCookies();
});

async function loadPartial(slotId, url) {
  const slot = document.getElementById(slotId);
  if (!slot) return;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("Partial konnte nicht geladen werden:", url);
    return;
  }
  slot.innerHTML = await res.text();
}

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

  closeMenu(); // ✅ WICHTIG: Startzustand immer sauber (sonst bleibt’s dunkel)

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    nav.classList.contains("open") ? closeMenu() : openMenu();
  });

  if (overlay) overlay.addEventListener("click", closeMenu);

  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) closeMenu();
  });
}

function initCookies() {
  const banner = document.getElementById("cookie-banner");
  const button = document.getElementById("cookie-accept");
  if (!banner || !button) return;

  if (localStorage.getItem("frgCookiesAccepted")) {
    banner.style.display = "none";
    return;
  }

  banner.style.display = "flex"; // ✅ FEHLTE: sonst sieht man es nie

  button.addEventListener("click", () => {
    localStorage.setItem("frgCookiesAccepted", "true");
    banner.style.display = "none";
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const eventDate = new Date("2026-03-01T19:00:00").getTime();

  const interval = setInterval(function () {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance <= 0) {
      clearInterval(interval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("cdDays").innerText = days;
    document.getElementById("cdHours").innerText = hours;
    document.getElementById("cdMinutes").innerText = minutes;
    document.getElementById("cdSeconds").innerText = seconds;
  }, 1000);
});

document.addEventListener("DOMContentLoaded", () => {
  // Zielzeit: 01.03.2026 19:00 (lokale Zeit)
  const target = new Date("2026-03-01T19:00:00").getTime();

  const status = document.getElementById("cdStatus");

  const cards = {
    days: document.getElementById("flipDays"),
    hours: document.getElementById("flipHours"),
    minutes: document.getElementById("flipMinutes"),
    seconds: document.getElementById("flipSeconds"),
  };

  const last = { days: null, hours: null, minutes: null, seconds: null };

  const pad2 = (n) => String(n).padStart(2, "0");

  function setCardValue(cardEl, nextValue) {
    if (!cardEl) return;

    const front = cardEl.querySelector(".flip-front .flip-number");
    const back  = cardEl.querySelector(".flip-back .flip-number");

    // Wenn noch nie gesetzt: einfach initial befüllen
    if (!front || !back) return;
    const current = front.textContent;

    if (current === nextValue) return;

    // Setze Back auf den neuen Wert, flippe, danach Front = neuer Wert
    back.textContent = nextValue;

    cardEl.classList.remove("is-flipping"); // reset (falls rapid)
    // reflow to restart animation reliably
    void cardEl.offsetWidth;
    cardEl.classList.add("is-flipping");

    const onDone = () => {
      front.textContent = nextValue;
      cardEl.classList.remove("is-flipping");
      cardEl.removeEventListener("animationend", onDone, true);
    };

    // Wir hören auf irgendein Animation-Ende im Card-Tree
    cardEl.addEventListener("animationend", onDone, true);
  }

  function tick() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      setCardValue(cards.days, "0");
      setCardValue(cards.hours, "00");
      setCardValue(cards.minutes, "00");
      setCardValue(cards.seconds, "00");
      if (status) status.textContent = "Läuft jetzt / ist gestartet.";
      return;
    } else {
      if (status) status.textContent = "";
    }

    const total = Math.floor(diff / 1000);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;

    const next = {
      days: String(days),
      hours: pad2(hours),
      minutes: pad2(minutes),
      seconds: pad2(seconds),
    };

    // Nur flippen, wenn Wert sich ändert
    (Object.keys(next)).forEach((k) => {
      if (last[k] !== next[k]) {
        setCardValue(cards[k], next[k]);
        last[k] = next[k];
      }
    });
  }

  // Initial
  tick();
  setInterval(tick, 1000);
});

document.addEventListener("DOMContentLoaded", () => {

const buttons = document.querySelectorAll(".filter-btn");
const events = document.querySelectorAll(".event-card");

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

});
const frgEvents = [

{
title: "FRG Crossover Night",
date: "2026-04-25"
},

{
title: "FRG Simulcast",
date: "2026-05-30"
},

{
title: "FRG Crossover Night",
date: "2026-06-27"
},

{
title: "FRG Schweiz Special",
date: "2026-08-01"
},

{
title: "FRG Crossover Night",
date: "2026-09-26"
},

{
title: "FRG Halloween Special",
date: "2026-10-31"
},

{
title: "FRG Crossover Night",
date: "2026-11-28"
},

{
title: "FRG Weihnachts Special",
date: "2026-12-19"
},

{
title: "FRG Neujahres Special",
date: "2026-12-31"
}

];
const frgEvents = [
{title:"FRG Crossover Night", date:"2026-04-25"},
{title:"FRG Simulcast", date:"2026-05-30"},
{title:"FRG Crossover Night", date:"2026-06-27"},
{title:"FRG Schweiz Special", date:"2026-08-01"},
{title:"FRG Crossover Night", date:"2026-09-26"},
{title:"FRG Halloween Special", date:"2026-10-31"},
{title:"FRG Crossover Night", date:"2026-11-28"},
{title:"FRG Weihnachts Special", date:"2026-12-19"},
{title:"FRG Neujahres Special", date:"2026-12-31"}
];

function getNextEvent(){
const now = new Date();

return frgEvents
.map(e => ({...e, dateObj:new Date(e.date)}))
.filter(e => e.dateObj > now)
.sort((a,b)=>a.dateObj-b.dateObj)[0];
}

function updateCountdown(){

const event = getNextEvent();
if(!event) return;

document.getElementById("nextEventTitle").textContent = event.title;
document.getElementById("nextEventDate").textContent =
event.dateObj.toLocaleDateString("de-CH");

const now = new Date();
const diff = event.dateObj - now;

const days = Math.floor(diff / (1000*60*60*24));
const hours = Math.floor((diff/(1000*60*60))%24);
const minutes = Math.floor((diff/(1000*60))%60);
const seconds = Math.floor((diff/1000)%60);

document.getElementById("cdDays").textContent = days;
document.getElementById("cdHours").textContent = hours;
document.getElementById("cdMinutes").textContent = minutes;
document.getElementById("cdSeconds").textContent = seconds;

}

updateCountdown();
setInterval(updateCountdown,1000);
