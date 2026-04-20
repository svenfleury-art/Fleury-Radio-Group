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
let currentPage = null;
let countdownInterval = null;

/* =========================
UTILS
========================= */

function normalizePath(path) {
  return path.replace(/\/+$/, "") || "/";
}

/* =========================
LOADER
========================= */

function showLoader() {
  let loader = document.getElementById("global-loader");

  if (!loader) {
    loader = document.createElement("div");
    loader.id = "global-loader";
    loader.innerHTML = "📻";
    document.body.appendChild(loader);
  }

  loader.style.display = "flex";
  loader.style.opacity = "1";
}

function hideLoader() {
  const loader = document.getElementById("global-loader");
  if (!loader) return;

  loader.style.opacity = "0";
  setTimeout(() => loader.style.display = "none", 300);
}

/* =========================
ANIMATION
========================= */

function animateOut(el) {
  return new Promise(resolve => {
    el.style.opacity = "0";
    el.style.transform = "translateY(10px)";
    setTimeout(resolve, 200);
  });
}

function animateIn(el) {
  return new Promise(resolve => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
    setTimeout(resolve, 200);
  });
}

/* =========================
PARTIALS
========================= */

async function loadPartial(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  const res = await fetch(file);
  el.innerHTML = await res.text();
}

/* =========================
PAGE LOADER
========================= */

async function loadPage(path) {
  const app = document.getElementById("app");
  if (!app) return;

  const clean = normalizePath(path);
  const file = routes[clean] || routes["/404"];

  showLoader();

  try {
    let html;

    if (cache.has(file)) {
      html = cache.get(file);
    } else {
      const res = await fetch(file);
      html = await res.text();
      cache.set(file, html);
    }

    await animateOut(app);

    app.innerHTML = html;

    await animateIn(app);

    currentPage = clean;

    runPageScripts();

    window.scrollTo(0, 0);

  } catch {
    app.innerHTML = "<h2 style='color:white'>Fehler beim Laden</h2>";
  }

  hideLoader();
}

/* =========================
NAVIGATION
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
MENU
========================= */

function initMenu() {
  const btn = document.getElementById("hamburgerBtn");
  const nav = document.getElementById("mainNav");
  const overlay = document.getElementById("menu-overlay");

  if (!btn || !nav) return;

  btn.onclick = (e) => {
    e.stopPropagation();
    nav.classList.toggle("open");
    overlay?.classList.toggle("active");
  };

  overlay?.onclick = () => {
    nav.classList.remove("open");
    overlay.classList.remove("active");
  };
}

/* =========================
COOKIE
========================= */

function initCookieBanner() {
  const banner = document.getElementById("cookie-banner");
  const btn = document.getElementById("cookie-accept");

  if (!banner || !btn) return;

  if (localStorage.getItem("frg_cookie")) {
    banner.style.display = "none";
    return;
  }

  banner.style.display = "flex";

  btn.onclick = () => {
    localStorage.setItem("frg_cookie", "1");
    banner.style.display = "none";
  };
}

/* =========================
COUNTDOWN (7 TAGE LOGIK)
========================= */

const frgEvents = [
  { title: "FRG Showcase", date: "2026-04-25T20:00:00" },
  { title: "FRG Special", date: "2026-06-01T20:00:00" }
];

function initCountdown() {
  const wrapper = document.querySelector(".countdown");
  if (!wrapper) return;

  if (countdownInterval) clearInterval(countdownInterval);

  const now = Date.now();
  const next = frgEvents.find(e => new Date(e.date) > now);

  if (!next) {
    wrapper.style.display = "none";
    return;
  }

  const target = new Date(next.date).getTime();
  const diffStart = target - now;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  // Nur anzeigen wenn ≤ 7 Tage
  if (diffStart > sevenDays) {
    wrapper.style.display = "none";
    return;
  }

  wrapper.style.display = "block";

  countdownInterval = setInterval(() => {

    const diff = target - Date.now();

    if (diff <= 0) {
      wrapper.style.display = "none";
      clearInterval(countdownInterval);
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    ["days","hours","minutes","seconds"].forEach((id, i) => {
      const val = [d,h,m,s][i];
      const el = document.getElementById(id);
      if (el) el.textContent = String(val).padStart(2,"0");
    });

  }, 1000);
}

/* =========================
RADIO PLAYER
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
FORMS
========================= */

function initForms() {

  function setup(formId, checkboxId, btnId, msgId) {
    const form = document.getElementById(formId);
    const check = document.getElementById(checkboxId);
    const btn = document.getElementById(btnId);
    const msg = document.getElementById(msgId);

    if (!form || !check || !btn || !msg) return;

    check.onchange = () => btn.disabled = !check.checked;

    form.onsubmit = async (e) => {
      e.preventDefault();

      msg.style.display = "block";
      msg.textContent = "Senden...";

      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { "Accept": "application/json" }
        });

        msg.textContent = res.ok ? "✅ Gesendet!" : "❌ Fehler";
        form.reset();
        btn.disabled = true;

      } catch {
        msg.textContent = "❌ Netzwerkfehler";
      }
    };
  }

  setup("artist-form-1","agb-1","submitBtn-1","form-msg-1");
  setup("artist-form-2","agb-2","submitBtn-2","form-msg-2");
}

/* =========================
EVENT FILTER
========================= */

function initEventFilter() {
  const btns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".event-card");

  if (!btns.length) return;

  btns.forEach(btn => {
    btn.onclick = () => {

      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const f = btn.dataset.filter;

      cards.forEach(c => {
        if (c.classList.contains("hinweis")) return;

        c.style.display =
          (f === "all" || c.classList.contains(f))
          ? "block"
          : "none";
      });

    };
  });
}

/* =========================
PAGE SCRIPTS
========================= */

function runPageScripts() {
  initMenu();
  initCookieBanner();
  initCountdown();
  initRadioPlayer();
  initForms();
  initEventFilter();
}

/* =========================
BOOT
========================= */

window.addEventListener("DOMContentLoaded", async () => {

  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  initMenu();

  loadPage(location.pathname);
});
