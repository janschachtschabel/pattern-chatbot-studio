# 🐦 Birdpattern Studio

Visueller Editor für alle Konfigurationselemente des **Birdpattern Chatbots**. Patterns, Personas, States, Signals und Intents können komfortabel bearbeitet, visualisiert und als TypeScript-Dateien exportiert werden.

---

## Was ist Birdpattern Studio?

Das Studio ist ein eigenständiges **Next.js-Frontend ohne Backend** – alle Daten liegen im Browser (`localStorage`). Es dient als Editor für die Kern-Konfiguration des Birdpattern Chatbots und ersetzt das direkte Bearbeiten der TypeScript-Dateien in `src/lib/`.

```
Birdpattern Studio          Birdpattern Chatbot
─────────────────           ───────────────────
Bearbeiten & Visualisieren  →  Export (.ts)  →  src/lib/ ablegen → neu bauen
```

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 18 + TailwindCSS + Lucide Icons
- **Persistenz:** `localStorage` (key: `birdpattern-studio-v1`)
- **Port:** `3334`
- **Keine API-Routen** – rein client-seitig

---

## Schnellstart

```bash
cd birdpattern-studio
npm install
npm run dev   # → http://localhost:3334
```

Keine Umgebungsvariablen erforderlich.

---

## Projektstruktur

```
birdpattern-studio/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Haupt-UI (Tabs, Liste, Edit-Panel)
│   │   ├── layout.tsx        # Root Layout
│   │   └── globals.css       # TailwindCSS Basis
│   ├── components/
│   │   ├── TagInput.tsx             # Wiederverwendbarer Tag-Editor
│   │   ├── GraphView.tsx            # 🕸️  Graph-Visualisierung
│   │   ├── HeatmapView.tsx          # 🔥  Coverage Heatmaps
│   │   ├── PersonaView.tsx          # 👁️  Persona-Profil-Ansicht
│   │   └── forms/
│   │       ├── PatternForm.tsx
│   │       ├── PersonaForm.tsx
│   │       ├── StateForm.tsx
│   │       ├── SignalForm.tsx
│   │       └── IntentForm.tsx
│   └── lib/
│       ├── types.ts          # Studio-Interfaces (StudioPattern, …)
│       ├── defaultData.ts    # DEFAULT_CONFIG mit allen 18 Patterns etc.
│       └── exportUtils.ts    # buildExportFiles() → .ts Quelltexte
```

---

## Entity-Typen

| Typ | Anzahl | Beschreibung |
|-----|--------|-------------|
| **Patterns** | 18 | Antwort-Strategien mit triggerPersonas, triggerSignals, triggerStates, triggerIntents |
| **Personas** | 7 | Nutzerprofile mit Erkennungsmerkmalen und Tonalität |
| **States** | 11 | Konversations-Zustände in 3 Clustern (A: Orientierung, B: Aktion, C: Abschluss) |
| **Signals** | 17 | Verhaltenssignale in 4 Dimensionen |
| **Intents** | 10 | Nutzungsabsichten (Suche, Information, Onboarding, …) |

---

## Editor-Ansichten

### 📝 Listen-Editor (Standard)
Für jeden Entity-Typ: durchsuchbare Liste + Detailformular als stabile rechte Seitenleiste. Funktionen:
- **Neu** – neuen Eintrag anlegen (mit generierter ID)
- **Bearbeiten** – alle Felder bearbeiten, Arrays als Tag-Inputs
- **Löschen** – mit Bestätigung
- **Zurücksetzen** – alle Änderungen verwerfen, Default-Config laden

### 🕸️ Graph
Zoombare (Mausrad), verschiebbare (Drag) Knotenansicht aller Entitäten in 5 Spalten:

```
[Personas] → [Signals] → [Patterns] → [States]
                                     → [Intents]
```

- **Klick auf ein Pattern** → alle direkt verbundenen Knoten leuchten auf, Rest dimmt
- **Klick auf Persona/Signal/State/Intent** → nur die direkt verbundenen Pattern-Kanten
- Reset-Button oben rechts

### 🔥 Heatmap
Zwei Modi wählbar:

| Modus | Zeilen | Spalten | Zelle |
|-------|--------|---------|-------|
| **State × Intent** | 11 States | 10 Intents | Matching Patterns für gewählte Persona |
| **Signal × Persona** | 17 Signals | 7 Personas | Matching Patterns |

Farbintensität = Anzahl treffender Patterns. Hover zeigt Pattern-Details.

### 👁️ Profil
Persona-Tabs oben, dann 3-spaltig:
- **Links:** Persona-Karte mit Coverage-Balken (Patterns/States/Intents), Erkennungsmerkmale, typische Signale
- **Mitte:** Alle verfügbaren Patterns nach Konversations-Cluster gruppiert (A/B/C)
- **Rechts:** Alle States + Intents (aktive leuchten, inaktive sind ausgeblendet)

---

## Export-Workflow

1. Im Studio Änderungen vornehmen
2. **„Exportieren"** in der Sidebar öffnet das Export-Modal
3. Für jede Datei: Preview anzeigen, in Zwischenablage kopieren oder einzeln downloaden
4. **„Alle 5 herunterladen"** lädt alle Dateien auf einmal

Erzeugte Dateien:

| Datei | Ziel in Birdpattern |
|-------|---------------------|
| `patterns.ts` | `src/lib/patterns.ts` |
| `personas.ts` | `src/lib/personas.ts` |
| `states.ts` | `src/lib/states.ts` |
| `signals.ts` | `src/lib/signals.ts` |
| `intents.ts` | `src/lib/intents.ts` |

5. Dateien im Birdpattern-Projekt ablegen
6. `npm run dev` (oder `npm run build`) im Birdpattern-Projekt neu starten

---

## Datenpersistenz

Alle Änderungen werden automatisch in `localStorage` gespeichert (Key: `birdpattern-studio-v1`). Nach einem Browser-Refresh bleiben sie erhalten.

**Zurücksetzen** auf die eingebaute Default-Config (Stand des letzten Code-Commits) über den Button in der Sidebar.

---

## Pattern-Struktur (Referenz)

```typescript
interface StudioPattern {
  id: string;              // z.B. "PAT-01"
  label: string;           // z.B. "Direkt-Antwort"
  coreRule: string;        // Anweisung für das LLM
  length: string;          // "kurz" | "mittel" | "normal" | "bullet-liste"
  tone: string;            // Tonalitäts-Hinweis
  styleNotes: string;      // Formatierungs-Hinweise
  triggerPersonas: string[];  // z.B. ["P-LK", "P-SL"]
  triggerSignals: string[];   // z.B. ["unter-zeitdruck"]
  triggerStates: string[];    // z.B. ["state-1", "state-2"]
  triggerIntents: string[];   // z.B. ["INT-W-01"]
}
```

---

## Vercel Deployment

Das Studio kann als statische Next.js-App deployed werden – keine Server-Funktionen benötigt.

```bash
npm run build
vercel --prod
```
