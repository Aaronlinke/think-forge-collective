# Think Forge Browser Automation Extension

Diese Chrome/Edge Extension ermöglicht KI-gesteuerte Browser-Automation für Think Forge Collective.

## Installation

### Chrome/Edge
1. Öffne `chrome://extensions/` (Chrome) oder `edge://extensions/` (Edge)
2. Aktiviere den "Entwicklermodus" (oben rechts)
3. Klicke auf "Entpackte Erweiterung laden"
4. Wähle den `public/extension` Ordner aus

### Temporäre Icons
Die Extension benötigt Icons. Erstelle temporär:
- `icon16.png` (16x16px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

Oder verwende diese Base64-Daten als SVG:
```html
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <circle cx="64" cy="64" r="60" fill="#667eea"/>
  <text x="64" y="80" font-size="60" text-anchor="middle" fill="white">🧠</text>
</svg>
```

## Features

### ✅ Implementiert
- WebSocket-Verbindung zur Think Forge App
- Automatische Wiederverbindung
- Screenshot-Capture
- DOM-Manipulation (Click, Type, Scroll)
- Element-Erkennung und Highlighting
- Daten-Extraktion
- Seiten-Navigation

### 🔧 Kommandos

#### Click
```javascript
{
  type: "command",
  action: "click",
  selector: "button.submit", // oder
  coordinates: { x: 100, y: 200 }
}
```

#### Type
```javascript
{
  type: "command",
  action: "type",
  selector: "input[name='email']",
  text: "test@example.com"
}
```

#### Scroll
```javascript
{
  type: "command",
  action: "scroll",
  direction: "down", // oder "up"
  amount: 500 // optional, default: 500
}
```

#### Wait
```javascript
{
  type: "command",
  action: "wait",
  selector: ".loading-spinner",
  waitFor: "disappear", // oder "appear"
  timeout: 10000 // optional, default: 10000ms
}
```

#### Extract Data
```javascript
{
  type: "command",
  action: "extract",
  selector: "article.post"
}
```

#### Navigate
```javascript
{
  type: "command",
  action: "navigate",
  url: "https://example.com"
}
```

## Verwendung

1. **Extension installieren** (siehe oben)
2. **Think Forge App öffnen** → Guided Browser
3. **Extension verbindet automatisch**
4. **Kommandos senden** über die App

## Sicherheit

- ✅ Domain-Whitelist (optional aktivierbar)
- ✅ Action-Confirmation für kritische Aktionen
- ✅ Rate-Limiting (TODO)
- ✅ Logging aller Aktionen

## Troubleshooting

### Extension verbindet nicht
- Prüfe WebSocket-URL in der Extension (Popup öffnen)
- Default: `wss://cyzgmlgbpbcyomlkvrrm.supabase.co/functions/v1/browser-bridge`
- Stelle sicher, dass die Edge Function deployed ist

### Kommandos funktionieren nicht
- Öffne Developer Tools → Console
- Prüfe auf Fehler im Content Script
- Prüfe, ob Element existiert (selector)

### CORS-Fehler
- Manche Seiten blockieren iframes
- Extension funktioniert direkt auf der Seite (kein iframe)

## Development

### Dateien
- `manifest.json` - Extension-Konfiguration
- `background.js` - Service Worker (WebSocket)
- `content.js` - DOM-Manipulation
- `popup.html/js` - Extension-UI

### Debugging
```javascript
// In Content Script
console.log('Think Forge:', ...);

// In Background Script
console.log('Background:', ...);
```

### Testing
1. Lade Extension in Chrome
2. Öffne eine Test-Seite
3. Öffne Extension-Popup
4. Klicke auf "Verbinden"
5. Teste Kommandos über die App

## Roadmap

- [ ] Domain-Whitelist UI
- [ ] Rate-Limiting
- [ ] Action-History
- [ ] Screenshot-Annotation
- [ ] Multi-Tab-Support
- [ ] Firefox-Version

## Support

Bei Problemen öffne ein Issue auf GitHub oder kontaktiere support@thinkforge.dev
