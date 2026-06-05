# ARISE v3 — Finale Test-Checkliste

Build: `npm run build` ✅  
Tests: `npm test` — 154/154 ✅

---

## Manuelle Checkliste (in App testen)

### Daily/Weekly Reset
- [ ] Heute einige Quests abschließen
- [ ] Datum-Override testen (System-Datum vorwärts stellen)
- [ ] Daily Quests am nächsten Tag zurückgesetzt
- [ ] Weekly Quests nach Wochenwechsel zurückgesetzt
- [ ] Streak steigt bei täglicher Aktivität

### Quest Generator
- [ ] Keine Interessen → 6 Starter-Quests aus verschiedenen Domains
- [ ] Interessen auswählen → passende Quests erscheinen
- [ ] Goal erstellen → Goal-Badge auf passenden Quests
- [ ] Filter „goal-linked" → nur passende Quests sichtbar
- [ ] Recovery-Quest bei vernachlässigter Recovery-Domain

### Goals
- [ ] Neues Ziel aus Template erstellen
- [ ] Quest abschließen → Fortschrittsbalken steigt
- [ ] Goal auf 100% → Notification + XP-Bonus
- [ ] Zweite Quest-Completion → Kein zweiter Goal-Reward

### Progress Logs
- [ ] Quest abschließen → Log-Modal erscheint
- [ ] Metriken eintragen → gespeichert
- [ ] SKIP → kein Log
- [ ] Gleiche Quest nochmal → kein zweiter XP-Bonus

### Gates
- [ ] Gate I für aktiven Pfad sichtbar
- [ ] Gate II gesperrt (🔒 Tier-Badge)
- [ ] Gate I alle Steps abhaken → Claim-Button erscheint
- [ ] Gate-Claim → XP + Titel vergeben
- [ ] Zweiter Claim → blockiert

### Weekly Review
- [ ] 📋 Review-Tab → Wochenstatistik sichtbar
- [ ] Review schreiben → Bonus XP
- [ ] Zweites Review gleiche Woche → blockiert

### System Analysis
- [ ] Profile-Tab → SYSTEM ANALYSIS Card
- [ ] Rank-Phase-Badge (BEGINNER/INTERMEDIATE...)
- [ ] Dominante Pfade sichtbar
- [ ] Balance-Hinweis bei vernachlässigter Domain
- [ ] Aktives Ziel-Widget bei gesetzten Goals

### Demo-Profile (System-Tab)
- [ ] 🧪 TEST-PROFILE aufklappen
- [ ] Scholar/Engineer laden → Quests sind mind/craft-focussiert
- [ ] Fighter laden → Quests sind body/recovery-focussiert
- [ ] Guardian/Monk laden → Quests sind recovery/home-focussiert

### Import/Export
- [ ] Export → .json Datei heruntergeladen
- [ ] Import → State wiederhergestellt
- [ ] Alle Daten korrekt (XP, Rank, Quests, Goals, Titles)

### Custom Quests
- [ ] Custom Quest erstellen (Daily, Normal)
- [ ] XP-Bounds werden angezeigt
- [ ] Quest abschließen → als done markiert
- [ ] Gleiche Custom Quest heute nochmal → blockiert

---

## Top 10 Stärken

1. **Breite Domain-Abdeckung** — 12 Domains, 54 Interessen, 12 Paths
2. **Zielorientierte Quests** — Goals zahlen auf Quests ein, automatischer Fortschritt
3. **Stabiler Reset** — ISO-Wochennummern, Edge-Cases getestet
4. **Anti-Exploit** — 7 Systeme, alle getestet
5. **Quest Rotation** — deterministisch stabil, täglich anders
6. **System Analysis** — lokal, adaptiv, Goal-Fokus
7. **Gate-System** — 37 Gates × 3 Tiers, Tier-Abhängigkeiten
8. **Progress Logs** — domain-spezifische Metriken, anti-farmbar
9. **Weekly Review** — automatisch aggregiert, 1x/Woche Anti-Spam
10. **Testabdeckung** — 154 Tests, alle grün

## Top 10 Offene Schwächen / v4-Roadmap

1. **App.jsx noch 2000 Zeilen** — vollständige Feature-Komponenten mit React Context wären ideal
2. **Quest-Generator domain-Balance** — `strength`-Dailies (20) überwiegen historisch; neue Domains unterrepräsentiert in alten Ranks
3. **Keine Push-Notifications** für Daily-Reset-Erinnerung (PWA-Feature)
4. **Keine Offline-Sync-Strategie** — Daten nur lokal, kein optionaler Cloud-Backup
5. **Body-View nicht in Navigation** — Körper-Tracking ist versteckt (war in altem Nav)
6. **Stats-View fehlt in Navigation** — Stat-Detail ist noch da aber nicht direkt erreichbar
7. **Shadow-Unlock-Logik** unvollständig — `canUnlockShadow()` prüft nur Affinities, nicht Gates/Goals/Rank
8. **Kein Streak-Recovery-Quest** — wenn Streak bricht, gibt es keine sanfte Wiedereinstiegs-Quest
9. **Goal-Deadline-Alert** fehlt — kein visueller Hinweis wenn Deadline sich nähert
10. **Weekly Review in System Analysis** — Review-Erkenntnisse fließen noch nicht in Quest-Empfehlungen ein

## v4-Roadmap (Priorisierung)

### Kurzfristig (nächste 3 Prompts)
- React Context für State-Sharing → App.jsx auf <500 Zeilen
- Shadow-Unlock vollständig (Gates + Goals + Rank)
- Body/Stats wieder in Navigation

### Mittelfristig
- Push-Notifications (Web Push API)
- Streak-Recovery-System
- Goal-Deadline-Visualisierung

### Langfristig
- Optionaler Cloud-Sync (Ende-zu-Ende verschlüsselt)
- Community-Quest-Templates
- KI-gestützte Quest-Personalisierung (Opt-in)

---

Build: ✅ | Tests: 154/154 ✅ | PWA: ✅ | Import/Export: ✅
