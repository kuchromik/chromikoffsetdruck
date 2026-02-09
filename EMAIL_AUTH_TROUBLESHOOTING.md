# E-Mail Authentifizierungs-Fehler beheben

## Problem: "Invalid login: 535 Authentication failed"

Dieser Fehler tritt auf, wenn die SMTP-Authentifizierung fehlschlägt. Hier sind die Lösungen:

---

## ✅ Checkliste zur Fehlerbehebung

### 1. **App-spezifische Passwörter verwenden**

Die häufigste Ursache! Gmail, Outlook, Yahoo und viele andere Provider benötigen **App-Passwörter** statt des normalen Login-Passworts.

#### Gmail / Google Workspace:
1. Gehe zu [Google Account Security](https://myaccount.google.com/security)
2. Aktiviere 2-Faktor-Authentifizierung (falls nicht aktiv)
3. Gehe zu "App-Passwörter" (App passwords)
4. Wähle "Mail" und dein Gerät
5. Kopiere das 16-stellige Passwort (Format: `xxxx xxxx xxxx xxxx`)
6. Verwende dieses als `EMAIL_PASS` auf Render.com

#### Outlook.com / Hotmail:
1. Gehe zu [Microsoft Account Security](https://account.microsoft.com/security)
2. Aktiviere 2-Faktor-Authentifizierung
3. Erstelle ein App-Passwort unter "App passwords"
4. Verwende dieses als `EMAIL_PASS`

#### Yahoo Mail:
1. Gehe zu [Yahoo Account Security](https://login.yahoo.com/account/security)
2. Aktiviere 2-Faktor-Authentifizierung
3. Generiere ein App-Passwort
4. Verwende dieses als `EMAIL_PASS`

---

### 2. **Port und Secure-Flag überprüfen**

Die Einstellungen müssen zusammenpassen:

**Port 465** → `EMAIL_SECURE=true` (SSL/TLS)
**Port 587** → `EMAIL_SECURE=false` (STARTTLS)

Falsche Kombination führt zu Authentifizierungsfehlern!

---

### 3. **SMTP-Zugriff beim Provider aktivieren**

Manche Provider blockieren SMTP standardmäßig:
- Prüfe, ob SMTP-Zugriff in deinen E-Mail-Einstellungen aktiviert ist
- Oft unter "Einstellungen" → "Weiterleitungen und POP/IMAP" → "SMTP aktivieren"

---

### 4. **Vollständige E-Mail-Adresse als USER verwenden**

`EMAIL_USER` muss die **komplette E-Mail-Adresse** sein:
- ✅ Richtig: `EMAIL_USER=max@example.com`
- ❌ Falsch: `EMAIL_USER=max`

---

## 📋 Empfohlene Einstellungen nach Provider

### Gmail / Google Workspace
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=deine-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx    # 16-stelliges App-Passwort!
EMAIL_FROM=deine-email@gmail.com
EMAIL_TO=empfaenger@domain.de
```

**Alternativer Port 465:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
```

---

### Outlook.com / Hotmail / Live.com
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=deine-email@outlook.com
EMAIL_PASS=dein-app-passwort       # App-Passwort!
EMAIL_FROM=deine-email@outlook.com
EMAIL_TO=empfaenger@domain.de
```

---

### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=deine-email@yahoo.com
EMAIL_PASS=dein-app-passwort       # App-Passwort!
EMAIL_FROM=deine-email@yahoo.com
EMAIL_TO=empfaenger@domain.de
```

---

### Strato
```env
EMAIL_HOST=smtp.strato.de
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=deine-email@domain.de
EMAIL_PASS=dein-normales-passwort  # Normales Passwort meist ausreichend
EMAIL_FROM=deine-email@domain.de
EMAIL_TO=empfaenger@domain.de
```

---

### 1&1 IONOS
```env
EMAIL_HOST=smtp.ionos.de
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=deine-email@domain.de
EMAIL_PASS=dein-passwort
EMAIL_FROM=deine-email@domain.de
EMAIL_TO=empfaenger@domain.de
```

**✅ Bestätigt funktionsfähig** (Stand: Feb 2026)

---

### T-Online (Deutsche Telekom)
```env
EMAIL_HOST=securesmtp.t-online.de
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=deine-email@t-online.de
EMAIL_PASS=dein-passwort
EMAIL_FROM=deine-email@t-online.de
EMAIL_TO=empfaenger@domain.de
```

**Alternative:**
```env
EMAIL_HOST=smtp.magenta.de
EMAIL_PORT=587
EMAIL_SECURE=false
```

**⚠️ Hinweis:** T-Online kann problematisch sein. Bei Problemen alternative Provider verwenden (z.B. 1&1, Gmail).

---

### ALL-INKL
```env
EMAIL_HOST=smtp.all-inkl.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=deine-email@domain.de
EMAIL_PASS=dein-passwort
EMAIL_FROM=deine-email@domain.de
EMAIL_TO=empfaenger@domain.de
```

---

## 🔧 Umgebungsvariablen auf Render.com setzen

1. Gehe zu [render.com](https://render.com) → Dein Service
2. Klicke auf **Environment** im linken Menü
3. Füge/Bearbeite folgende Variablen:
   - `EMAIL_HOST`
   - `EMAIL_PORT`
   - `EMAIL_SECURE`
   - `EMAIL_USER` (vollständige E-Mail-Adresse!)
   - `EMAIL_PASS` (App-Passwort bei Gmail/Outlook/Yahoo!)
   - `EMAIL_FROM`
   - `EMAIL_TO`
   - `BODY_SIZE_LIMIT` (sollte `20971520` sein für PDF-Uploads)
4. Klicke auf **Save Changes**
5. Warte auf automatisches Redeploy

---

## 🐛 Debug-Tipps

### Logs auf Render prüfen:
1. Gehe zu deinem Service auf Render
2. Klicke auf **Logs**
3. Suche nach "ERROR Send Error:" für Details
4. Debug-Output zeigt Verbindungsdetails

### Lokaler Test:
Teste die Einstellungen lokal mit der `.env` Datei:
```bash
npm run dev
```
Dann teste das Formular auf `http://localhost:5173/fixguenstig`

---

## ❓ Immer noch Probleme?

1. **Doppelcheck:** Nutzt du wirklich ein App-Passwort? (Gmail, Outlook, Yahoo)
2. **Firewall:** Manche Firmen-Netzwerke blockieren SMTP-Ports
3. **Provider-Limits:** Manche Provider limitieren SMTP-Zugriffe pro Tag
4. **2FA:** Ist 2-Faktor-Authentifizierung aktiviert? (erforderlich für App-Passwörter)
5. **Spaces:** Keine Leerzeichen am Anfang/Ende der Umgebungsvariablen
6. **Passwort-Reset:** Versuche, das Passwort/App-Passwort neu zu generieren

---

## 📝 Änderungen in diesem Update

Die Server-Konfiguration wurde verbessert:
- ✅ Explizite TLS-Konfiguration hinzugefügt
- ✅ `requireTLS` für Port 587 (STARTTLS)
- ✅ Bessere Timeout-Einstellungen
- ✅ Verbesserte Fehler-Logs

Diese Änderungen beheben die meisten Authentifizierungsprobleme automatisch, **vorausgesetzt** die Umgebungsvariablen sind korrekt gesetzt.
