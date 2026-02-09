# Render Deployment Anleitung

## Umgebungsvariablen auf Render.com setzen

Damit PDF-Uploads bis 20 MB funktionieren, muss in Render.com die folgende Umgebungsvariable gesetzt werden:

### In Render Dashboard:

1. Gehe zu deinem Service auf [render.com](https://render.com)
2. Klicke auf **Environment** im linken Menü
3. Füge folgende Umgebungsvariable hinzu:

```
BODY_SIZE_LIMIT=20971520
```

4. Klicke auf **Save Changes**
5. Der Service wird automatisch neu deployed

### Bereits gesetzte Variablen:

Stelle sicher, dass auch die Email-Variablen gesetzt sind:
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_SECURE`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_TO`
- `EMAIL_FROM`

## Wichtig:

Die `BODY_SIZE_LIMIT` Variable ist erforderlich für `@sveltejs/adapter-node`, um größere Request Bodies zu akzeptieren. Der Standardwert ist nur 512 KB (524288 bytes).
