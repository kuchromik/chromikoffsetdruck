# Firebase-Integration Anleitung

Diese Anwendung nutzt Firebase Firestore zur Speicherung von bestätigten Bestellungen als "Jobs".

## 1. Firebase-Projekt einrichten

1. Gehen Sie zur [Firebase Console](https://console.firebase.google.com/)
2. Wählen Sie Ihr bestehendes Projekt aus
3. Navigieren Sie zu **Project Settings** (Zahnrad-Symbol oben links)
4. Wechseln Sie zum Tab **Service Accounts**

## 2. Service Account Key generieren

1. Klicken Sie auf **Generate new private key**
2. Bestätigen Sie mit **Generate Key**
3. Eine JSON-Datei wird heruntergeladen

## 3. Umgebungsvariablen in .env eintragen

Öffnen Sie die heruntergeladene JSON-Datei und kopieren Sie die Werte in Ihre `.env` Datei:

```env
FIREBASE_PROJECT_ID=ihr-projekt-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ihr-projekt.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...IHR KEY...\n-----END PRIVATE KEY-----\n"
```

**Wichtig:** 
- Der `FIREBASE_PRIVATE_KEY` muss in Anführungszeichen stehen
- Die `\n` Zeichen für Zeilenumbrüche müssen erhalten bleiben
- Der Key beginnt mit `-----BEGIN PRIVATE KEY-----` und endet mit `-----END PRIVATE KEY-----`

## 4. Firestore Database einrichten

1. In der Firebase Console: Navigieren Sie zu **Firestore Database**
2. Falls noch nicht vorhanden: Klicken Sie auf **Create database**
3. Wählen Sie **Start in production mode** (Sicherheitsregeln können später angepasst werden)
4. Wählen Sie eine Region (z.B. `europe-west3` für Frankfurt)

### Collection erstellen

Die Collection `Jobs` wird automatisch beim ersten Speichern erstellt. Falls Sie sie manuell anlegen möchten:

1. Klicken Sie auf **Start collection**
2. Collection ID: `Jobs`
3. Fügen Sie ein Test-Dokument hinzu (kann später gelöscht werden)

## 5. Firestore Sicherheitsregeln

Für die Produktion sollten Sie folgende Regeln setzen:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Nur Server-seitige Authentifizierung erlauben
    match /Jobs/{jobId} {
      // Kein öffentlicher Zugriff - nur über Firebase Admin SDK
      allow read, write: if false;
    }
  }
}
```

Diese Regeln stellen sicher, dass nur Ihr Server (über den Service Account) auf die Daten zugreifen kann.

## 6. Installation der Dependencies

Nach dem Einrichten der Firebase-Credentials:

```bash
npm install
```

Dies installiert das `firebase-admin` Paket.

## 7. Datenstruktur der Jobs

Jeder Job in Firestore hat folgende Struktur:

```javascript
{
  jobname: "Mein Auftrag",              // Auftragsname (string)
  amount: 37.50,                         // Gesamtpreis netto (number)
  customer: "Firma XYZ Mustermann Max",  // Kundenname (string)
  details: "Visitenkarten 8,5 x 5,5 cm, Senator glatt 308 g/m², 2-seitig", // Produktzusammenfassung (string)
  quantity: 500,                         // Auflage (number)
  producer: "doe",                       // Produktionsart: "doe" = Digitaldruck (string)
  
  // Status-Felder (boolean)
  archiv: false,          // true wenn Auftrag erledigt
  invoice_ready: false,   // true wenn Rechnung geschrieben
  paper_ready: false,     // true wenn Material da
  print_ready: false,     // true wenn Druck fertig
  shipped_ready: false,   // true wenn versendet
  
  // FixGuenstig-Markierung
  FixGuenstig: true,      // immer true (boolean)
  
  // Timestamp
  jobstart: 1708765800 // Unix timestamp in Sekunden (number)
}
```

## 8. Testen

Nach dem Deployment bzw. im Development-Modus:

1. Erstellen Sie eine Testbestellung über `/fixguenstig`
2. Bestätigen Sie die Bestellung per E-Mail-Link
3. Überprüfen Sie in der Firebase Console unter **Firestore Database**, ob der Job angelegt wurde

## 9. Logs überprüfen

Bei erfolgreicher Speicherung sehen Sie in den Server-Logs:

```
✓ Bestellung erfolgreich per E-Mail versendet an: ...
✓ Bestätigungsmail an Kunden gesendet: ...
✓ Job erfolgreich in Firebase gespeichert. Job-ID: abc123xyz
```

Bei Fehlern:

```
✗ Fehler beim Speichern in Firebase: [Fehlermeldung]
```

## 10. Fehlerbehandlung

Falls Firebase-Credentials fehlen oder falsch sind, wird die Speicherung übersprungen, aber die E-Mails werden trotzdem versendet. Überprüfen Sie die Server-Logs für Fehlermeldungen.

## Erweiterung für Extraladen

Die Firebase-Integration ist vorbereitet für die spätere Erweiterung der `/extraladen` Route. Die gleiche Logik kann dort implementiert werden, sobald die Route fertig ist.
