# PDF-Seitenzahl-Erkennung

## Zusammenfassung

Ja, es ist möglich, programmmatisch die Anzahl der Seiten in einer PDF-Datei zu ermitteln und dem Kunden einen Hinweis zu geben, ob die PDF für 1-seitige oder mehrseitige Drucksachen geeignet ist.

## Implementierungsoptionen

### Option 1: pdf-lib (Empfohlen)
Eine leichtgewichtige Library zum Lesen und Bearbeiten von PDFs.

**Installation:**
```bash
npm install pdf-lib
```

**Beispielcode für +page.svelte:**
```javascript
import { PDFDocument } from 'pdf-lib';

async function handleFileChange(event) {
	const files = Array.from(event.target.files || []);
	
	// Validierung: Nur 1 Datei, nur PDFs, max 10MB
	const validFiles = files.filter(file => {
		if (file.type !== 'application/pdf') {
			alert(`"${file.name}" ist keine PDF-Datei und wurde ignoriert.`);
			return false;
		}
		if (file.size > 10 * 1024 * 1024) { // 10MB
			alert(`"${file.name}" ist zu groß (max. 10MB).`);
			return false;
		}
		return true;
	}).slice(0, 1);
	
	if (validFiles.length > 0) {
		const file = validFiles[0];
		
		// PDF-Seitenzahl ermitteln
		try {
			const arrayBuffer = await file.arrayBuffer();
			const pdfDoc = await PDFDocument.load(arrayBuffer);
			const pageCount = pdfDoc.getPageCount();
			
			// Hinweis basierend auf Umfang und Seitenzahl
			let hinweisText = '';
			const ist1Seitig = umfang === '1-seitig';
			
			if (ist1Seitig && pageCount > 1) {
				hinweisText = `⚠️ Hinweis: Ihre PDF hat ${pageCount} Seiten, Sie haben aber "1-seitig" ausgewählt. 
				Für 1-seitige Produkte sollte die PDF nur 1 Seite haben (Vorder- oder Rückseite).`;
				alert(hinweisText);
			} else if (!ist1Seitig && pageCount === 1) {
				hinweisText = `ℹ️ Hinweis: Ihre PDF hat nur 1 Seite. Sie haben "${umfang}" ausgewählt. 
				Für mehrseitige Produkte sollte die PDF mehrere Seiten haben.`;
				alert(hinweisText);
			} else {
				hinweisText = `✓ PDF mit ${pageCount} Seite${pageCount > 1 ? 'n' : ''} hochgeladen - passt zu "${umfang}".`;
				console.log(hinweisText);
			}
			
			// Speichere zusätzliche Info
			pdfDateien = validFiles;
			pdfSeitenInfo = { pageCount, hinweisText };
			
		} catch (error) {
			console.error('Fehler beim Lesen der PDF:', error);
			alert('Die PDF-Datei konnte nicht gelesen werden.');
		}
	} else {
		pdfDateien = validFiles;
	}
}
```

### Option 2: pdfjs-dist
Mozilla's PDF.js Library - robuster, aber größer.

**Installation:**
```bash
npm install pdfjs-dist
```

**Beispielcode:**
```javascript
import * as pdfjsLib from 'pdfjs-dist';

// Workaround für Worker in SvelteKit
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

async function getPdfPageCount(file) {
	const arrayBuffer = await file.arrayBuffer();
	const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
	const pdf = await loadingTask.promise;
	return pdf.numPages;
}
```

## UI-Verbesserung

Nach dem Hochladen der PDF könnte man einen visuellen Hinweis in der UI anzeigen:

```svelte
{#if pdfDateien.length > 0 && pdfSeitenInfo}
	<div style="margin-top: 0.75rem; padding: 0.75rem; background-color: {pdfSeitenInfo.istPassend ? '#d4edda' : '#fff3cd'}; border-radius: 4px; border: 1px solid {pdfSeitenInfo.istPassend ? '#c3e6cb' : '#ffeaa7'};">
		<strong style="font-size: 0.9em;">{pdfSeitenInfo.hinweisText}</strong>
	</div>
{/if}
```

## Empfehlung

1. **Für einfache Seitenzahl-Prüfung:** Verwenden Sie **pdf-lib** (kleiner Bundle-Size)
2. **Für erweiterte PDF-Funktionen:** Verwenden Sie **pdfjs-dist**

## Nächste Schritte

1. Library installieren: `npm install pdf-lib`
2. Import in +page.svelte hinzufügen
3. handleFileChange-Funktion erweitern
4. Optional: State-Variable für Seiteninformationen hinzufügen
5. UI-Feedback für Benutzer implementieren

## Hinweise

- Die PDF-Analyse erfolgt clientseitig im Browser
- Keine Daten werden ohne Zustimmung des Benutzers gesendet
- Die Prüfung ist ein hilfreicher Hinweis, kein Hindernis für die Bestellung
- Benutzer können trotzdem fortfahren, auch wenn die Seitenzahl nicht optimal ist
