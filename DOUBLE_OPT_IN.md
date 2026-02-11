# Double-Opt-In E-Mail-Verifizierung

## Übersicht

Dieses Projekt verwendet jetzt ein **Double-Opt-In-Verfahren** für Bestellungen, um sicherzustellen, dass nur Personen, die tatsächlich Zugriff auf eine E-Mail-Adresse haben, Bestellungen in deren Namen aufgeben können.

## Wie funktioniert es?

### 1. Benutzer gibt Bestellung auf

Der Benutzer füllt das Bestellformular auf `/fixguenstig` aus und klickt auf "Bestellung absenden".

### 2. Bestellung wird temporär gespeichert

- Die Bestelldaten werden **nicht sofort** verarbeitet
- Stattdessen werden sie zusammen mit einem eindeutigen Token in `pending-orders.json` gespeichert
- Das Token ist **24 Stunden gültig**

### 3. Verifizierungs-E-Mail wird versendet

- An die angegebene E-Mail-Adresse wird eine Verifizierungs-Mail gesendet
- Diese enthält einen Bestätigungslink mit dem Token
- Format: `https://ihre-domain.de/bestellung/bestaetigen?token=ABC123...`

### 4. Benutzer bestätigt per Klick

- Der Benutzer klickt auf den Link in der E-Mail
- Er wird zur Bestätigungsseite (`/bestellung/bestaetigen`) weitergeleitet
- Das System validiert den Token

### 5. Bestellung wird verarbeitet

**Erst nach erfolgreicher Token-Validierung:**
- Werden die Bestätigungs-E-Mails an Betreiber und Kunde versendet
- Wird die Bestellung aus dem temporären Speicher entfernt
- Erhält der Kunde die detaillierte Auftragsbestätigung

## Technische Implementierung

### Neue Dateien

1. **`src/lib/pendingOrders.js`**
   - Utility-Funktionen für temporären Bestellspeicher
   - Token-Generierung mit `crypto.randomBytes()`
   - Speicherung in JSON-Datei
   - Automatische Bereinigung abgelaufener Bestellungen

2. **`src/routes/api/send-verification/+server.js`**
   - Empfängt Bestelldaten vom Frontend
   - Generiert Token und speichert Bestellung temporär
   - Versendet Verifizierungs-E-Mail mit Bestätigungslink

3. **`src/routes/api/confirm-order/+server.js`**
   - Wird aufgerufen, wenn Benutzer auf Bestätigungslink klickt
   - Validiert Token und prüft Gültigkeit (24h)
   - Versendet die eigentlichen Bestätigungs-E-Mails
   - Löscht Bestellung aus temporärem Speicher

4. **`src/routes/bestellung/bestaetigen/+page.svelte`**
   - Bestätigungsseite mit Token-Extraktion aus URL
   - Visuelles Feedback (Loading, Success, Error)
   - Benutzerfreundliche Fehlermeldungen

### Geänderte Dateien

1. **`src/routes/fixguenstig/+page.svelte`**
   - API-Route geändert: `/api/send-order` → `/api/send-verification`
   - Erfolgsmeldung angepasst: Hinweis auf E-Mail-Bestätigung

2. **`.env.example`**
   - Neue Variable: `PUBLIC_BASE_URL` (für Bestätigungslinks)

## Umgebungsvariablen

Fügen Sie zu Ihrer `.env`-Datei hinzu:

```env
PUBLIC_BASE_URL=http://localhost:5173  # Entwicklung
# oder
PUBLIC_BASE_URL=https://ihre-domain.de  # Produktion
```

Diese Variable wird benötigt, um den korrekten Bestätigungslink in der E-Mail zu generieren.

## Datenspeicherung

Ausstehende Bestellungen werden in `pending-orders.json` im Projekt-Root gespeichert:

```json
{
  "abc123token...": {
    "data": { /* Bestelldaten */ },
    "attachments": [ /* PDF-Anhänge als Base64 */ ],
    "timestamp": "2026-02-10T10:30:00.000Z",
    "expiresAt": "2026-02-11T10:30:00.000Z"
  }
}
```

**Wichtig:** 
- Diese Datei enthält temporäre Daten und sollte **nicht** ins Git-Repository committed werden
- Fügen Sie `pending-orders.json` zu `.gitignore` hinzu
- Abgelaufene Bestellungen (>24h) werden automatisch bereinigt

## Sicherheitsaspekte

### ✅ Vorteile

1. **E-Mail-Verifizierung**: Nur wer Zugriff auf die E-Mail-Adresse hat, kann Bestellungen bestätigen
2. **Spam-Schutz**: Verhindert, dass beliebige Personen ungewollte E-Mails an Dritte auslösen
3. **Token-Sicherheit**: 256-Bit kryptographisch sichere Zufallstokens
4. **Zeitbegrenzung**: Tokens laufen nach 24 Stunden automatisch ab
5. **Datenschutz**: DSGVO-konform durch explizite Bestätigung

