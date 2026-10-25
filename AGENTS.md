# FRG-Projektregeln

## Apple-Design-Prüfungen

Bei allen UI-/UX-Änderungen, neuen Seiten, Komponenten, Layouts oder visuellen Überarbeitungen:

1. Lies `.design-rules/SKILL.md` vollständig.
2. Nutze `.design-rules/references/hig-lookup.md`, um die passenden HIG-Referenzen zu finden.
3. Lade nur die relevanten Dateien aus `.design-rules/references/hig/` sowie `.design-rules/references/cross-platform.md`.
4. Für diese statische Website gelten primär die HIG-Grundlagen zu Accessibility, Farbe, Typografie, Layout, Inhalt, Dark Mode, Motion und responsive Verhalten. Native iOS-/macOS-Konventionen gelten nur, wenn ausdrücklich eine native App oder ein plattformspezifisches Verhalten entwickelt wird.
5. Prüfe vorhandene FRG-Markenmittel und erhalte die eigenständige Radio-Identität. Keine generischen Apple-Kopien und kein unnötiges Glassmorphism.
6. Dokumentiere Findings mit `What`, `Why`, `Fix` und einer Referenz im Format `datei.md › Überschrift`. Nenne Messwerte wie Kontrastverhältnisse, Schriftgrössen und Mindestgrössen, wenn sie überprüfbar sind.

Bei Code-Audits für dieses Repository berücksichtige HTML, CSS, JavaScript, responsive Breakpoints, Tastaturbedienung, sichtbare Fokuszustände, Semantik, Alt-Texte, Formulare, Audio-Steuerung, reduzierte Bewegung sowie helle und dunkle Darstellung.
