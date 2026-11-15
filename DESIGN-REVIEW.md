# FRG Redesign – Design Review

## Thesis

Die Website soll sich wie ein sauber kuratiertes Schweizer Broadcast-System anfühlen: ruhig, präzise und eigenständig. Die wichtigste Aktion ist jederzeit klar: **einen FRG-Sender auswählen und live hören**.

## Was

Die bisherige `style.css` enthielt mehrere aufeinanderfolgende Relaunch- und Mobile-Fix-Schichten mit starkem Glow, vielen Gradients, uneinheitlichen Radien und mehrfach überschriebenen Komponenten.

## Warum

Die Informationshierarchie wurde dadurch unruhig und wirkte eher generiert als gestaltet. Besonders bei einer Radiomarke sollte der Live-Player die Signatur sein; dekorative Effekte dürfen die Inhalte nicht übertönen.

## Fix

Die neue Abschluss-Ebene in `style.css` führt ein benanntes Token-System ein: Ink-Flächen, ruhige Linien, ein Signalgrün für FRG-Aktionen und Senderfarben nur als Statussignal. Der Live-Player ist das einzige bewusst betonte visuelle Element. Header, Karten, Footer und Formulare verwenden dieselben Abstände, Radien und Zustände.

## Designsystem

- **Farben:** `#0B0D12` Grundfläche, `#151A22` Panel, `#F4F2EC` Primärtext, `#ADB1B6` Sekundärtext, `#C8EF3F` FRG-Signal. Die drei Senderfarben bleiben funktionale Kennzeichnung: Blau für Rhywälle, Eisblau für Winterlord und Orange für RhyRock.
- **Typografie:** System-Sans für bessere Lesbarkeit, klare Gewichte statt dekorativer Display-Schrift. Body-Text bleibt bei 16px, interaktive Ziele erreichen mindestens 44px Höhe.
- **Layout:** Mobile-first, linksbündige Editorial-Hierarchie, ein begrenzter Content-Rahmen statt vieler verschachtelter Zentrierungen. Auf breiten Screens entsteht der Live-Bereich als asymmetrische Zweiteilung.
- **Signatur:** Der senderbewusste Live-Player mit Logo, Titel, Senderwahl und klarer Startaktion. Das gehört direkt zum Produkt und nicht zu einer generischen Landingpage.
- **Motion:** Animation unterstützt nur Live-Status und Signalvisualisierung. `prefers-reduced-motion` deaktiviert alle Bewegungen.

## HIG-/Design-Rules-Referenzen

- `accessibility.md › Vision`: Kontrast, grössere Schrift und Information nicht nur über Farbe.
- `accessibility.md › Mobility`: Interaktive Ziele und genügend Abstand; zentrale Player-Aktionen sind mindestens 44px hoch.
- `layout.md › Visual hierarchy`: Wichtigste Inhalte stehen oben und werden durch Gruppierung und Ausrichtung scanbar gemacht.
- `layout.md › Adaptability`: Breakpoints richten sich nach verfügbarem Platz; Funktionen bleiben auf allen Grössen gleich.
- `typography.md › Ensuring legibility`: Keine dünnen kleinen Schriften; System-Sans und 16px Basisgrösse für Fliesstext.
- `buttons.md › Best practices`: Primäre Aktion bekommt eine klare visuelle Priorität und einen Press-/Focus-Zustand.
- `motion.md › Best practices`: Bewegung ist zweckgebunden, kurz und optional.
- `cross-platform.md › Conventions to check`: CSS Custom Properties als benannte Design-Tokens und ARIA-/Tastatur-Fokus für Web-Komponenten.

## Entfernt bzw. bewusst nicht weitergeführt

- Vollflächige Neon-Glow-Hierarchien und dekorative Textschatten.
- Häufige Hover-Animationen auf Inhaltskarten.
- Mehrere konkurrierende Primärfarben innerhalb eines Screens.
- Die permanente Randkarte bleibt funktional, wird aber visuell ruhiger und auf Mobile nicht als zusätzliche Barriere zwischen Inhalt und Navigation eingesetzt.


## Refinement: Open Editorial

Auf Wunsch wurde die visuelle Box-Logik nochmals reduziert. Inhaltsbereiche wie Senderkarten, Prozessschritte, Kontaktbereiche und Countdown-Zellen haben keine sichtbaren Rahmen, Flächen oder Schatten mehr. Sie werden über Whitespace, typografische Hierarchie, Gruppierung und kurze Signalstriche getrennt. Eingabefelder behalten ihre Umrandung als Bedienhinweis; der Live-Bereich behält lediglich horizontale Abschnittsgrenzen, damit die wichtigste Funktion auffindbar bleibt, ohne wie eine Karte zu wirken.

Der Footer verwendet nun einen echten Full-Bleed-Wrapper mit `width: 100vw` und `margin-left: calc(50% - 50vw)`. Dadurch reicht seine Hintergrundfläche unabhängig vom begrenzten Main-Container über die gesamte Browserbreite. Die innere Lesebreite bleibt bewusst am Header-Raster ausgerichtet.

Diese Anpassung folgt `layout.md › Visual hierarchy`: Gruppierung soll über Ausrichtung und bewusst eingesetzten Negativraum entstehen. Sie folgt ebenfalls `layout.md › Visual hierarchy` mit dem Grundsatz, progressive Offenlegung und klare Beziehungen gegenüber unnötiger visueller Dichte zu bevorzugen. Die Boxen wurden als ein überflüssiges Gestaltungselement entfernt; dadurch bleibt der Live-Player als FRG-spezifische Signatur übrig.