### ⚡ Performance-Optimierungen

1. **Asynchroner E-Mail-Versand**: Die Bestätigungsseite antwortet sofort, ohne auf den E-Mail-Versand zu warten
2. **Keine DEBUG-Logs**: Nodemailer-Debug-Modus ist deaktiviert für schnellere Verarbeitung
3. **Fire-and-Forget**: E-Mails werden im Hintergrund versendet, auch bei großen PDF-Anhängen
4. **Sofortige Bestätigung**: Benutzer sieht Erfolgsbestätigung innerhalb von Sekunden, unabhängig von der Anhang-Größe

### ⚠️ Hinweise

1. **Dateispeicher**: Für größere Systeme sollte JSON durch eine Datenbank (SQLite, PostgreSQL) ersetzt werden
2. **Cleanup**: Die Funktion `cleanupExpiredOrders()` wird bei jeder Bestätigung ausgeführt. Für hohe Last sollte ein Cronjob eingerichtet werden
3. **PDF-Größe**: Anhänge werden in Base64 kodiert gespeichert (~33% größer). Achten Sie auf ausreichend Speicherplatz
4. **Asynchroner Versand**: E-Mails werden im Hintergrund versendet. Der Benutzer erhält die Bestätigung sofort, auch wenn die E-Mails noch nicht vollständig versendet sind. Bei E-Mail-Problemen wird der Benutzer nicht benachrichtigt (nur Server-Logs)

## Testen

### Entwicklung

1. Starten Sie den Dev-Server: `npm run dev`
2. Öffnen Sie `http://localhost:5173/fixguenstig`
3. Geben Sie eine **echte E-Mail-Adresse** ein, auf die Sie Zugriff haben
4. Prüfen Sie Ihr E-Mail-Postfach auf die Verifizierungs-Mail
5. Klicken Sie auf den Bestätigungslink
6. Prüfen Sie, ob die Auftragsbestätigung eintrifft

### Logs

Die folgenden Logs helfen beim Debugging:

```
✓ Ausstehende Bestellung gespeichert mit Token: abc123...
✓ Verifizierungs-Mail gesendet an: kunde@example.com
✓ Token: abc123...
✓ Bestellung erfolgreich per E-Mail versendet an: betreiber@example.com
✓ Bestätigungsmail an Kunden gesendet: kunde@example.com
✓ Ausstehende Bestellung gelöscht: abc123...
```

## Migration von altem System

Das alte System (`/api/send-order`) ist noch vorhanden, wird aber nicht mehr verwendet. Sie können es entfernen oder als Fallback behalten.

**Empfehlung**: Entfernen Sie `/api/send-order`, nachdem Sie das neue System getestet haben.

## FAQ

**Q: Was passiert, wenn der Benutzer den Link nicht anklickt?**  
A: Die Bestellung wird nach 24 Stunden automatisch aus dem Speicher gelöscht. Der Betreiber erhält keine E-Mail.

**Q: Kann der Benutzer den Link mehrmals anklicken?**  
A: Nein, nach erfolgreicher Bestätigung wird der Token gelöscht. Ein zweiter Klick führt zu einer Fehlermeldung.

**Q: Was passiert bei Server-Neustart?**  
A: Die `pending-orders.json`-Datei bleibt erhalten, alle ausstehenden Bestellungen bleiben verfügbar.

**Q: Wie lange dauert es, bis die E-Mail ankommt?**  
A: Das hängt vom E-Mail-Provider ab. In der Regel sollte die E-Mail innerhalb von 1-2 Minuten eintreffen.

**Q: Der Bestätigungslink funktioniert nicht**  
A: Prüfen Sie, ob `PUBLIC_BASE_URL` in der `.env` korrekt gesetzt ist.

**Q: Die Bestätigung dauert sehr lange**  
A: Das System wurde optimiert - die Bestätigung erfolgt jetzt sofort. E-Mails werden asynchron im Hintergrund versendet. Bei großen PDF-Anhängen kann der Versand aber dennoch einige Sekunden dauern (Sie sehen dies nur in den Server-Logs).

**Q: Kann ich sehen, ob die E-Mails erfolgreich versendet wurden?**  
A: Ja, prüfen Sie die Server-Logs. Dort finden Sie Meldungen wie:
- `✓ Bestellung erfolgreich per E-Mail versendet an: ...`
- `✓ Bestätigungsmail an Kunden gesendet: ...`
- Bei Fehlern: `✗ Fehler beim Versenden der E-Mails (asynchron): ...`

## Support

Bei Fragen oder Problemen:
- Prüfen Sie die Server-Logs auf Fehlermeldungen
- Stellen Sie sicher, dass alle Umgebungsvariablen gesetzt sind
- Testen Sie die E-Mail-Konfiguration separat
