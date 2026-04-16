# Sweep Step

A mobile-first PWA for people in 12-step recovery. Inclusive, non-traditional, dark wellness aesthetic. LGBTQ+ representation woven naturally throughout. No frameworks — vanilla HTML, CSS, JavaScript.

## Tech Stack

- Vanilla HTML/CSS/JS — no build step, no frameworks
- localStorage for all data — no backend, no accounts
- PWA: manifest.json + service-worker.js for offline + home screen install
- Google Fonts: Inter (body) + Cinzel (headings)
- Google Sheets public URL import for phone list

## File Structure

```
/index.html           — SPA shell, all screens as sections
/manifest.json        — PWA manifest
/service-worker.js    — Cache-first offline strategy
/css/style.css        — Full dark theme, Pip CSS animations, 1900+ lines
/js/storage.js        — localStorage abstraction
/js/quotes.js         — 35 daily quotes, 12 steps/traditions/concepts rotation
/js/pip.js            — Pip character scoring, stages, rendering
/js/inventory.js      — 4th Step resentment inventory (4 columns)
/js/fears.js          — Fear inventory with chaining
/js/sex-inventory.js  — Relationship/sex inventory
/js/steps.js          — 12 Step progress tracker
/js/community.js      — Phone list, Google Sheets import, meeting log
/js/me.js             — Settings, milestones, gratitude, export/import
/js/app.js            — Router, nav, modal, harms aggregation, boot
/icons/               — PWA icons (192, 512)
```

## localStorage Keys

All prefixed `sweepstep_`: inventory, fears, sex, harms, steps, meetings, contacts, gratitude, settings, pip.

## Key Decisions

- **Pip** is the companion character, built entirely in CSS. 4 growth stages based on score. Gender-fluid, no face that reads as gendered.
- **Higher Power** language: user chooses their own HP name in Settings, used throughout via `Storage.getSettings().hpName`.
- **Gender-neutral language** everywhere. "Sponsor or support person", "partner or person", never gendered assumptions.
- **Dark mode only**. Accent color switchable: violet (default), teal, gold.
- **Inventory** follows Big Book Awakening 4th Step guide: 4 columns (person, causes, 7 areas of self with fears, my part), plus fear chaining and harms aggregation.
- **Export/Import** as JSON backup — user's only backup option.

## Voice

Direct. Warm. Not soft. Not clinical. Never assumes gender, faith, or relationship structure.
