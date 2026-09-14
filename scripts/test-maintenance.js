const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const configSource = fs.readFileSync(path.join(root, "maintenance-config.js"), "utf8");
const maintenanceSource = fs.readFileSync(path.join(root, "maintenance.js"), "utf8");

const configSandbox = { window: {} };
vm.runInNewContext(configSource, configSandbox);
assert.equal(typeof configSandbox.window.FRG_MAINTENANCE.enabled, "boolean");
assert.equal(configSandbox.window.FRG_MAINTENANCE.enabled, true);

const disabledSandbox = {
  window: { FRG_MAINTENANCE: { enabled: false } },
  document: new Proxy({}, {
    get() {
      throw new Error("Der Wartungsmodus darf bei enabled: false nicht auf das Dokument zugreifen.");
    }
  })
};
vm.runInNewContext(maintenanceSource, disabledSandbox);

const publicPages = [
  "index.html",
  "404.html",
  "radios/index.html",
  "rhywaelle/index.html",
  "winterlord/index.html",
  "rhyrock/index.html",
  "frg-inside/index.html",
  "geschichte/index.html",
  "about/index.html",
  "mitmachen/index.html",
  "gewinnspiel/index.html",
  "spezial-programm/index.html",
  "artists/index.html",
  "werbung/index.html",
  "kontakt/index.html",
  "impressum/index.html",
  "agb/index.html",
  "datenschutz/index.html"
];

for (const relativePath of publicPages) {
  const html = fs.readFileSync(path.join(root, relativePath), "utf8");
  assert(html.includes("/maintenance-config.js"), `${relativePath}: Konfiguration fehlt`);
  assert(html.includes("/maintenance.js"), `${relativePath}: Wartungsskript fehlt`);
}

console.log(`Wartungsmodus geprüft: Schalter funktioniert und ${publicPages.length} öffentliche Seiten sind eingebunden.`);
