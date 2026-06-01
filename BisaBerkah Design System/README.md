# BisaBerkah — Design System

> Catat berkah, raih tujuan. — *Track your blessings, reach your goals.*

BisaBerkah is a personal-and-family finance app for modern, Gen-Z Indonesian
Muslim households. It tracks **expenses, income, and shared financial goals**,
and — uniquely — treats **zakat, infak, and sadaqah (alms)** as first-class
money flows, not an afterthought. The product reframes budgeting around
*keberkahan* (blessing/barakah): money is something you grow, share, and feel
good about, together as a family.

**Audience:** newly-married couples, young families, first-jobbers building
their first real budget. Optimistic, mobile-first, community-minded, faith-aware
but never preachy.

**Surfaces represented in this system**
1. **App** (`ui_kits/app/`) — the mobile finance app: dashboard, transactions, goals, and the zakat & sadaqah tracker. *This is the flagship product.*
2. **Web** (`ui_kits/web/`) — the marketing/landing site that explains the product and drives app installs.

---

## Sources & provenance

This system was built from a **written product brief** (no codebase or Figma was
attached). The component foundation follows **Untitled UI React**
(https://www.untitledui.com/react/components) — Tailwind v4 + React Aria — as
specified in the brief, re-skinned with the BisaBerkah brand. The dashboard
balance card recreates Untitled UI's **CreditCard** shared asset in its
`gradient-strip` variant (`@/components/shared-assets/credit-card/credit-card`,
`<CreditCard type="gradient-strip" />`).

If you have access to the real BisaBerkah codebase or Figma file, link them here
so future work can reference the source of truth instead of this reconstruction.

**Substitutions (please confirm / replace):**
- **Fonts**: **Plus Jakarta Sans** is now **self-hosted** from `fonts/` (variable
  TTF, weights 200–800, wired via `@font-face` in `colors_and_type.css`). **JetBrains
  Mono** (mono/code) is still loaded from Google Fonts CDN — no local files were
  supplied for it, and CDN delivery is fine.
- **Icons** use **Lucide** (CDN). Untitled UI ships its own icon set
  (`@untitled-ui/icons-react`); Lucide is the closest open match (identical
  ~1.67px rounded stroke). Swap to the real set if licensed. See *Iconography*.
- **Logo** (`assets/logo-*.svg`) was designed fresh for this system since none
  was provided. Replace with the official mark if one exists.
- **Photography/illustration**: no brand imagery was supplied. UI kits use
  neutral placeholders. Provide real assets to finalize.

---

## Index — what's in this folder

| Path | What it is |
|---|---|
| `README.md` | This file — context, content & visual rules, iconography, manifest |
| `SKILL.md` | Agent Skill entry point (for use in Claude Code) |
| `colors_and_type.css` | **Source of truth** for all color + type + spacing + shadow tokens |
| `assets/` | Logos (mark, wordmark, mono) and brand visual assets |
| `fonts/` | Plus Jakarta Sans (self-hosted brand font, variable TTF) |
| `preview/` | Small HTML specimen cards that populate the Design System tab |
| `ui_kits/app/` | Mobile finance-app UI kit — `index.html` + JSX components + README |
| `ui_kits/web/` | Marketing-site UI kit — `index.html` + JSX components + README |

> No slide template was provided, so `slides/` is intentionally omitted.

---

## CONTENT FUNDAMENTALS

The voice is a **warm, encouraging friend who's good with money** — never a bank,
never a lecture. Bilingual reality: the product is **Indonesian-first** with
casual English mixed in the way Gen-Z Indonesians actually text.

**Tone & vibe**
- Optimistic and supportive. Celebrate progress, never shame overspending.
  Expenses are shown in neutral dark, *not* alarmist red.
- Faith-aware, inclusive, gentle. Zakat/sadaqah framed as joyful, not obligatory guilt.
- Light, human, a little playful — but always clear about the numbers.

**Person & address**
- Speak to the user as **"kamu"** (informal *you*), never the formal "Anda".
- The app refers to itself rarely; when it does, it's a companion ("Yuk, kita…" / "Let's…").
- Family features use **"kita"** (inclusive *we*) — shared goals, shared wins.

**Casing & punctuation**
- **Sentence case everywhere** — buttons, headers, titles. Never Title Case, never ALL CAPS (except the tiny tracked `.eyebrow` label).
- Minimal punctuation. Short sentences. Occasional friendly exclamation, used sparingly.

**Numbers & currency**
- Rupiah, formatted with dots as thousands separators: **Rp1.250.000**. No space after `Rp`.
- Big balances may abbreviate: **Rp12,5jt** (juta) / **Rp1,2M** (miliar) in tight spaces. Comma is the decimal separator (Indonesian convention).
- Always tabular figures (`.amount`). Money-in is green with a `+`, money-out is neutral dark.

**Emoji**
- Used **sparingly and purposefully** — a single emoji to add warmth to an empty
  state, a milestone celebration, or a goal name the user typed. Never decorative
  rows of emoji, never inside dense data. Default to Lucide icons over emoji in chrome.

**Examples (do)**
- `Selamat! Tujuan "Umrah 2026" tercapai 🎉` — *Congrats! Goal "Umrah 2026" reached*
- `Kamu hemat 12% bulan ini dibanding April.` — *You saved 12% more than April.*
- `Sisihkan zakat dari pemasukan ini?` — *Set aside zakat from this income?*
- `Yuk mulai catat pengeluaran pertamamu.` — *Let's log your first expense.*
- Buttons: `Tambah transaksi`, `Buat tujuan`, `Bayar zakat`, `Lihat semua`

**Examples (don't)**
- ❌ `PERINGATAN: Anda telah melampaui anggaran!` (shouty, formal, shaming)
- ❌ `Add Your First Transaction Now!!!` (Title Case, English-only, hype)
- ❌ Red expense numbers everywhere (anxiety-inducing)

---

## VISUAL FOUNDATIONS

**Overall feel.** Clean, airy, trustworthy fintech with a hopeful, organic warmth.
Untitled UI's disciplined structure (generous whitespace, soft elevation, crisp
gray neutrals) carries the data; the **jade-green brand** and **gold zakat accent**
carry the emotion. Light mode is the default and primary theme.

**Color.**
- **Brand — Berkah Green** (`--brand-600 #07835A`, jade/emerald). Primary actions,
  active states, the balance card, brand fills. Growth, money, blessing.
- **Accent — Barakah Gold** (`--gold-500 #D6900F`). *Strictly* reserved for
  zakat / infak / sadaqah and milestone celebrations — it should feel special.
  Never use gold as a generic accent.
- **Neutrals** — the Untitled UI cool-gray ramp. Text `--gray-900`, body `--gray-700`,
  metadata `--gray-500`, borders `--gray-200`, app canvas `--gray-50`.
- **Semantics** — success green (distinct from brand, used for money-in & positive
  deltas), error red (validation only), warning amber, info blue.
- Roughly **60% neutral / 30% brand / 10% accent**. Color is earned, not sprayed.

**Typography.** Plus Jakarta Sans throughout (geometric, rounded, friendly,
Jakarta-born). Weights 400/500/600/700/800. Headings are bold (700) with tight
negative tracking (`-0.02em`); balances use 800 + `tabular-nums`. Body is 400 at
16px / 1.55. One tracked uppercase `.eyebrow` for overlines. JetBrains Mono only
for code/IDs.

**Spacing & layout.** 4px base grid (`--space-*`). Mobile gutters 16–20px; cards
breathe with 20–24px padding. Web sections use generous 80–96px vertical rhythm
on a 1280px max content width. Bottom tab bar on mobile (fixed), sticky transparent→
solid header on web.

**Corner radii.** Friendly and rounded, never sharp. Inputs/buttons `8px`
(`--radius-md`), cards `12–16px`, the hero **balance card `24px`** (`--radius-3xl`),
pills/avatars/tags fully round. Rounding scales up with surface size.

**Cards.** White surface, `1px var(--border-secondary)` hairline border,
`--radius-xl/2xl`, `--shadow-sm` at rest. No heavy borders, no colored left-border
stripes. Cards lift to `--shadow-md` on hover (web) or stay flat (mobile).

**Elevation / shadows.** Soft, low-opacity, layered (Untitled UI). `xs` for
inputs/chips, `sm` for resting cards, `md` on hover, `lg/xl` for sheets, modals,
and floating action buttons. The balance card gets a **brand-tinted glow**
(`--shadow-brand`). No hard or pure-black shadows.

**Backgrounds.** Predominantly flat white / `--gray-50` canvas. Gradients are
**rare and meaningful**: the jade balance card (the `gradient-strip` credit-card
motif — a solid jade field with a lighter diagonal sheen strip) and the web hero
wash. No noisy textures, no purple gradients, no glassmorphism by default. A subtle
`backdrop-blur` is allowed only on the sticky web header and the mobile sheet scrim.

**Imagery.** When photos are used: warm, candid, real Indonesian families and
everyday moments — natural light, slightly warm white balance, never stocky or
corporate. Product spots may use the jade/gold palette. (No brand imagery supplied
yet — placeholders in kits.)

**Borders.** Hairline `1px` `--gray-200` default; `--gray-300` for inputs and
emphasized dividers; `--brand-300` on focused/active brand elements. Focus rings:
`4px` brand at ~24% opacity (`0 0 0 4px rgba(7,131,90,0.24)`).

**Motion.** Quick and gentle — `150–250ms`, ease-out (`cubic-bezier(.4,0,.2,1)`).
Fades + small transl(8–12px) for sheets and lists; a soft scale/spring only for
celebrations (goal reached, zakat paid — a brief confetti/pop). No long, bouncy, or
attention-seeking animations in everyday chrome.

**Interaction states.**
- **Hover:** brand fills darken one step (`600→700`); ghost/secondary get a
  `--gray-50/100` tint. ~150ms.
- **Press:** darken another step (`700→800`) **and** scale to `0.98`. Tactile.
- **Focus-visible:** 4px brand focus ring (above).
- **Disabled:** `--gray-100` fill, `--text-disabled` text, no shadow, `not-allowed`.
- **Selected (tabs/nav):** brand text + `--brand-50` pill background.

**Transparency & blur.** Used purposefully: sticky header goes from transparent to
`rgba(255,255,255,0.8)` + `backdrop-blur(12px)` on scroll; modal scrims are
`rgba(12,17,29,0.5)`. Otherwise surfaces are solid.

---

## ICONOGRAPHY

- **Set:** **Lucide** (https://lucide.dev), loaded from CDN
  (`https://unpkg.com/lucide@latest`). It is the closest open-source match to
  **Untitled UI Icons** (the system's canonical set) — same outline style, rounded
  joins, ~1.67px stroke on a 24px grid. **This is a flagged substitution**; swap to
  `@untitled-ui/icons-react` if you have it.
- **Style:** outline/stroke only (never filled glyphs for UI chrome), `1.67–2px`
  stroke, `currentColor` so icons inherit text color. Default sizes **20px**
  (inline/buttons) and **24px** (nav/standalone). Use `--gray-500` for resting
  chrome icons, brand for active.
- **No icon font.** Icons are inline SVG via Lucide. Don't hand-draw new icons —
  pick the nearest Lucide glyph.
- **Common glyphs:** `wallet`, `arrow-up-right` / `arrow-down-left` (money flow),
  `target` (goals), `hand-coins` / `heart-handshake` (zakat & sadaqah),
  `trending-up`, `plus`, `home`, `chart-pie`, `users` (family), `bell`, `settings`.
- **Featured icons:** for empty states / feature highlights, use Untitled UI's
  "featured icon" pattern — a Lucide glyph centered in a `--brand-50` rounded-square
  (or `--gold-50` for zakat) with brand-colored stroke.
- **Emoji** are content, not iconography — see *Content Fundamentals*. **Unicode
  symbols are not used as icons.**

---

*See `colors_and_type.css` for every token, and the `preview/` cards (rendered in
the Design System tab) for live specimens.*
