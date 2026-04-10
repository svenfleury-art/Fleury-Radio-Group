document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("mainNav");
  const btn = document.getElementById("hamburgerBtn");

  /* =========================
     HAMBURGER TOGGLE
  ========================= */
  btn.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  /* =========================
     DROPDOWN LOGIC
  ========================= */
  document.addEventListener("click", (e) => {
    const toggle = e.target.closest(".dropdown-toggle");

    // Dropdown öffnen/schließen
    if (toggle) {
      e.preventDefault();

      const parent = toggle.closest(".nav-dropdown");

      // andere schließen
      document.querySelectorAll(".nav-dropdown").forEach(d => {
        if (d !== parent) d.classList.remove("open");
      });

      parent.classList.toggle("open");
      return;
    }

    // Klick außerhalb → schließen
    document.querySelectorAll(".nav-dropdown").forEach(d => {
      d.classList.remove("open");
    });
  });
});
