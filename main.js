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
let countdownInterval = null;

/* =========================
UTILS
========================= */

function normalizePath(path) {
  return path.replace(/\/+$/, "") || "/";
}

/* =========================
SAFE FETCH
========================= */

async function safeFetch(file) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error("Fetch failed: " + file);
    return await res.text();
  } catch (err) {
    console.error(err);
    return "<h2 style='color:white;text-align:center'>Seite konnte nicht geladen werden</h2>";
  }
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
  setTimeout(() => (loader.style.display = "none"), 200);
}

/* =========================
ANIMATION
========================= */

function animateOut(el) {
  return new Promise(r => {
    if (!el) return r();
    el.style.opacity = "0";
    el.style.transform = "translateY(10px)";
    setTimeout(r, 120);
  });
}

function animateIn(el) {
  return new Promise(r => {
    if (!el) return r();
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
    setTimeout(r, 120);
  });
}

/* =========================
PAGE LOADER
========================= */

async function loadPage(path) {
  const app = document.getElementById("app");

  if (!app) {
    console.error("❌ #app fehlt im HTML");
    return;
  }

  const clean = normalizePath(path);
  const file = routes[clean] || routes["/404"];

  showLoader();

  let html;

  if (cache.has(file)) {
    html = cache.get(file);
  } else {
    html = await safeFetch(file);
    cache.set(file, html);
  }

  await animateOut(app);

  app.innerHTML = html;

  await animateIn(app);

  window.scrollTo(0, 0);

  runPageScripts();

  hideLoader();
}

/* =========================
NAVIGATION (SPA FIX)
========================= */

document.addEventListener("click", e => {
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

  if (btn.dataset.init) return;
  btn.dataset.init = "1";

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
EVENT FILTER (FIXED)
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

        card.style.display =
          filter === "all" || card.classList.contains(filter)
            ? "block"
            : "none";
      });
    };
  });
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
FORMS
========================= */

function initForms() {
  function setup(formId, checkboxId, btnId, msgId) {
    const form = document.getElementById(formId);
    const check = document.getElementById(checkboxId);
    const btn = document.getElementById(btnId);
    const msg = document.getElementById(msgId);

    if (!form || !check || !btn || !msg) return;

    check.onchange = () => (btn.disabled = !check.checked);

    form.onsubmit = async e => {
      e.preventDefault();

      msg.style.display = "block";
      msg.textContent = "Senden...";

      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });

        msg.textContent = res.ok ? "✅ Gesendet!" : "❌ Fehler";
        form.reset();
        btn.disabled = true;

        setTimeout(() => (msg.style.display = "none"), 2500);
      } catch {
        msg.textContent = "❌ Netzwerkfehler";
      }
    };
  }

  setup("artist-form-1", "agb-1", "submitBtn-1", "form-msg-1");
  setup("artist-form-2", "agb-2", "submitBtn-2", "form-msg-2");
}

/* =========================
PAGE INIT
========================= */

function runPageScripts() {
  initMenu();
  initEventFilter();
  initRadioPlayer();
  initForms();
  initCountdown();
}

/* =========================
COUNTDOWN (SAFE)
========================= */

function initCountdown() {
  const wrapper = document.querySelector(".countdown");
  if (!wrapper) return;

  if (countdownInterval) clearInterval(countdownInterval);

  wrapper.style.display = "none";
}

/* =========================
BOOT FIX (CRITICAL)
========================= */

window.addEventListener("DOMContentLoaded", () => {
  console.log("FRG JS READY");

  const app = document.getElementById("app");

  if (!app) {
    console.error("❌ #app fehlt!");
    return;
  }

  const path = normalizePath(location.pathname);

  if (routes[path]) {
    loadPage(path);
  } else {
    loadPage("/404");
  }
});
