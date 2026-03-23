/* -------------------------
PAGE LOADER
------------------------- */
function initLoader() {
  const loader = document.createElement("div");
  loader.id = "loader";
  loader.innerHTML = '<div class="radio">📻</div>';
  document.body.prepend(loader);
}
initLoader();

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.style.opacity = "0";
  setTimeout(() => loader.remove(), 400);
});

/* -------------------------
PARTIALS & DOMContentLoaded
------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  await loadPartial("nav-slot", "partials/nav.html");
  await loadPartial("footer-slot", "partials/footer.html");

  initMenu();
  initCookies();
  initFilter();
  initCountdown();
  initJinglePlayer(); // 🔥 WICHTIG: Jingle Player initialisieren

  refreshAllStations();
  initPlayerCounting();
  setInterval(refreshAllStations, 30000);
});

/* -------------------------
PARTIAL LOADER
------------------------- */
async function loadPartial(slotId, url) {
  const slot = document.getElementById(slotId);
  if (!slot) return;
  try {
    const res = await fetch(url);
    if (!res.ok) return console.error("Partial konnte nicht geladen werden:", url);
    slot.innerHTML = await res.text();
  } catch (err) {
    console.error("Fetch Fehler:", err);
  }
}

/* -------------------------
MENU SYSTEM & DROPDOWNS
------------------------- */
function initMenu() {
  const btn = document.getElementById("hamburgerBtn")
  const nav = document.getElementById("mainNav")
  const overlay = document.getElementById("menu-overlay")
  if (!btn || !nav) return

  function closeMenu() {
    nav.classList.remove("open")
    btn.classList.remove("active")
    btn.textContent = "☰"
    if (overlay) overlay.classList.remove("active")
  }
  function openMenu() {
    nav.classList.add("open")
    btn.classList.add("active")
    btn.textContent = "✕"
    if (overlay) overlay.classList.add("active")
  }
  closeMenu()

  btn.addEventListener("click", e => {
    e.stopPropagation()
    nav.classList.contains("open") ? closeMenu() : openMenu()
  })
  if (overlay) overlay.addEventListener("click", closeMenu)
  document.addEventListener("click", e => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) closeMenu()
  })
  nav.addEventListener("click", e => {
    const toggleBtn = e.target.closest(".dropdown-toggle")
    if (!toggleBtn) return
    e.preventDefault()
    e.stopPropagation()
    const dropdown = toggleBtn.closest(".nav-dropdown")
    if (!dropdown) return
    nav.querySelectorAll(".nav-dropdown").forEach(d => { if (d !== dropdown) d.classList.remove("open") })
    dropdown.classList.toggle("open")
  })
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
    banner.classList.add("hide");
    setTimeout(() => (banner.style.display = "none"), 600);
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
        event.style.display =
          filter === "all" || event.classList.contains(filter) ? "block" : "none";
      });
    });
  });
}


/* -------------------------
Countdown
------------------------- */
/* --- Flip-Countdown Script --- */
function flipAnimation(card, newNumber) {
  const top = card.querySelector('.flip-top');
  const bottom = card.querySelector('.flip-bottom');
  const next = card.querySelector('.flip-next');

  if (top.textContent == newNumber) return;

  next.textContent = newNumber;
  top.classList.add('animate');
  next.classList.add('animate');

  top.addEventListener('animationend', () => {
    top.textContent = newNumber;
    bottom.textContent = newNumber;
    top.classList.remove('animate');
    next.classList.remove('animate');
  }, { once: true });
}

// Zielzeit einstellen (Beispiel: 5 Minuten von jetzt)
let targetDate = new Date();
targetDate.setMinutes(targetDate.getMinutes() + 5);

function updateCountdown() {
  const now = new Date();
  const diff = Math.max(0, Math.floor((targetDate - now) / 1000));

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  flipAnimation(document.getElementById('days'), days);
  flipAnimation(document.getElementById('hours'), hours);
  flipAnimation(document.getElementById('minutes'), minutes);
  flipAnimation(document.getElementById('seconds'), seconds);
}

updateCountdown(); // sofort initialisieren
setInterval(updateCountdown, 1000);
/* -------------------------
FRG JINGLE PLAYER
------------------------- */
function initJinglePlayer() {
  const buttons = document.querySelectorAll(".playBtn");
  const audio = document.getElementById("audioPlayer");

  if (!buttons.length || !audio) return;

  let hasPlayedJingle = false;

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const streamUrl = button.getAttribute("data-stream");
      if (!streamUrl) return;

      audio.pause();
      audio.currentTime = 0;

      if (!hasPlayedJingle) {
        hasPlayedJingle = true;

        console.log("▶️ Jingle startet");

        audio.src = "frg-jingle.mp3"; // ✅ Datei liegt im gleichen Ordner wie HTML
        audio.play().catch(err => console.log(err));

        const handleEnd = () => {
          console.log("🎧 Stream startet");

          audio.src = streamUrl;
          audio.play().catch(err => console.log(err));

          audio.removeEventListener("ended", handleEnd);
        };

        audio.addEventListener("ended", handleEnd);

      } else {
        console.log("🎧 Direkt Stream");

        audio.src = streamUrl;
        audio.play().catch(err => console.log(err));
      }
    });
  });
}

// Künstler-Formular Submission – FRG
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("artist-form");
  const msg = document.getElementById("form-msg");

  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        msg.style.display = "block";
        msg.textContent = "Vielen Dank! Dein Track wurde erfolgreich eingereicht.";
        form.reset();
      } else {
        response.json().then(data => {
          msg.style.display = "block";
          msg.textContent = data.errors ? data.errors.map(e => e.message).join(", ") : "Fehler beim Senden.";
        });
      }
    }).catch(() => {
      msg.style.display = "block";
      msg.textContent = "Fehler beim Senden. Bitte versuche es später erneut.";
    });
  });
});

// main.js – nur die AGB Checkbox Logik
const agbCheckbox = document.getElementById('agb');
const submitBtn = document.getElementById('submitBtn');

if (agbCheckbox && submitBtn) {
  agbCheckbox.addEventListener('change', () => {
    submitBtn.disabled = !agbCheckbox.checked;
  });
}
