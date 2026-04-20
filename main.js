/* =========================
CONFIG
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
  "/artists": "/pages/Artists.html",

  "/werbung": "/pages/werbung.html",

  "/agb": "/pages/agb.html",
  "/datenschutz": "/pages/datenschutz.html",
  "/impressum": "/pages/impressum.html",

  "/404": "/pages/404.html"
};

const cache = new Map();

/* =========================
UTILS
========================= */

function normalizePath(path) {
  if (!path) return "/";
  path = path.replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

/* =========================
SAFE FETCH
========================= */

async function safeFetch(file) {
  try {
    const res = await fetch(file);

    if (!res.ok) {
      console.error("Fetch failed:", file);
      return "<h2 style='color:white;text-align:center'>Seite nicht gefunden</h2>";
    }

    return await res.text();
  } catch (e) {
    console.error("Network error:", e);
    return "<h2 style='color:white;text-align:center'>Ladefehler (Server?)</h2>";
  }
}

/* =========================
PAGE LOADER (CORE FIX)
========================= */

async function loadPage(path) {
  const app = document.getElementById("app");

  if (!app) {
    console.error("❌ #app fehlt im HTML!");
    return;
  }

  const clean = normalizePath(path);
  const file = routes[clean] || routes["/404"];

  console.log("Loading:", clean, "->", file);

  let html = "";

  try {
    if (cache.has(file)) {
      html = cache.get(file);
    } else {
      html = await safeFetch(file);
      cache.set(file, html);
    }
  } catch (e) {
    html = "<h2 style='color:white'>Fehler beim Laden</h2>";
  }

  app.innerHTML = html;

  window.scrollTo(0, 0);

  runPageScriptsSafe();
}

/* =========================
NAVIGATION FIX
========================= */

document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-link]");
  if (!link) return;

  const href = link.getAttribute("href");

  if (!href || href.startsWith("http")) return;

  e.preventDefault();

  history.pushState({}, "", href);
  loadPage(href);
});

window.addEventListener("popstate", () => {
  loadPage(location.pathname);
});

/* =========================
SAFE INIT (WICHTIG)
========================= */

function runPageScriptsSafe() {
  try {
    initMenu();
    initEventFilter();
    initRadioPlayer();
  } catch (e) {
    console.warn("Script init error:", e);
  }
}

/* =========================
MENU SAFE
========================= */

function initMenu() {
  const btn = document.getElementById("hamburgerBtn");
  const nav = document.getElementById("mainNav");
  const overlay = document.getElementById("menu-overlay");

  if (!btn || !nav) return;

  btn.onclick = () => {
    nav.classList.toggle("open");
    overlay?.classList.toggle("active");
  };

  overlay?.onclick = () => {
    nav.classList.remove("open");
    overlay.classList.remove("active");
  };
}

/* =========================
EVENT FILTER SAFE
========================= */

function initEventFilter() {
  const btns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".event-card");

  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.onclick = () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        if (card.classList.contains("hinweis")) return;

        const show =
          filter === "all" || card.classList.contains(filter);

        card.style.display = show ? "block" : "none";
      });
    };
  });
}

/* =========================
RADIO SAFE
========================= */

function initRadioPlayer() {
  const audio = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playBtn");

  if (!audio || !playBtn) return;

  const streams = {
    rhywaelle: "https://stream.laut.fm/rhywaelle",
    winterlord: "https://stream.laut.fm/winterlord-fm",
    rhyrock: "https://stream.laut.fm/rhyrock-radio"
  };

  let current = "rhywaelle";
  let playing = false;

  document.querySelectorAll(".station").forEach(btn => {
    btn.onclick = () => {
      current = btn.dataset.station;

      document.querySelectorAll(".station")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      if (playing) {
        audio.src = streams[current];
        audio.play();
      }
    };
  });

  playBtn.onclick = () => {
    if (!playing) {
      audio.src = streams[current];
      audio.play();
      playing = true;
      playBtn.textContent = "⏸";
    } else {
      audio.pause();
      playing = false;
      playBtn.textContent = "▶";
    }
  };
}

/* =========================
BOOT (CRITICAL FIX)
========================= */

window.addEventListener("DOMContentLoaded", () => {
  console.log("FRG JS START");

  const app = document.getElementById("app");

  if (!app) {
    document.body.innerHTML =
      "<h1 style='color:white;text-align:center'>FEHLER: #app fehlt</h1>";
    return;
  }

  let path = normalizePath(location.pathname);

  if (!routes[path]) {
    path = "/404";
  }

  loadPage(path);
});
