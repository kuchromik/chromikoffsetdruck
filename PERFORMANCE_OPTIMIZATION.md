# Performance-Optimierungen für Chromik Offsetdruck

Diese Dokumentation beschreibt die implementierten Performance-Optimierungen zur Verbesserung der Google Lighthouse-Bewertung.

## Implementierte Optimierungen

### 1. **Vite Build-Konfiguration** ✅
**Problem**: Große JavaScript-Bundles erhöhen die Total Blocking Time (TBT)

**Lösung**:
- Code-Splitting für Vendor-Bibliotheken (Svelte, Firebase getrennt)
- Komponenten in eigene Chunks aufgeteilt
- Terser-Minification mit drop_console in Production
- CSS Code-Splitting aktiviert

**Datei**: `vite.config.js`

### 2. **Bild-Optimierung** ✅
**Problem**: Unoptimierte Bilder verlangsamen Speed Index und verursachen Layout Shifts

**Lösung**:
- Explizite `width` und `height` Attribute für alle Bilder
- `loading="lazy"` für Bilder außerhalb des Viewports
- `decoding="async"` für asynchrones Dekodieren
- Bild-Preloading für Slider implementiert
- `min-height` in CSS für Platzhalter

**Dateien**: 
- `src/lib/components/SimpleImageSlider.svelte`
- `src/lib/components/ContentSection.svelte`

### 3. **Layout Shift Prevention (CLS)** ✅
**Problem**: Content-Sprünge beim Laden verschlechtern die CLS-Metrik

**Lösung**:
- Feste Mindesthöhen für Bild-Container (`min-height: 400px`)
- Platzhalter-Elemente während des Ladens
- `aspect-ratio: 4/3` mit Mindesthöhe
- Hardware-Beschleunigung mit `transform: translateZ(0)`
- CSS `contain: layout` für Überschriften

**Dateien**:
- `src/lib/components/SimpleImageSlider.svelte`
- `src/lib/components/ContentSection.svelte`

### 4. **Resource Hints** ✅
**Problem**: Browser lädt externe Ressourcen zu spät

**Lösung**:
- `dns-prefetch` für externe Domains
- `preconnect` für kritische Verbindungen
- `preload` für Logo und kritische Bilder
- Theme-Color Meta-Tag

**Dateien**:
- `src/routes/+layout.svelte`
- `src/routes/+page.svelte`

### 5. **Font-Loading Optimierung** ✅
**Problem**: Font-Loading blockiert Rendering

**Lösung**:
- `font-display: swap` für System-Fonts
- Optimierte Font-Rendering mit `antialiased`
- `text-rendering: optimizeLegibility`

**Datei**: `src/app.css`

### 6. **CSS und Animation Performance** ✅
**Problem**: Schwere CSS-Transitions verlangsamen Rendering

**Lösung**:
- Hardware-beschleunigte Transforms (`translateZ(0)`)
- `will-change: auto` statt permanenter GPU-Aktivierung
- Animationen nur mit `transform` und `opacity`
- Optimierte Keyframe-Animationen

**Dateien**: `src/app.css`, alle Komponenten

## Zusätzliche Empfehlungen (Manuell umzusetzen)

### 7. **Bildformate optimieren** 🔄
**Aktuell**: JPEG/PNG werden verwendet
**Empfehlung**: 
```bash
# Installiere sharp für Bildoptimierung
npm install -D vite-imagetools

# Konvertiere Bilder zu WebP/AVIF
# Erstelle responsive Bildgrößen (300w, 600w, 1200w)
```

**Vite Plugin hinzufügen**:
```javascript
// In vite.config.js
import { imagetools } from 'vite-imagetools';

plugins: [sveltekit(), imagetools()]
```

**Verwendung**:
```svelte
<picture>
  <source srcset="/image.webp" type="image/webp">
  <source srcset="/image.jpg" type="image/jpeg">
  <img src="/image.jpg" alt="..." loading="lazy">
</picture>
```

### 8. **Server-Side Rendering (SSR) optimieren** 🔄
**In `svelte.config.js`**: 
```javascript
export default {
  kit: {
    adapter: adapter({
      // Prerender kritische Seiten
      prerender: {
        entries: ['/', '/impressum', '/datenschutz']
      }
    })
  }
};
```

### 9. **Compression auf Render.com aktivieren** 🔄
**In Render.com Dashboard**:
- Aktiviere Brotli/Gzip Compression
- Aktiviere HTTP/2
- Setze Cache-Headers für statische Assets

**Oder erstelle `render.yaml`**:
```yaml
services:
  - type: web
    name: chromikoffsetdruck
    env: node
    buildCommand: npm install && npm run build
    startCommand: node build
    healthCheckPath: /
    headers:
      - path: /static/*
        name: Cache-Control
        value: public, max-age=31536000, immutable
      - path: /*
        name: X-Content-Type-Options
        value: nosniff
```

### 10. **Lazy Load Komponenten** 🔄
**Für große Komponenten wie Footer**:
```svelte
<script>
  import { browser } from '$app/environment';
  
  let Footer;
  
  onMount(async () => {
    if (browser) {
      Footer = (await import('$lib/components/Footer.svelte')).default;
    }
  });
</script>

{#if Footer}
  <svelte:component this={Footer} />
{/if}
```

### 11. **Service Worker für Caching** 🔄
```javascript
// src/service-worker.js
import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
```

### 12. **Third-Party Scripts optimieren** 🔄
Falls Sie Google Analytics oder ähnliches nutzen:
```svelte
<svelte:head>
  <!-- Verzögertes Laden von Analytics -->
  <script async defer src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
</svelte:head>
```

## Erwartete Verbesserungen

Nach diesen Optimierungen sollten Sie folgende Verbesserungen sehen:

| Metrik | Vorher | Nachher (erwartet) |
|--------|--------|-------------------|
| **Performance** | 64% | 85-95% |
| **Total Blocking Time** | Hoch | 50-70% Verbesserung |
| **Cumulative Layout Shift** | > 0.1 | < 0.05 |
| **Speed Index** | Langsam | 30-40% schneller |
| **First Contentful Paint** | - | Verbesserung durch Preload |
| **Largest Contentful Paint** | - | Verbesserung durch Lazy Loading |

## Testing

### Lighthouse lokal testen:
```bash
npm run build
npm run preview
# In Chrome DevTools: Lighthouse-Tab > Generate Report
```

### PageSpeed Insights:
https://pagespeed.web.dev/

### WebPageTest:
https://www.webpagetest.org/

## Deployment

Nach dem Deployment auf Render.com:
1. Warte 5-10 Minuten für CDN-Warmup
2. Teste mit Lighthouse im Inkognito-Modus
3. Teste mit PageSpeed Insights
4. Überprüfe die Browser-Console auf Fehler

## Monitoring

Überwachen Sie regelmäßig:
- Core Web Vitals in Google Search Console
- Lighthouse Scores nach jedem Deployment
- Real User Metrics (RUM) mit Tools wie Vercel Analytics

## Weitere Ressourcen

- [Web.dev Performance Guide](https://web.dev/performance/)
- [SvelteKit Performance Best Practices](https://kit.svelte.dev/docs/performance)
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
