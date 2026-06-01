# BisaBerkah — Web UI Kit

High-fidelity recreation of the **BisaBerkah marketing website** (landing page).
React + Babel, styled from `colors_and_type.css`, following **Untitled UI**
marketing section patterns re-skinned for the brand.

> Cosmetic recreation for prototyping — not production code.

## Run it
Open `index.html`. Scroll the page; the header goes transparent → frosted on scroll.

## Sections (top → bottom)
1. **Header** — sticky nav, logo, links, Masuk + Download app.
2. **Hero** — headline, app-store buttons, social proof, floating phone mock that
   reuses the gradient-strip balance card + floating goal/zakat chips.
3. **Metrics** — social-proof number bar.
4. **Features** — 3×2 grid with featured icons (zakat tile uses the gold tone).
5. **ZakatSplit** — dark-brand band highlighting automatic zakat, with a gold card.
6. **Testimonial** — large pull quote.
7. **CTA** — brand band with store buttons.
8. **Footer** — brand-950, link columns, socials, OJK note.

## Files
| File | Contents |
|---|---|
| `index.html` | Loads React/Babel/Lucide + JSX, mounts the page |
| `components.jsx` | `WB` tokens, `WIcon`, `WButton`, `StoreButton`, `FeaturedIcon`, `Header`, `Footer` |
| `sections.jsx` | `Hero` (+`HeroPhone`), `Metrics`, `Features`, `ZakatSplit`, `Testimonial`, `CTA` |
| `app.jsx` | `WebApp` — assembles the page in a scroll container |

## Notes
- **Icons:** Lucide. Lucide dropped its brand/social glyphs (instagram, twitter,
  youtube, etc.), so the footer socials use generic Lucide marks (`camera`,
  `at-sign`, `message-circle`) as **placeholders** — drop in real brand SVGs for
  production. App-store buttons use the generic `apple` / `play` glyphs.
- Tokens (`WB`) mirror `colors_and_type.css`; kept in JS for inline styling.
