import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { canRenderAd, countEditorialWords } from "../src/utils/adEligibility.js";

const readProjectFile = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const publicDirectory = new URL("../public/", import.meta.url);
const siteMap = readProjectFile("../public/sitemap.xml");
const homePage = readProjectFile("../index.html");
const staticPages = [
  ["sobre-nosotros", "Sobre FF Sens Pro"],
  ["privacidad", "Privacidad y cookies"],
  ["aviso-legal", "Aviso legal"],
  ["contacto", "Contacto"],
  ["terminos", "Términos de uso"],
  ["guia-sensibilidad", "Guía paso a paso"],
  ["blog", "Artículos de sensibilidad y práctica"],
  ["blog/probar-sensibilidad-headshot", "Cómo probar sensibilidad y precisión"],
  ["blog/punteria-en-movil", "Cómo evaluar la puntería"],
  ["blog/dpi-y-modelo-de-telefono", "DPI y modelo de teléfono: límites de las referencias"],
  ["blog/errores-al-cambiar-sensibilidad", "Errores comunes al cambiar sensibilidad"],
  ["blog/rendimiento-y-gama-del-telefono", "Rendimiento y gama del teléfono"],
];
const footerLinks = [
  "/sobre-nosotros/",
  "/guia-sensibilidad/",
  "/blog/",
  "/privacidad/",
  "/aviso-legal/",
  "/terminos/",
  "/contacto/",
];

