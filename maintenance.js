(() => {
  "use strict";

  const config = window.FRG_MAINTENANCE;
  if (!config?.enabled) return;

  const text = (value, fallback = "") =>
    typeof value === "string" && value.trim() ? value.trim() : fallback;
  const progress = Math.min(100, Math.max(0, Number(config.progress) || 0));
  const showProgress = Boolean(config.showProgress);
  const contactEmail = text(config.contactEmail, "info@fleury-radio.ch");

  document.documentElement.classList.add("maintenance-mode");
  document.title = "Wartungsarbeiten | Fleury Radio Group";

  let robots = document.querySelector('meta[name="robots"]');
  if (!robots) {
    robots = document.createElement("meta");
    robots.setAttribute("name", "robots");
    document.head.appendChild(robots);
  }
  robots.setAttribute("content", "noindex,nofollow");

  const render = () => {
    document.body.className = "maintenance-active";
    document.body.innerHTML = `
      <main class="maintenance-page">
        <div class="maintenance-brand" aria-label="Fleury Radio Group">
          <img src="/img/FRG.webp" alt="FRG Logo">
          <div>
            <strong>Fleury Radio Group</strong>
            <span>Basel · Schweiz</span>
          </div>
        </div>

        <section class="maintenance-card" aria-labelledby="maintenance-title">
          <div class="maintenance-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3v3"></path><path d="M12 18v3"></path>
              <path d="m4.22 4.22 2.12 2.12"></path><path d="m17.66 17.66 2.12 2.12"></path>
              <path d="M3 12h3"></path><path d="M18 12h3"></path>
              <path d="m4.22 19.78 2.12-2.12"></path><path d="m17.66 6.34 2.12-2.12"></path>
            </svg>
          </div>
          <p class="maintenance-eyebrow">${escapeHtml(text(config.eyebrow, "FLEURY RADIO GROUP"))}</p>
          <h1 id="maintenance-title">${escapeHtml(text(config.title, "Wir sind bald wieder für Dich da."))}</h1>
          <p class="maintenance-message">${escapeHtml(text(config.message, "Unsere Website wird zurzeit überarbeitet. Danke für Deine Geduld."))}</p>

          ${showProgress ? `
            <div class="maintenance-progress" aria-label="Fortschritt ${progress} Prozent">
              <div><span>Fortschritt</span><strong>${progress}%</strong></div>
              <div class="maintenance-progress-track"><span style="width:${progress}%"></span></div>
            </div>
          ` : ""}

          <div class="maintenance-details">
            <p>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>
              ${escapeHtml(text(config.availability, "Voraussichtlich bald wieder erreichbar"))}
            </p>
            <a href="mailto:${escapeAttribute(contactEmail)}">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>
              ${escapeHtml(contactEmail)}
            </a>
          </div>
        </section>

        <footer class="maintenance-footer">© ${new Date().getFullYear()} Fleury Radio Group</footer>
      </main>
    `;
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
  }

  function escapeAttribute(value) {
    return String(value).replace(/[^a-zA-Z0-9@._+\-]/g, "");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render, { once: true });
  } else {
    render();
  }
})();
