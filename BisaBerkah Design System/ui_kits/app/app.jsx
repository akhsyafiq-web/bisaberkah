/* global React, ReactDOM, BB, Icon, Button, HomeScreen, ReportScreen, GoalsScreen, ZakatScreen, SAMPLE_TX, BottomNav */
// BisaBerkah App UI kit — shell

const CATS = [
  { e: '🍜', t: 'Makan' }, { e: '🚌', t: 'Transport' }, { e: '🛒', t: 'Belanja' },
  { e: '🏠', t: 'Rumah' }, { e: '💸', t: 'Tagihan' }, { e: '🎬', t: 'Hiburan' },
];

function AddSheet({ open, onClose, onSave }) {
  const [type, setType] = React.useState('out');
  const [amount, setAmount] = React.useState('');
  const [cat, setCat] = React.useState('Makan');
  const [zakat, setZakat] = React.useState(true);
  const fmt = (v) => v.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const save = () => {
    const catObj = CATS.find(c => c.t === cat) || CATS[0];
    onSave({
      id: Date.now(), emoji: type === 'in' ? '💼' : catObj.e,
      name: type === 'in' ? 'Pemasukan' : cat, cat: type === 'in' ? 'Pemasukan' : cat, time: 'Baru saja',
      amount: (type === 'in' ? '+Rp' : '−Rp') + (amount || '0'), kind: type,
    });
    setAmount(''); onClose();
  };
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, pointerEvents: open ? 'auto' : 'none' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(12,17,29,.5)', opacity: open ? 1 : 0, transition: 'opacity .25s' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fff', borderRadius: '24px 24px 0 0', padding: '10px 18px 26px',
        transform: open ? 'translateY(0)' : 'translateY(100%)', transition: 'transform .28s cubic-bezier(.4,0,.2,1)', boxShadow: '0 -8px 30px rgba(16,24,40,.18)' }}>
        <div style={{ width: 40, height: 5, borderRadius: 99, background: BB.g200, margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: BB.font, fontSize: 18, fontWeight: 700, color: BB.g900 }}>Tambah transaksi</h3>
          <button onClick={onClose} style={{ border: 0, background: BB.g100, width: 30, height: 30, borderRadius: 999, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Icon name="x" size={18} color={BB.g600} /></button>
        </div>
        {/* segmented */}
        <div style={{ display: 'flex', background: BB.g100, borderRadius: 10, padding: 3, marginBottom: 18 }}>
          {[{ id: 'out', l: 'Pengeluaran' }, { id: 'in', l: 'Pemasukan' }].map(s => (
            <button key={s.id} onClick={() => setType(s.id)} style={{ flex: 1, border: 0, cursor: 'pointer', fontFamily: BB.font, fontWeight: 600, fontSize: 14, padding: '8px 0', borderRadius: 8,
              background: type === s.id ? '#fff' : 'transparent', color: type === s.id ? BB.g900 : BB.g500, boxShadow: type === s.id ? '0 1px 2px rgba(16,24,40,.1)' : 'none' }}>{s.l}</button>
          ))}
        </div>
        {/* amount */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: BB.g400 }}>Rp</span>
            <input value={amount} onChange={e => setAmount(fmt(e.target.value))} placeholder="0" inputMode="numeric"
              style={{ border: 0, outline: 0, fontFamily: BB.font, fontWeight: 800, fontSize: 40, letterSpacing: '-.02em', color: BB.g900, width: 200, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }} />
          </div>
        </div>
        {/* categories */}
        {type === 'out' && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {CATS.map(c => (
              <button key={c.t} onClick={() => setCat(c.t)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: BB.font, fontWeight: 600, fontSize: 13, padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
                border: `1px solid ${cat === c.t ? BB.brand600 : BB.g200}`, background: cat === c.t ? BB.brand50 : '#fff', color: cat === c.t ? BB.brand700 : BB.g600 }}>
                <span>{c.e}</span>{c.t}</button>
            ))}
          </div>
        )}
        {/* zakat toggle on income */}
        {type === 'in' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: BB.gold50, border: `1px solid ${BB.gold100}`, borderRadius: 12, padding: '12px 14px', marginBottom: 18 }}>
            <Icon name="hand-coins" size={22} color={BB.gold600} />
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14, color: BB.g900 }}>Sisihkan zakat 2,5%?</div>
              <div style={{ fontSize: 12, color: BB.gold700 }}>Otomatis dihitung dari pemasukan</div></div>
            <button onClick={() => setZakat(z => !z)} style={{ width: 44, height: 26, borderRadius: 99, border: 0, cursor: 'pointer', background: zakat ? BB.gold500 : BB.g300, position: 'relative', transition: 'background .2s' }}>
              <span style={{ position: 'absolute', top: 3, left: zakat ? 21 : 3, width: 20, height: 20, borderRadius: 99, background: '#fff', transition: 'left .2s' }} />
            </button>
          </div>
        )}
        <Button full size="lg" onClick={save}>Simpan</Button>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flex: 'none' }}>
      <span style={{ fontFamily: BB.font, fontWeight: 700, fontSize: 15, color: BB.g900 }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: BB.g900 }}>
        <Icon name="signal" size={16} /><Icon name="wifi" size={16} /><Icon name="battery-full" size={18} />
      </div>
    </div>
  );
}

function App() {
  const [tab, setTab] = React.useState('home');
  const [txs, setTxs] = React.useState(SAMPLE_TX);
  const [sheet, setSheet] = React.useState(false);
  const scroller = React.useRef(null);
  React.useEffect(() => { if (scroller.current) scroller.current.scrollTop = 0; }, [tab]);
  const addTx = (t) => { setTxs(p => [t, ...p]); setTab('home'); };
  const screens = {
    home: <HomeScreen txs={txs} go={setTab} />,
    tx: <ReportScreen txs={txs} />,
    goals: <GoalsScreen />,
    zakat: <ZakatScreen txs={txs} />,
  };
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'radial-gradient(120% 80% at 50% 0%, #EAF6F0 0%, #DCE7E2 100%)', padding: 24, fontFamily: BB.font }}>
      {/* phone */}
      <div style={{ width: 390, height: 800, background: '#000', borderRadius: 50, padding: 11, boxShadow: '0 40px 80px -20px rgba(9,63,46,.45)' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', background: BB.g50, borderRadius: 40, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* notch */}
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 120, height: 30, background: '#000', borderRadius: 99, zIndex: 30 }} />
          <StatusBar />
          <div ref={scroller} style={{ flex: 1, overflowY: 'auto', paddingTop: 6 }}>
            {screens[tab]}
          </div>
          <BottomNav tab={tab} setTab={setTab} onAdd={() => setSheet(true)} />
          <AddSheet open={sheet} onClose={() => setSheet(false)} onSave={addTx} />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
