# Bildoptimierungs-Checkliste

## Sofort umsetzbar (Kein Code nötig)

### 1. Bilder komprimieren
Verwenden Sie Online-Tools oder lokale Software um Ihre Bilder zu komprimieren:

#### Online-Tools:
- **TinyPNG**: https://tinypng.com/ (Für PNG/JPEG)
- **Squoosh**: https://squoosh.app/ (Google, unterstützt WebP)
- **Compressor.io**: https://compressor.io/

#### Lokale Tools:
- **ImageOptim** (Mac): https://imageoptim.com/
- **FileOptimizer** (Windows): https://sourceforge.net/projects/nikkhokkho/

#### Empfohlene Einstellungen:
- JPEG Qualität: 75-85%
- PNG: Verlustfreie Komprimierung
- Maximale Breite: 1200px für Hero-Images, 600px für Content-Images

### 2. WebP Format nutzen

#### Konvertierung mit Online-Tools:
1. Gehen Sie zu https://squoosh.app/
2. Laden Sie Ihre Bilder hoch
3. Wählen Sie "WebP" als Ausgabeformat
4. Qualität: 80-85%
5. Download und ersetzen Sie die Originaldateien

#### Batch-Konvertierung (Command Line):
```bash
# Installation (falls nicht vorhanden)
npm install -g sharp-cli

# Alle JPGs im Ordner zu WebP konvertieren
npx sharp -i "static/heroSlider/*.jpg" -o "static/heroSlider/{name}.webp" -f webp -q 85

# Für alle Slider-Ordner
npx sharp -i "static/*/slider/*.jpg" -o "static/*/slider/{name}.webp" -f webp -q 85
```

### 3. Bildgrößen anpassen

Für jeden Ordner empfohlene maximale Dimensionen:
- **heroSlider**: 1200x900px (4:3 Ratio)
- **foilSlider**: 800x600px
- **blindSlider**: 800x600px
- **cutSlider**: 800x600px
- **pantoneSlider**: 800x600px

#### Mit Sharp (Command Line):
```bash
# Resize auf maximale Breite 800px
npx sharp -i "static/foilSlider/*.jpg" -o "static/foilSlider/optimized/{name}.jpg" --resize 800
```

## Empfohlene Implementierung (Optional, für beste Ergebnisse)

### Option A: Vite Image Plugin (EMPFOHLEN)

**Installation:**
```bash
npm install -D vite-imagetools
```

**Konfiguration in `vite.config.js`:**
```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import { imagetools } from 'vite-imagetools';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		imagetools({
			defaultDirectives: (url) => {
				if (url.searchParams.has('responsive')) {
					return new URLSearchParams({
						format: 'webp;jpg',
						quality: '85',
						w: '300;600;1200',
						as: 'picture'
					});
				}
				return new URLSearchParams();
			}
		})
	],
	// ... rest of config
});
```

**Verwendung in Komponenten:**
```svelte
<script>
  import heroImage from '/static/heroSlider/image1.jpg?responsive';
</script>

<picture>
  <source srcset={heroImage.sources.webp} type="image/webp" />
  <source srcset={heroImage.sources.jpg} type="image/jpeg" />
  <img 
    src={heroImage.img.src}
    width={heroImage.img.w}
    height={heroImage.img.h}
    alt="Hero Image"
    loading="lazy"
  />
</picture>
```

### Option B: Build-Zeit Optimierung

**Installation:**
```bash
npm install -D @squoosh/lib
```

**Script erstellen: `scripts/optimize-images.js`:**
```javascript
import { ImagePool } from '@squoosh/lib';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const imagePool = new ImagePool();

async function optimizeImages(folder) {
  const files = await readdir(folder);
  
  for (const file of files) {
    if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;
    
    const filePath = join(folder, file);
    const imageBuffer = await readFile(filePath);
    const image = imagePool.ingestImage(imageBuffer);
    
    await image.encode({
      webp: { quality: 85 },
    });
    
    const { binary } = await image.encodedWith.webp;
    const outputPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    await writeFile(outputPath, binary);
    
    console.log(`✓ Optimized: ${file} → ${file.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`);
  }
  
  await imagePool.close();
}

// Alle Slider-Ordner optimieren
const folders = [
  'static/heroSlider',
  'static/foilSlider',
  'static/blindSlider',
  'static/cutSlider',
  'static/pantoneSlider'
];

for (const folder of folders) {
  await optimizeImages(folder);
}
```

**Package.json Script hinzufügen:**
```json
{
  "scripts": {
    "optimize:images": "node scripts/optimize-images.js",
    "prebuild": "npm run optimize:images"
  }
}
```

## Prioritäten-Reihenfolge

1. **Sofort** (Manuell, 30-60 Minuten):
   - Bilder mit TinyPNG/Squoosh komprimieren
   - Große Bilder auf max. 1200px Breite skalieren
   - WebP-Versionen erstellen

2. **Diese Woche** (Code-Änderungen, 2-3 Stunden):
   - `vite-imagetools` Plugin installieren
   - SimpleImageSlider für responsive Images anpassen
   - Testing auf verschiedenen Geräten

3. **Nächster Sprint** (Infrastruktur, 1 Tag):
   - Build-Script für automatische Bildoptimierung
   - CDN-Integration auf Render.com prüfen
   - Monitoring einrichten

## Erwartete Ergebnisse

**Nach manueller Optimierung:**
- 40-60% kleinere Dateigröße
- 20-30% schnellerer Speed Index

**Nach vollständiger Implementierung:**
- 70-80% kleinere Dateigröße (WebP)
- 40-50% schnellerer Speed Index
- Lighthouse Performance Score: +15-25 Punkte

## Hilfreiche Commands

```bash
# Bildgröße aller JPGs in einem Ordner prüfen
ls -lh static/heroSlider/*.jpg

# Anzahl der Bilder pro Ordner
find static -name "*.jpg" | wc -l

# Gesamtgröße aller Bilder
du -sh static/*/slider/

# Batch-Umbenennung (falls nötig)
# Achtung: Vorher Backup machen!
cd static/heroSlider
for file in *.jpg; do 
  mv "$file" "${file// /_}"
done
```

## Unterstützung

Bei Fragen oder Problemen:
1. Testen Sie die Optimierungen zunächst an 1-2 Bildern
2. Machen Sie ein Backup vor der Batch-Verarbeitung
3. Überprüfen Sie die Bildqualität visuell nach der Konvertierung
4. Lighthouse-Test nach jeder Änderung durchführen
