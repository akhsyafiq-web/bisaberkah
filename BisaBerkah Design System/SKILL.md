---
name: bisaberkah-design
description: Use this skill to generate well-branded interfaces and assets for BisaBerkah, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping. BisaBerkah is a personal & family finance app for modern Gen-Z Indonesian Muslim households — tracking income, expenses, shared goals, and zakat/sadaqah.
user-invocable: true
---

# BisaBerkah Design

Read `README.md` in this skill first — it has the full brand context, content
voice rules, visual foundations, and iconography. Then explore the other files.

## What's here
- `README.md` — context, CONTENT FUNDAMENTALS, VISUAL FOUNDATIONS, ICONOGRAPHY, manifest
- `colors_and_type.css` — the single source of truth for all tokens (color, type, spacing, radius, shadow). Self-hosts Plus Jakarta Sans from `fonts/`.
- `assets/` — logos (wordmark, mark, mono)
- `fonts/` — Plus Jakarta Sans (brand font)
- `preview/` — small specimen cards (colors, type, spacing, components, brand)
- `ui_kits/app/` — mobile finance app (flagship) — React components + interactive index.html
- `ui_kits/web/` — marketing website — React components + index.html

## How to use it
- **Visual artifacts** (slides, mocks, throwaway prototypes): copy the assets and
  `colors_and_type.css` you need into your output folder and build static HTML.
  Reuse the JSX components in `ui_kits/` as references — copy and simplify them.
- **Production code**: read the rules here and treat `colors_and_type.css` as the
  token contract. Components follow Untitled UI (Tailwind v4 + React Aria),
  re-skinned with the BisaBerkah brand.

## Non-negotiables
- Brand jade-green `#07835A` for primary actions; gold `#D6900F` **only** for
  zakat/sadaqah/milestones.
- Plus Jakarta Sans everywhere; Rupiah figures tabular (`Rp1.250.000`), money-in
  green `+`, expenses neutral dark.
- Voice: warm, encouraging, Indonesian-first, informal "kamu", sentence case,
  never shaming. Emoji sparingly and purposefully. See README.
- Icons: Lucide (outline, ~1.67px stroke) — closest match to Untitled UI Icons.

If invoked with no other guidance, ask the user what they want to build, ask a few
focused questions, then act as an expert BisaBerkah designer — output HTML
artifacts or production code depending on the need.
