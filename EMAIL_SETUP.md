# E-Mail-Konfiguration für Bestellformular

## Übersicht

Das Bestellformular auf `/fixguenstig` sammelt Kundendaten und Bestellinformationen. Diese Daten müssen per E-Mail an Sie versendet werden.

## Optionen für den E-Mail-Versand

### Option 1: Nodemailer (Empfohlen für Produktion)

**Vorteile:**
- Professionell und zuverlässig
- Keine externen Services nötig
- Volle Kontrolle

**Installation:**
```bash
npm install nodemailer
```

**Konfiguration:**
Öffnen Sie `src/routes/api/send-order/+server.js` und:
1. Entfernen Sie die Kommentare (`/*` und `*/`) um den Nodemailer-Block
2. Passen Sie die SMTP-Einstellungen an Ihren E-Mail-Provider an:

```javascript
const transporter = nodemailer.createTransport({
	host: 'smtp.ihr-provider.de',  // z.B. smtp.strato.de
	port: 465,
	secure: true,
	auth: {
		user: 'ihre-email@domain.de',
		pass: 'ihr-passwort'
	}
});
```

**Gängige Provider-Einstellungen:**

**Strato:**
- Host: `smtp.strato.de`
- Port: `465` (SSL) oder `587` (TLS)

**1&1 IONOS:**
- Host: `smtp.ionos.de`
- Port: `465` (SSL) oder `587` (TLS)

**Gmail (für Tests, nicht für Produktion empfohlen):**
- Host: `smtp.gmail.com`
- Port: `465`
- Hinweis: Sie müssen "App-Passwörter" in Ihrem Google-Konto einrichten

### Option 2: Externer E-Mail-Service

Services wie **SendGrid**, **Mailgun**, oder **AWS SES** bieten zuverlässige E-Mail-Dienste:

**SendGrid Beispiel:**
```bash
npm install @sendgrid/mail
```

```javascript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
	to: 'ihre-email@domain.de',
	from: 'noreply@ihre-domain.de',
	subject: 'Neue Bestellung',
	text: emailText
});
```

### Option 3: Datenbank-Speicherung

Alternativ können Sie Bestellungen in einer Datenbank speichern und später abrufen:

```javascript
// Beispiel mit einer Datenbank
await db.insert({
	table: 'orders',
	data: data
});
```

## Umgebungsvariablen

Erstellen Sie eine `.env` Datei im Projekt-Root:

```env
EMAIL_HOST=smtp.ihr-provider.de
EMAIL_PORT=465
EMAIL_USER=ihre-email@domain.de
EMAIL_PASS=ihr-passwort
EMAIL_TO=empfaenger@domain.de
```

Verwenden Sie diese in der API-Route:
```javascript
const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: Number(process.env.EMAIL_PORT),
	secure: true,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS
	}
});
```

**Wichtig:** Fügen Sie `.env` zu Ihrer `.gitignore` hinzu!

## Test

Nach der Konfiguration:
1. Starten Sie den Dev-Server: `npm run dev`
2. Öffnen Sie `/fixguenstig`
3. Füllen Sie das Formular aus
4. Klicken Sie auf "Auftrag erteilen" und "Verbindlich bestellen"
5. Überprüfen Sie Ihr E-Mail-Postfach

## Troubleshooting

**Problem:** "SMTP-Verbindung fehlgeschlagen"
- Überprüfen Sie Host und Port
- Prüfen Sie Firewall-Einstellungen
- Kontaktieren Sie Ihren E-Mail-Provider

**Problem:** "Authentifizierung fehlgeschlagen"
- Überprüfen Sie Benutzername und Passwort
- Bei Gmail: Aktivieren Sie "Weniger sichere Apps" oder verwenden Sie App-Passwörter

**Problem:** E-Mails landen im Spam
- Konfigurieren Sie SPF, DKIM und DMARC für Ihre Domain
- Verwenden Sie eine verifizierte Absenderadresse

## Sicherheitshinweise

1. **Niemals** E-Mail-Passwörter im Code speichern
2. Verwenden Sie Umgebungsvariablen
3. Aktivieren Sie Rate-Limiting für die API
4. Validieren Sie alle Eingaben serverseitig
5. Verwenden Sie HTTPS in Produktion

## Weitere Verbesserungen

- **Bestätigungs-E-Mail an Kunden:** Senden Sie eine Kopie an die Kunden-E-Mail
- **PDF-Anhang:** Generieren Sie ein PDF der Bestellung
- **Admin-Dashboard:** Erstellen Sie eine Übersicht aller Bestellungen
- **Datenbank-Logging:** Speichern Sie alle Bestellungen zur Nachverfolgung