test("homepage exposes useful publisher content without JavaScript", () => {
  assert.match(homePage, /id="publisher-content"/);
  assert.match(homePage, /Cómo ajustar la sensibilidad de Free Fire con criterio/);
  assert.match(homePage, /href="\/privacidad\/"/);
  const editorial = homePage.match(/<section class="publisher-content"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.ok(countEditorialWords(editorial.replace(/<[^>]*>/g, " ")) >= 300);
});

test("homepage explains best-effort device detection without claiming real DPI access", () => {
  const app = readProjectFile("../src/App.jsx");
  assert.match(app, /Detectar mi dispositivo/);
  assert.match(app, /navegador confirma Android, pero no comparte el modelo exacto/);
  assert.match(homePage, /nunca proporciona el DPI real/);
});

test("homepage contains eight useful FAQs and a full guide and article links", () => {
  const faqCount = (homePage.match(/<details>/g) ?? []).length;
  assert.ok(faqCount >= 8, `Expected at least 8 FAQs, found ${faqCount}`);
  assert.match(homePage, /href="\/guia-sensibilidad\/"/);
  assert.match(homePage, /href="\/blog\/"/);
  assert.match(homePage, /id="ad-slot-mount"/);
  assert.doesNotMatch(homePage, /adsbygoogle\.js/);
});

test("editorial and information pages have metadata, content, sitemap entries, and no ad script", () => {
  for (const [route, title] of staticPages) {
    const page = readProjectFile(`../public/${route}/index.html`);
    assert.ok(page.includes(`<title>${title}`), `${route} is missing its title`);
    assert.ok(page.includes(`rel="canonical" href="https://ff-sensi-pro-v2.vercel.app/${route}/"`));
    assert.match(page, /<meta name="description" content="[^"]+"/);
    assert.match(page, /<main class="info-content">/);
    assert.match(page, /<h1>/);
    assert.doesNotMatch(page, /pagead2\.googlesyndication\.com/);
    assert.ok(siteMap.includes(`<loc>https://ff-sensi-pro-v2.vercel.app/${route}/</loc>`));
    for (const href of footerLinks.filter((href) => href !== `/${route}/`)) {
      assert.ok(page.includes(`href="${href}"`), `${route} footer is missing ${href}`);
    }
  }
});

test("the step-by-step guide has at least 800 words and five distinct articles exist", () => {
  const guide = readProjectFile("../public/guia-sensibilidad/index.html");
  const guideBody = guide.match(/<main class="info-content">([\s\S]*?)<\/main>/)?.[1] ?? "";
  assert.ok(countEditorialWords(guideBody.replace(/<[^>]*>/g, " ")) >= 800);
  const articles = staticPages.filter(([route]) => route.startsWith("blog/"));
  assert.equal(articles.length, 5);
  for (const [route] of articles) {
    const page = readProjectFile(`../public/${route}/index.html`);
    const body = page.match(/<main class="info-content">([\s\S]*?)<\/main>/)?.[1] ?? "";
    assert.ok(
      countEditorialWords(body.replace(/<[^>]*>/g, " ")) >= 300,
      `${route} should contain at least 300 editorial words`,
    );
  }
});

test("all navigation links from static pages resolve to a local file", () => {
  for (const [route] of staticPages) {
    const page = readProjectFile(`../public/${route}/index.html`);
    for (const [, href] of page.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
      const targetDirectory = href === "/" ? new URL("../", import.meta.url).pathname : publicDirectory.pathname;
      const pathname = href === "/" ? "index.html" : href.replace(/^\/+/, "");
      const target = join(targetDirectory, pathname);
      assert.ok(
        existsSync(target) || existsSync(join(target, "index.html")),
        `${route} links to missing ${href}`,
      );
    }
  }
});

test("404 and ads.txt are present and the 404 never loads advertising", () => {
  const notFoundPage = readProjectFile("../public/404.html");
  const adsTxt = readProjectFile("../public/ads.txt");
  const robotsTxt = readProjectFile("../public/robots.txt");
  const privacyPage = readProjectFile("../public/privacidad/index.html");
  const contactPage = readProjectFile("../public/contacto/index.html");
  const aboutPage = readProjectFile("../public/sobre-nosotros/index.html");
  assert.match(notFoundPage, /name="robots" content="noindex/);
  assert.doesNotMatch(notFoundPage, /adsbygoogle|pagead2\.googlesyndication\.com/);
  assert.match(adsTxt, /^google\.com, pub-\d+, DIRECT, f08c47fec0942fa0$/m);
  assert.match(robotsTxt, /Sitemap: https:\/\/ff-sensi-pro-v2\.vercel\.app\/sitemap\.xml/);
  assert.match(privacyPage, /AdSense/);
  assert.match(privacyPage, /personalizaci[oó]n/i);
  assert.match(privacyPage, /cookies/i);
  assert.match(contactPage, /mailto:danpon421@gmail\.com/);
  assert.match(aboutPage, /no est[aá] afiliado/i);
});

test("AdSlot requires publisher content, a ready page, TCF consent, and a real slot", () => {
  const ready = {
    contentWordCount: 320,
    pageStatus: "ready",
    hasConsent: true,
    slotId: "1234567890",
    isPublisherPage: true,
  };
  assert.equal(canRenderAd(ready), true);
  assert.equal(canRenderAd({ ...ready, contentWordCount: 299 }), false);
  assert.equal(canRenderAd({ ...ready, pageStatus: "empty" }), false);
  assert.equal(canRenderAd({ ...ready, pageStatus: "loading" }), false);
  assert.equal(canRenderAd({ ...ready, pageStatus: "error" }), false);
  assert.equal(canRenderAd({ ...ready, pageStatus: "building" }), false);
  assert.equal(canRenderAd({ ...ready, hasConsent: false }), false);
  assert.equal(canRenderAd({ ...ready, slotId: "" }), false);
  assert.equal(canRenderAd({ ...ready, isPublisherPage: false }), false);
});

test("AdSense CSP permits Google ad delivery without unsafe script execution", () => {
  const { headers } = JSON.parse(readProjectFile("../vercel.json"));
  const policy = headers[0].headers.find((header) => header.key === "Content-Security-Policy")?.value;
  assert.ok(policy);
  assert.match(policy, /script-src[^;]*https:\/\/pagead2\.googlesyndication\.com/);
  assert.doesNotMatch(policy, /script-src[^;]*'unsafe-(?:inline|eval)'/);
});
