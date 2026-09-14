# Fleury Radio Group

Offizielle Website der Fleury Radio Group aus Basel/Riehen.

## Wartungsmodus ein- und ausschalten

Öffne die Datei [`maintenance-config.js`](maintenance-config.js) und ändere nur diese Zeile:

```js
enabled: true,
```

- `true` zeigt auf **allen Seiten und Unterseiten** die Wartungsseite.
- `false` zeigt wieder die normale FRG-Website.

Danach die Änderung speichern, committen und zu GitHub pushen. GitHub Pages übernimmt die neue Einstellung normalerweise innerhalb weniger Minuten.

Die Texte, Kontaktadresse und optionale Fortschrittsanzeige können ebenfalls in `maintenance-config.js` angepasst werden. Für eine schlichte Wartungsseite bleibt `showProgress: false` gesetzt.
