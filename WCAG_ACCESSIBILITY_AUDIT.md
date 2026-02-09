# WCAG Accessibility Audit - Chromik Offsetdruck

**Audit-Datum:** 9. Februar 2026  
**WCAG-Version:** 2.1 Level AA  
**Geprüfte Seiten:** Startseite, Fix&günstig, Impressum, Datenschutz

---

## 🔴 Kritische Probleme (Level A)

### 1. **Falsche Spracheinstellung** ⚠️
**WCAG:** 3.1.1 Language of Page (Level A)  
**Problem:** Die HTML-Seite ist auf Englisch (`lang="en"`) eingestellt, obwohl der gesamte Inhalt auf Deutsch ist.

**Datei:** `src/app.html`
```html
<!-- ❌ Aktuell -->
<html lang="en">

<!-- ✅ Sollte sein -->
<html lang="de">
```

---

### 2. **Keine Skip-Navigation** ⚠️
**WCAG:** 2.4.1 Bypass Blocks (Level A)  
**Problem:** Tastaturnutzer müssen durch die gesamte Navigation navigieren, um zum Hauptinhalt zu gelangen.

**Lösung:** Skip-to-Content Link hinzufügen in `src/app.html` oder `src/routes/+layout.svelte`

---

### 3. **Hamburger-Menu-Button ohne zugänglichen Namen** ⚠️
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Problem:** Mobile Menu Toggle hat zwar `aria-label="Toggle menu"`, aber die leeren `<span>` Elemente sind nicht semantisch.

**Datei:** `src/lib/components/Header.svelte`
```svelte
<!-- ✅ Verbesserter Button -->
<button 
	class="menu-toggle" 
	onclick={toggleMobileMenu} 
	aria-label="{mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}"
	aria-expanded="{mobileMenuOpen}"
>
	<span aria-hidden="true"></span>
	<span aria-hidden="true"></span>
	<span aria-hidden="true"></span>
</button>
```

---

### 4. **Formular-Labels fehlen teilweise** ⚠️
**WCAG:** 3.3.2 Labels or Instructions (Level A)  
**Problem:** Im Fix&günstig Formular haben alle Inputs zwar Labels, aber Radio-Buttons und Checkboxen könnten verbessert werden.

**Datei:** `src/routes/fixguenstig/+page.svelte`
```svelte
<!-- ✅ Datenschutz-Checkbox verbessern -->
<div class="form-group">
	<label>
		<input 
			type="checkbox" 
			bind:checked={kundenDaten.datenschutz} 
			required 
			aria-required="true"
		/>
		<span>
			Ich habe die <a href="/datenschutz" target="_blank">Datenschutzerklärung</a> 
			gelesen und akzeptiere sie. *
		</span>
	</label>
</div>
```

---

### 5. **Logo ohne aussagekräftigen Alt-Text** ⚠️
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Problem:** `alt="Logo"` ist nicht aussagekräftig.

**Datei:** `src/lib/components/Header.svelte` und `Footer.svelte`
```svelte
<!-- ❌ Aktuell -->
<img src="/logo.png" alt="Logo" />

<!-- ✅ Sollte sein -->
<img src="/logo.png" alt="Chromik Offsetdruck - Startseite" />
```

---

### 6. **Fehlende Error-Messages bei Formularfehlern** ⚠️
**WCAG:** 3.3.1 Error Identification (Level A)  
**Problem:** Bei invaliden Eingaben gibt es nur Browser-Standard-Validierung, aber keine zugänglichen Fehlermeldungen.

**Lösung:** aria-invalid und aria-describedby für Fehler hinzufügen.

---

## 🟡 Wichtige Probleme (Level AA)

### 7. **Keine Focus-Styles definiert** ⚠️
**WCAG:** 2.4.7 Focus Visible (Level AA)  
**Problem:** Keine ausreichenden Focus-Indikatoren für Tastaturnutzer.

**Datei:** `src/app.css`
```css
/* ✅ Focus-Styles hinzufügen */
*:focus {
	outline: 2px solid #0066cc;
	outline-offset: 2px;
}

*:focus:not(:focus-visible) {
	outline: none;
}

*:focus-visible {
	outline: 2px solid #0066cc;
	outline-offset: 2px;
}

/* Buttons */
button:focus-visible,
a:focus-visible {
	outline: 2px solid #0066cc;
	outline-offset: 2px;
	box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.2);
}
```

---

### 8. **Unzureichende Kontraste möglich** ⚠️
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)  
**Problem:** Die Variablen `--text-secondary: #4a4a4a` auf `--bg-primary: #ffffff` hat ein Kontrastverhältnis von nur 9.4:1, was gut ist. Aber einige graue Texte im Code könnten problematisch sein (z.B. `color: #666`).

**Empfehlung:** Alle Farben mit einem Online-Tool prüfen (mindestens 4.5:1 für normalen Text).

---

### 9. **Live-Regions für dynamische Inhalte fehlen** ⚠️
**WCAG:** 4.1.3 Status Messages (Level AA, WCAG 2.1)  
**Problem:** Preisberechnungen und Bestellstatus werden dynamisch angezeigt, aber Screenreader werden nicht informiert.

**Datei:** `src/routes/fixguenstig/+page.svelte`
```svelte
<!-- ✅ Live-Region für Preisanzeige -->
{#if zeigErgebnis}
	<div class="result-box" role="region" aria-live="polite" aria-label="Preisberechnung">
		{@html ergebnis}
		<!-- ... -->
	</div>
{/if}

<!-- ✅ Live-Region für Bestellstatus -->
{#if bestellStatus === 'success'}
	<div 
		class="success-message" 
		role="alert" 
		aria-live="assertive"
	>
		<h4>✓ Bestellung erfolgreich gesendet!</h4>
		<p>Vielen Dank für Ihre Bestellung...</p>
	</div>
{/if}
```

