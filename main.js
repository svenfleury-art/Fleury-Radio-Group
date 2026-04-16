
/* =========================
ROUTES
========================= */
const routes = {
  "/": "/pages/home.html",
  "/rhywälle": "/pages/rhywaelle.html",
  "/winterlord": "/pages/winterlord.html",
  "/rhyrock": "/pages/rhyrock.html",
  "/radios": "/pages/radios.html",
  "/geschichte": "/pages/geschichte.html",
  "/artists": "/pages/artists.html",
  "/team": "/pages/team.html"
};

/* =========================
PAGE LOADER
========================= */
async function loadPage(path){
  const app = document.getElementById("app");
  const file = routes[path] || "/pages/404.html";

  try{
    const res = await fetch(file);
    const html = await res.text();

    app.innerHTML = html;

    reInitPage();

  } catch(err){
    app.innerHTML = "<h2>Fehler beim Laden</h2>";
  }
}

/* =========================
NAVIGATION HANDLER
========================= */
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if(!link) return;

  const href = link.getAttribute("href");

  if(href && href.startsWith("/")){
    e.preventDefault();
    history.pushState({}, "", href);
    loadPage(href);
  }
});

/* =========================
BACK BUTTON
========================= */
window.addEventListener("popstate", () => {
  loadPage(location.pathname);
});

/* =========================
INIT
========================= */
window.addEventListener("DOMContentLoaded", () => {
  loadPage(location.pathname);
});
