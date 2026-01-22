# Waste Collection Card

Eine schöne Lovelace-Karte für Müllabfuhr-Termine mit Animationen.

![Preview](preview.png)

## Features

- Automatische Erkennung der Müllarten (Restmüll, Bio, Gelbe Tonne, Papier)
- Farbige Hintergründe je nach Dringlichkeit
- Animationen wenn Abholung bevorsteht:
  - **Heute**: Pulsieren + Wackeln + Glow
  - **Morgen**: Wackeln + leichter Glow
  - **In 2-3 Tagen**: Leichtes Wackeln
- Badges für Heute (rot) und Morgen (orange)
- Konfigurierbar über UI
- Responsive Design

## Installation

### HACS (empfohlen)

1. HACS öffnen
2. "Frontend" auswählen
3. Drei-Punkte-Menü → "Benutzerdefinierte Repositories"
4. URL: `https://github.com/hoizi89/hacs_waste_card`
5. Kategorie: **"Lovelace"**
6. Installieren
7. **Browser Cache leeren** (Strg+F5)

### Manuell

1. `dist/waste-collection-card.js` nach `www/community/` kopieren
2. In `configuration.yaml`:
   ```yaml
   lovelace:
     resources:
       - url: /local/community/waste-collection-card.js
         type: module
   ```

## Verwendung

### Einfach (mit Kirchham Integration)

```yaml
type: custom:waste-collection-card
entity_prefix: sensor.mullabfuhr_kirchham_
```

### Mit Titel

```yaml
type: custom:waste-collection-card
title: Müllabfuhr
entity_prefix: sensor.mullabfuhr_kirchham_
columns: 2
```

### Manuelle Entity-Konfiguration

```yaml
type: custom:waste-collection-card
title: Müllabfuhr
columns: 2
entities:
  - entity: sensor.abfallrestmuell
    type: restmuell
  - entity: sensor.abfallbiotonne
    type: bio
  - entity: sensor.abfallgelbetonne
    type: gelb
  - entity: sensor.abfallpapiertonne
    type: papier
```

## Optionen

| Option | Typ | Standard | Beschreibung |
|--------|-----|----------|--------------|
| `entity_prefix` | string | - | Prefix für automatische Entity-Erkennung |
| `entities` | list | - | Manuelle Entity-Liste (überschreibt prefix) |
| `title` | string | "Müllabfuhr" | Kartentitel |
| `show_title` | boolean | true | Titel anzeigen |
| `columns` | number | 2 | Anzahl Spalten (1, 2 oder 4) |

## Entity Types

| Type | Icon | Farbe |
|------|------|-------|
| `restmuell` | mdi:trash-can-outline | Grau |
| `bio` | mdi:leaf | Grün |
| `gelb` | mdi:bottle-soda | Gelb |
| `papier` | mdi:newspaper-variant-outline | Blau |

## Zusammen mit Kirchham Integration

Diese Karte funktioniert perfekt mit der [Kirchham Müllabfuhr Integration](https://github.com/hoizi89/hacs_kirchham_waste).

## Lizenz

MIT License
