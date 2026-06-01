/* global React, BB, Icon, Button, BalanceCard, TxRow, GoalCard, SectionHead */
// BisaBerkah App UI kit — screens

const SAMPLE_TX = [
  { id: 1, emoji: '🍜', name: 'Warung Tegal', cat: 'Makan', time: 'Hari ini, 12:30', amount: '−Rp28.000', kind: 'out' },
  { id: 2, emoji: '🚌', name: 'TransJakarta', cat: 'Transport', time: 'Hari ini, 08:10', amount: '−Rp3.500', kind: 'transport' },
  { id: 3, emoji: '💼', name: 'Gaji Mei', cat: 'Pemasukan', time: '25 Mei', amount: '+Rp8.500.000', kind: 'in' },
  { id: 4, emoji: '🤲', name: 'Zakat penghasilan', cat: 'Zakat', time: '25 Mei', amount: 'Rp212.500', kind: 'zakat' },
  { id: 5, emoji: '🛒', name: 'Superindo', cat: 'Belanja', time: '24 Mei', amount: '−Rp342.000', kind: 'out' },
  { id: 6, emoji: '☕', name: 'Kopi Kenangan', cat: 'Makan', time: '24 Mei', amount: '−Rp22.000', kind: 'out' },
];
const GOALS = [
  { emoji: '🕋', name: 'Umrah 2026', sub: 'Target Desember', pct: 68, now: 'Rp34jt', target: 'Rp50jt' },
  { emoji: '🏍️', name: 'DP Motor', sub: 'Target Agustus', pct: 45, now: 'Rp4,5jt', target: 'Rp10jt' },
  { emoji: '🛟', name: 'Dana darurat', sub: '6× pengeluaran', pct: 82, now: 'Rp24,6jt', target: 'Rp30jt' },
];

function Greeting() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 42, height: 42, borderRadius: 999, background: BB.brand100, color: BB.brand700, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 16 }}>RP</div>
        <div><div style={{ fontSize: 13, color: BB.g500 }}>Assalamualaikum,</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: BB.g900 }}>Rara &amp; Pram</div></div>
      </div>
      <button style={{ width: 40, height: 40, borderRadius: 999, border: `1px solid ${BB.g200}`, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', position: 'relative' }}>
        <Icon name="bell" size={20} color={BB.g600} />
        <span style={{ position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 999, background: BB.gold500, border: '1.5px solid #fff' }} />
      </button>
    </div>
  );
}

function HomeScreen({ txs, go }) {
  return (
    <div style={{ padding: '0 18px 110px' }}>
      <Greeting />
      <BalanceCard />
      <div style={{ marginTop: 22 }}>
        <SectionHead title="Tujuan kita" action="Lihat semua" onAction={() => go('goals')} />
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -18px', padding: '0 18px 4px' }}>
          {GOALS.slice(0, 2).map((g, i) => <GoalCard key={i} goal={g} />)}
        </div>
      </div>
      {/* Zakat nudge */}
      <div style={{ marginTop: 22, background: BB.gold50, border: `1px solid ${BB.gold100}`, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name="hand-coins" size={24} color={BB.gold600} /></div>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 15, color: BB.g900 }}>Zakat penghasilan Mei</div>
          <div style={{ fontSize: 13, color: BB.gold700 }}>Tersisihkan otomatis · Rp212.500</div></div>
        <Button variant="gold" size="sm" onClick={() => go('zakat')}>Bayar</Button>
      </div>
      <div style={{ marginTop: 24 }}>
        <SectionHead title="Transaksi terakhir" action="Lihat semua" onAction={() => go('tx')} />
        <div>{txs.slice(0, 5).map((t, i, a) => <TxRow key={t.id} tx={t} last={i === a.length - 1} />)}</div>
      </div>
    </div>
  );
}

