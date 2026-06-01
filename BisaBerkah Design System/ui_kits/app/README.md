# BisaBerkah — App UI Kit

High-fidelity, interactive recreation of the **BisaBerkah mobile finance app**
(the flagship product). Built with React + Babel (in-browser) and styled from
`colors_and_type.css`. Components follow the **Untitled UI** structure, re-skinned
with the BisaBerkah brand; the dashboard balance card recreates Untitled UI's
`<CreditCard type="gradient-strip" />`.

> This is a cosmetic recreation for prototyping — not production code. State is
> in-memory and resets on reload.

## Run it
Open `index.html`. It renders a 390×800 phone with four tabs plus an add-transaction sheet.

## Interactions
- **Bottom tab bar** — switch between Beranda, Laporan, Tujuan, Zakat.
- **Center FAB (+)** — opens the *Tambah transaksi* bottom sheet. Toggle
  Pengeluaran/Pemasukan, type an amount (auto-formats to Rp1.250.000), pick a
  category; income shows a *Sisihkan zakat 2,5%* toggle. **Simpan** prepends the
  transaction to the lists and returns home.
- **Laporan** — month summary, mini bar chart, filter chips (live filtering).
- **"Lihat semua" / "Bayar"** links jump between tabs.

## Files
| File | Contents |
|---|---|
| `index.html` | Loads React/Babel/Lucide + the JSX, mounts the phone |
| `components.jsx` | `BB` tokens, `Icon`, `Button`, `BalanceCard`, `TxRow`, `GoalCard`, `SectionHead`, `BottomNav` |
| `screens.jsx` | `HomeScreen`, `ReportScreen`, `GoalsScreen`, `ZakatScreen`, `Greeting` + sample data |
| `app.jsx` | `App` shell (phone frame, status bar, tab state), `AddSheet`, `StatusBar` |

## Notes
- **Icons:** Lucide via CDN (substitute for Untitled UI Icons). `<Icon name="…" />`
  resolves any Lucide glyph; sized in px via the `size` prop.
- **Money rules:** money-in green `+`, expenses neutral dark, zakat gold — see the
  README *Content Fundamentals*.
- Components export to `window` so each `<script>` shares scope (Babel isolates files).
