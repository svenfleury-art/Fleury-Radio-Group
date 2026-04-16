/* =========================
ROUTES
========================= */
const routes = {
  "/": "/pages/home.html",
  "/rhywaelle": "/pages/rhywaelle.html",
  "/winterlord": "/pages/winterlord.html",
  "/rhyrock": "/pages/rhyrock.html",
  "/radios": "/pages/radios.html",
  "/geschichte": "/pages/geschichte.html",
  "/artists": "/pages/artists.html",
  "/team": "/pages/team.html"
};

/* =========================
GET APP CONTAINER
========================= */
function getApp(){
  return document.getElementById("app");
}

/* =========================
LOAD PAGE (CORE SPA ENGINE)
========================= */
async function loadPage(path = "/") {
  const app = getApp();
  if (!app) return;

  // Normalisierung
  if (path === "/index.html") path = "/";
  if (!routes[path]) path = "/";

  const file = routes[path] || "/pages/404.html";

  try {
    const res = await fetch(file);

    if (!res.ok) {
      app.innerHTML = "<h2>404 - Seite nicht gefunden</h2>";
      return;
    }

    const html = await res.text();
    app.innerHTML = html;

    // Page re-init hook (Player etc.)
    reInitPage();

  } catch (err) {
    console.error("LoadPage Error:", err);
    app.innerHTML = "<h2>Ladefehler</h2>";
  }
}

/* =========================
NAVIGATION (SPA LINK HANDLER)
========================= */
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href");

  // nur interne SPA links
  if (!href.startsWith("/")) return;

  e.preventDefault();

  history.pushState({}, "", href);
  loadPage(href);
});

/* =========================
BACK / FORWARD BUTTON
========================= */
window.addEventListener("popstate", () => {
  loadPage(location.pathname);
});

/* =========================
INIT APP
========================= */
window.addEventListener("DOMContentLoaded", () => {
  loadPage(location.pathname || "/");
});

/* =========================
REINIT HOOK (WICHTIG)
========================= */
function reInitPage(){

  // Falls Player existiert → neu verbinden
  if (typeof initRadioPlayer === "function") {
    initRadioPlayer();
  }

  // Menu sicher neu aktivieren
  if (typeof initMenu === "function") {
    initMenu();
  }

  // Countdown
  if (typeof initCountdown === "function") {
    initCountdown();
  }

  // Filter
  if (typeof initFilter === "function") {
    initFilter();
  }
}
