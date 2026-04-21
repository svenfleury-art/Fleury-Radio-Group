/* =========================
ROUTES
========================= */

const routes = {
  "/": "/pages/home.html",
  "/radios": "/pages/radios.html",
  "/rhywälle": "/pages/rhywaelle.html",
  "/winterlord": "/pages/winterlord.html",
  "/rhyrock": "/pages/rhyrock.html",
  "/frg-inside": "/pages/frg-inside.html",
  "/team": "/pages/team.html",
  "/geschichte": "/pages/geschichte.html",
  "/about": "/pages/about.html",
  "/mitmachen": "/pages/mitmachen.html",
  "/spezial-programm": "/pages/spezial-programm.html",
  "/artists": "/pages/artists.html",
  "/werbung": "/pages/werbung.html",
  "/agb": "/pages/agb.html",
  "/datenschutz": "/pages/datenschutz.html",
  "/impressum": "/pages/impressum.html",
  "/404": "/pages/404.html"
};

const cache = new Map();

let countdownInterval = null;

/* =========================
UTIL
========================= */

function normalizePath(path){
  try {
    const url = new URL(path, location.origin);
    let clean = url.pathname;
    if(clean.length > 1) clean = clean.replace(/\/+$/, "");
    return clean || "/";
  } catch {
    return "/";
  }
}

/* =========================
FETCH
========================= */

async function loadFile(file){
  try {
    const res = await fetch(file);
    if(!res.ok) return "<h2>404</h2>";
    return await res.text();
  } catch {
    return "<h2>Error</h2>";
  }
}

/* =========================
ROUTER
========================= */

async function loadPage(path){

  const app = document.getElementById("app");
  if(!app){
    console.error("❌ #app fehlt");
    return;
  }

  const clean = normalizePath(path);
  const file = routes[clean] || routes["/404"];

  let html = cache.get(file);

  if(!html){
    html = await loadFile(file);
    cache.set(file, html);
  }

  app.innerHTML = html;

  window.scrollTo(0,0);

  initPage();
}

/* =========================
NAVIGATION
========================= */

document.addEventListener("click",(e)=>{
  const link = e.target.closest("a[data-link]");
  if(!link) return;

  e.preventDefault();

  history.pushState({}, "", link.href);
  loadPage(link.getAttribute("href"));
});

window.addEventListener("popstate",()=>{
  loadPage(location.pathname);
});

/* =========================
COUNTDOWN
========================= */

const events = [
  { name:"Crossover Night", date:"2026-04-25T20:00:00" },
  { name:"Simulcast", date:"2026-05-30T19:00:00" }
];

function initCountdown(){

  const box = document.querySelector(".countdown");
  if(!box) return;

  if(countdownInterval){
    clearInterval(countdownInterval);
  }

  const next = events
    .map(e=>({...e,time:new Date(e.date).getTime()}))
    .filter(e=>e.time > Date.now())
    .sort((a,b)=>a.time-b.time)[0];

  if(!next) return;

  box.style.display = "block";

  countdownInterval = setInterval(()=>{

    const diff = next.time - Date.now();

    if(diff <= 0){
      box.style.display = "none";
      clearInterval(countdownInterval);
      return;
    }

    const d = Math.floor(diff/86400000);
    const h = Math.floor((diff%86400000)/3600000);
    const m = Math.floor((diff%3600000)/60000);
    const s = Math.floor((diff%60000)/1000);

    ["days","hours","minutes","seconds"].forEach((id,i)=>{
      const el = document.getElementById(id);
      if(el) el.textContent = [d,h,m,s][i];
    });

  },1000);
}

/* =========================
PAGE INIT
========================= */

function initPage(){
  initCountdown();
}

/* =========================
BOOT
========================= */

window.addEventListener("DOMContentLoaded",()=>{
  loadPage(location.pathname);
});
