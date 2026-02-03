document.addEventListener("DOMContentLoaded", async () => {
  // 1) Nav + Footer laden
  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  // 2) Menü aktivieren (☰ -> ✕ + Overlay + Klick außerhalb)
  initMenu();

  // 3) Cookie Banner
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

  function openMenu() {
    nav.classList.add("open");
    btn.classList.add("active");
    btn.textContent = "✕";
    if (overlay) overlay.classList.add("active");
  }

  function closeMenu() {
    nav.classList.remove("open");
    btn.classList.remove("active");
    btn.textContent = "☰";
    if (overlay) overlay.classList.remove("active");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = nav.classList.contains("open");
    isOpen ? closeMenu() : openMenu();
  });

  // Klick auf Overlay schließt
  if (overlay) overlay.addEventListener("click", closeMenu);

  // Klick außerhalb (falls Overlay mal nicht da ist)
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) closeMenu();
  });
}

function initCookies() {
  const banner = document.getElementById("cookie-banner");
  const btn = document.getElementById("acceptCookies");
  if (!banner || !btn) return;

  if (!getCookie("cookieConsent")) {
    banner.style.display = "flex";
  }

  btn.addEventListener("click", () => {
    setCookie("cookieConsent", "true", 365);
    banner.style.display = "none";
  });
}

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

function getCookie(name) {
  return document.cookie.split("; ").find(row => row.startsWith(name + "="));
}