function ReportScreen({ txs }) {
  const [filter, setFilter] = React.useState('Semua');
  const chips = ['Semua', 'Pengeluaran', 'Pemasukan', 'Zakat'];
  const match = (t) => filter === 'Semua' || (filter === 'Pengeluaran' && (t.kind === 'out' || t.kind === 'transport')) || (filter === 'Pemasukan' && t.kind === 'in') || (filter === 'Zakat' && t.kind === 'zakat');
  return (
    <div style={{ padding: '0 18px 110px' }}>
      <h2 style={{ fontFamily: BB.font, fontSize: 24, fontWeight: 700, color: BB.g900, margin: '4px 0 16px', letterSpacing: '-.01em' }}>Laporan</h2>
      {/* month summary */}
      <div style={{ background: '#fff', border: `1px solid ${BB.g200}`, borderRadius: 16, boxShadow: '0 1px 3px rgba(16,24,40,.1)', padding: 18, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontWeight: 700, color: BB.g900 }}>Mei 2026</span>
          <span style={{ fontSize: 13, color: BB.brand700, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>Bulan ini <Icon name="chevron-down" size={16} /></span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, background: BB.success50, borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, color: BB.success700 }}>Pemasukan</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: BB.success700, fontVariantNumeric: 'tabular-nums' }}>Rp8,5jt</div></div>
          <div style={{ flex: 1, background: BB.g50, borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, color: BB.g600 }}>Pengeluaran</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: BB.g900, fontVariantNumeric: 'tabular-nums' }}>Rp3,4jt</div></div>
        </div>
        {/* mini bar chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, height: 64, marginTop: 16 }}>
          {[40, 62, 35, 70, 52, 80, 46].map((h, i) => (
            <div key={i} style={{ flex: 1, height: h + '%', borderRadius: 5, background: i === 5 ? BB.brand600 : BB.brand100 }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: BB.g400, marginTop: 6 }}>
          {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((d, i) => <span key={i}>{d}</span>)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 8, margin: '0 -18px 8px', padding: '0 18px' }}>
        {chips.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{ flex: 'none', fontFamily: BB.font, fontWeight: 600, fontSize: 13, padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
            border: `1px solid ${filter === c ? BB.brand600 : BB.g200}`, background: filter === c ? BB.brand50 : '#fff', color: filter === c ? BB.brand700 : BB.g600 }}>{c}</button>
        ))}
      </div>
      <div>{txs.filter(match).map((t, i, a) => <TxRow key={t.id} tx={t} last={i === a.length - 1} />)}</div>
    </div>
  );
}

function GoalsScreen() {
  return (
    <div style={{ padding: '0 18px 110px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0 16px' }}>
        <h2 style={{ fontFamily: BB.font, fontSize: 24, fontWeight: 700, color: BB.g900, margin: 0, letterSpacing: '-.01em' }}>Tujuan kita</h2>
        <Button variant="secondary" size="sm" icon="plus">Buat</Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {GOALS.map((g, i) => (
          <div key={i}>
            <GoalCard goal={g} wide />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: BB.g500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Icon name="users" size={16} color={BB.g400} /> Ditabung bareng keluarga
      </div>
    </div>
  );
}

function ZakatScreen({ txs }) {
  const zk = txs.filter(t => t.kind === 'zakat');
  return (
    <div style={{ padding: '0 18px 110px' }}>
      <h2 style={{ fontFamily: BB.font, fontSize: 24, fontWeight: 700, color: BB.g900, margin: '4px 0 16px', letterSpacing: '-.01em' }}>Zakat &amp; Sedekah</h2>
      {/* zakat hero */}
      <div style={{ borderRadius: 20, padding: 20, background: `linear-gradient(135deg,${BB.gold500},${BB.gold600})`, color: '#fff', boxShadow: '0 12px 24px -6px rgba(214,144,15,.4)' }}>
        <div style={{ fontSize: 13, opacity: .9, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><Icon name="hand-coins" size={18} color="#fff" /> Zakat penghasilan Mei</div>
        <div style={{ fontWeight: 800, fontSize: 30, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em', marginTop: 6 }}>Rp212.500</div>
        <div style={{ fontSize: 12, opacity: .9, marginTop: 2 }}>2,5% dari penghasilan Rp8.500.000</div>
        <div style={{ marginTop: 16 }}><Button variant="secondary" full style={{ background: '#fff', color: BB.gold700, border: 0 }}>Bayar zakat sekarang</Button></div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
        {[{ e: '🤲', t: 'Sedekah' }, { e: '🍚', t: 'Infak' }, { e: '🕌', t: 'Wakaf' }].map((x, i) => (
          <div key={i} style={{ flex: 1, background: '#fff', border: `1px solid ${BB.g200}`, borderRadius: 14, padding: '14px 8px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: 22 }}>{x.e}</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: BB.g700, marginTop: 4 }}>{x.t}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <SectionHead title="Riwayat" />
        {zk.length ? zk.map((t, i, a) => <TxRow key={t.id} tx={t} last={i === a.length - 1} />) :
          <div style={{ color: BB.g500, fontSize: 14 }}>Belum ada catatan.</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderTop: `1px solid ${BB.g100}` }}>
          <div style={{ width: 42, height: 42, borderRadius: 999, background: BB.gold50, display: 'grid', placeItems: 'center', fontSize: 19 }}>🤲</div>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 15, color: BB.g900 }}>Sedekah Jumat</div>
            <div style={{ fontSize: 13, color: BB.g500 }}>Sedekah · 23 Mei</div></div>
          <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 15, color: BB.gold600 }}>Rp50.000</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, ReportScreen, GoalsScreen, ZakatScreen, SAMPLE_TX, GOALS, Greeting });