---

### 10. **Mobile Menu nicht mit Escape schließbar** ⚠️
**WCAG:** 2.1.1 Keyboard (Level A)  
**Problem:** Das mobile Overlay-Menu kann nicht mit ESC-Taste geschlossen werden.

**Lösung:** Keyboard Event Handler hinzufügen.

---

### 11. **Fehlende Landmarks** ⚠️
**WCAG:** Best Practice für Screen Reader  
**Problem:** Keine semantischen HTML5-Landmarks.

**Datei:** `src/routes/+page.svelte`
```svelte
<!-- ✅ Landmarks hinzufügen -->
<div class="page-wrapper">
	<Header />
	
	<main id="main-content" role="main">
		<!-- Content -->
	</main>
	
	<Footer />
</div>
```

---

### 12. **Placeholder als Label-Ersatz** ⚠️
**WCAG:** Best Practice  
**Problem:** Einige Inputs nutzen nur Placeholder ohne sichtbares Label (das ist nicht der Fall, aber placeholder sollte nicht als Primary Label dienen).

**Status:** ✅ Gut - alle Inputs haben echte Labels.

---

### 13. **PDF-Upload ohne Fehlerbehandlung für Screenreader** ⚠️
**WCAG:** 3.3.1 Error Identification  
**Problem:** PDF-Validierungsmeldungen werden mit `alert()` angezeigt, was für Screenreader problematisch ist.

**Lösung:** Inline-Fehlermeldungen statt alerts verwenden.

---

### 14. **Fehlende ARIA-Label für Formulargruppen** ⚠️
**Problem:** Die großen Formular-Abschnitte haben keine Grouping.

```svelte
<!-- ✅ Fieldset für Gruppierung -->
<fieldset>
	<legend>Ihre Kontaktdaten</legend>
	<!-- Formularfelder -->
</fieldset>

<fieldset>
	<legend>Produktkonfiguration</legend>
	<!-- Formularfelder -->
</fieldset>
```

---

## 🟢 Kleinere Verbesserungen

### 15. **Link zum Datenschutz öffnet im neuen Tab ohne Warnung**
```svelte
<!-- ✅ Externe Links kennzeichnen -->
<a href="/datenschutz" target="_blank" rel="noopener noreferrer">
	Datenschutzerklärung
	<span class="sr-only">(öffnet in neuem Tab)</span>
</a>
```

CSS für `.sr-only`:
```css
/* Screen reader only */
.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border-width: 0;
}
```

---

### 16. **Image Slider ohne Pause-Button**
**WCAG:** 2.2.2 Pause, Stop, Hide (Level A) - nur für automatisch bewegende Inhalte >5 Sekunden

**Problem:** Der SimpleImageSlider wechselt alle 4 Sekunden, was unter 5 Sekunden liegt, aber ein Pause-Button wäre benutzerfreundlich.

---

### 17. **Heading-Hierarchie**
**WCAG:** Best Practice  
**Status:** ✅ Zu prüfen - Sicherstellen, dass h1 → h2 → h3 in korrekter Reihenfolge verwendet wird.

---

## 📊 Zusammenfassung

| Kategorie | Anzahl | Priorität |
|-----------|--------|-----------|
| Kritisch (Level A) | 6 | 🔴 Hoch |
| Wichtig (Level AA) | 9 | 🟡 Mittel |
| Verbesserungen | 3 | 🟢 Niedrig |

---

## ✅ Was gut läuft

1. ✅ Alle Formular-Inputs haben Labels
2. ✅ Semantisches HTML wird größtenteils verwendet
3. ✅ Buttons haben Text oder aria-label
4. ✅ Bilder haben alt-Attribute
5. ✅ Responsive Design funktioniert gut
6. ✅ Kein auto-playing audio/video

---

## 🎯 Empfohlene Umsetzungsreihenfolge

### Phase 1 - Quick Wins (1-2 Stunden)
1. Sprache auf Deutsch ändern (`lang="de"`)
2. Focus-Styles hinzufügen
3. Logo Alt-Text verbessern
4. aria-expanded für Menu-Button

### Phase 2 - Formular-Verbesserungen (2-3 Stunden)
5. Live-Regions hinzufügen
6. Fehlerbehandlung verbessern (statt alerts)
7. Fieldsets für Formulargruppen
8. aria-invalid für fehlerhafte Felder

### Phase 3 - Navigation & Struktur (2-3 Stunden)
9. Skip-Navigation hinzufügen
10. Landmarks definieren (main, nav, etc.)
11. ESC-Key für Mobile Menu
12. Heading-Hierarchie prüfen

### Phase 4 - Feinschliff (1-2 Stunden)
13. Kontraste testen und anpassen
14. Screen-reader-only Texte
15. Externe Link-Warnungen

---

## 🔧 Testing-Tools

- **axe DevTools** (Browser Extension)
- **WAVE** (Web Accessibility Evaluation Tool)
- **Lighthouse** (in Chrome DevTools)
- **NVDA/JAWS** (Screen Reader Testing)
- **Tastatur-only Navigation** (Tab, Enter, ESC, Pfeiltasten)

---

## 📚 Ressourcen

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN ARIA Practices](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
