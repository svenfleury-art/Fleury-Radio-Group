const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const baseUrl = "https://frg-radio.ch";

const routes = [
  {
    slug: "radios",
    source: "pages/radios.html",
    title: "Radios der Fleury Radio Group | FRG",
    description: "Entdecke Radio Rhywälle, Winterlord FM und RhyRock Radio – die unabhängigen Online-Radios der Fleury Radio Group aus der Region Basel."
  },
  {
    slug: "rhywaelle",
    source: "pages/rhywaelle.html",
    title: "Radio Rhywälle | Pop & Rap aus Basel",
    description: "Radio Rhywälle ist das Pop- und Rap-Online-Radio der Fleury Radio Group – dini Musik, dini Wälle, direkt vom Rhy."
  },
  {
    slug: "winterlord",
    source: "pages/winterlord.html",
    title: "Winterlord FM | Power, Melodic & Epic Metal",
    description: "Winterlord FM spielt Power Metal, Melodic Metal und Epic Metal. The Sound of Eternal Winter – ein Online-Radio der Fleury Radio Group aus der Schweiz."
  },
  {
    slug: "rhyrock",
    source: "pages/rhyrock.html",
    title: "RhyRock Radio | Rock & Alternative aus Basel",
    description: "RhyRock Radio bringt Rock und Alternative direkt vom Rhy – ein unabhängiges Online-Radio der Fleury Radio Group aus Basel."
  },
  {
    slug: "frg-inside",
    source: "pages/frg-inside.html",
    title: "FRG Inside | Ein Blick hinter die Fleury Radio Group",
    description: "Erfahre, wie die Fleury Radio Group arbeitet, wie ihre Streams entstehen und was die drei unabhängigen Sender aus der Region Basel verbindet."
  },
  {
    slug: "geschichte",
    source: "pages/geschichte.html",
    title: "Geschichte der Fleury Radio Group | FRG",
    description: "Die Geschichte der Fleury Radio Group: Wie aus einer Idee in Riehen eine unabhängige Online-Radiogruppe aus der Region Basel wurde."
  },
  {
    slug: "about",
    source: "pages/about.html",
    title: "Über die Fleury Radio Group | FRG aus Basel",
    description: "Lerne die Mission, Struktur und Menschen hinter der Fleury Radio Group kennen – einer unabhängigen Online-Radiogruppe aus der Region Basel."
  },
  {
    slug: "mitmachen",
    source: "pages/mitmachen.html",
    title: "Bei der Fleury Radio Group mitmachen | FRG",
    description: "Werde Teil der Fleury Radio Group: Entdecke offene Möglichkeiten in Moderation, Musikredaktion, Technik und Social Media."
  },
  {
    slug: "spezial-programm",
    source: "pages/spezial-programm.html",
    title: "Spezialprogramm der Fleury Radio Group | FRG",
    description: "Entdecke Spezialsendungen, Themenabende und besondere Audioformate der Fleury Radio Group."
  },
  {
    slug: "artists",
    source: "pages/Artists.html",
    title: "Musik bei der Fleury Radio Group einreichen | FRG",
    description: "Künstlerinnen, Künstler und Labels können ihre Musik bei der Fleury Radio Group für Radio Rhywälle, Winterlord FM und RhyRock Radio einreichen."
  },
  {
    slug: "werbung",
    source: "pages/werbung.html",
    title: "Werbung bei der Fleury Radio Group | FRG",
    description: "Informiere Dich über Werbemöglichkeiten und Partnerschaften bei der Fleury Radio Group und ihren Online-Radios."
  },
  {
    slug: "kontakt",
    source: "pages/kontakt.html",
    title: "Kontakt | Fleury Radio Group",
    description: "Kontaktiere die Fleury Radio Group für Fragen, Feedback, Partnerschaften oder Medienanfragen."
  },
  {
    slug: "impressum",
    source: "pages/impressum.html",
    title: "Impressum | Fleury Radio Group",
    description: "Impressum der Fleury Radio Group."
  },
  {
    slug: "agb",
    source: "pages/agb.html",
    title: "AGB | Fleury Radio Group",
    description: "Allgemeine Geschäftsbedingungen der Fleury Radio Group."
  },
  {
    slug: "datenschutz",
    source: "pages/datenschutz.html",
    title: "Datenschutz | Fleury Radio Group",
    description: "Datenschutzerklärung der Fleury Radio Group."
  }
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8").trim();
}

function toRootRelative(html) {
  return html
    .replaceAll('src="img/', 'src="/img/')
    .replaceAll("src='img/", "src='/img/")
    .replaceAll('href="img/', 'href="/img/')
    .replaceAll("href='img/", "href='/img/");
}

function toDirectoryLinks(html) {
  return routes.reduce(
    (result, route) => result.replaceAll(`href="/${route.slug}"`, `href="/${route.slug}/"`),
    html
  );
}

function createPage(route, navigation, footer) {
  const body = toDirectoryLinks(toRootRelative(read(route.source)));
  const canonical = `${baseUrl}/${route.slug}/`;

  return `<!doctype html>
<html lang="de" data-static-page="true">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index,follow">
  <title>${route.title}</title>
  <meta name="description" content="${route.description}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="de_CH">
  <meta property="og:site_name" content="Fleury Radio Group">
  <meta property="og:title" content="${route.title}">
  <meta property="og:description" content="${route.description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${baseUrl}/img/FRG.webp">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${route.title}">
  <meta name="twitter:description" content="${route.description}">
  <meta name="twitter:image" content="${baseUrl}/img/FRG.webp">
  <link rel="icon" href="/img/FRG.webp">
  <link rel="apple-touch-icon" href="/img/FRG.webp">
  <link rel="stylesheet" href="/style.css">
  <script type="application/ld+json">{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": ${JSON.stringify(route.title)},
    "description": ${JSON.stringify(route.description)},
    "url": ${JSON.stringify(canonical)},
    "inLanguage": "de-CH",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Fleury Radio Group",
      "url": "${baseUrl}/"
    },
    "about": {
      "@type": "Organization",
      "name": "Fleury Radio Group",
      "url": "${baseUrl}/",
      "areaServed": "Basel, Schweiz"
    }
  }</script>
</head>
<body>
  ${toDirectoryLinks(toRootRelative(navigation))}
  <main id="app">
    ${body}
  </main>
  ${toDirectoryLinks(toRootRelative(footer))}
  <script src="/main.js" defer></script>
</body>
</html>
`;
}

const navigation = read("partials/nav.html");
const footer = read("partials/footer.html");

for (const route of routes) {
  const outputDir = path.join(root, route.slug);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "index.html"), createPage(route, navigation, footer));
}

console.log(`Generated ${routes.length} indexable static pages.`);
