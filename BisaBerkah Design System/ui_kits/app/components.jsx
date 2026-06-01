/* global React */
// BisaBerkah App UI kit — shared primitives & chrome
// Tokens mirror colors_and_type.css (kept in JS for inline styling).

const BB = {
  brand25:'#F2FCF8', brand50:'#E3FAF0', brand100:'#BFF2DC', brand200:'#8AE6C1',
  brand300:'#4FD3A0', brand400:'#22B981', brand500:'#0E9F6E', brand600:'#07835A',
  brand700:'#086848', brand800:'#09533B', brand900:'#093F2E', brand950:'#04261C',
  gold50:'#FFF6DB', gold100:'#FCEBB3', gold300:'#F2C14E', gold500:'#D6900F', gold600:'#B57108', gold700:'#91560B',
  g25:'#FCFCFD', g50:'#F9FAFB', g100:'#F2F4F7', g200:'#EAECF0', g300:'#D0D5DD',
  g400:'#98A2B3', g500:'#667085', g600:'#475467', g700:'#344054', g800:'#182230', g900:'#101828',
  success50:'#ECFDF3', success600:'#079455', success700:'#067647',
  info50:'#EFF8FF', info600:'#1570EF',
  font:"'Plus Jakarta Sans', system-ui, sans-serif",
};

// ---- Icon (Lucide via CDN, sized with em) ----
function Icon({ name, size = 20, color, style, strokeWidth }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.innerHTML = `<i data-lucide="${name}"></i>`;
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': strokeWidth || 2 } });
  });
  return <span ref={ref} style={{ fontSize: size, color, display: 'inline-flex', lineHeight: 0, ...style }} />;
}

// ---- Button ----
function Button({ children, variant = 'primary', size = 'md', icon, full, onClick, style }) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const pad = size === 'lg' ? '14px 22px' : size === 'sm' ? '8px 14px' : '11px 18px';
  const fs = size === 'lg' ? 16 : size === 'sm' ? 13 : 15;
  const variants = {
    primary: { background: press ? BB.brand800 : hover ? BB.brand700 : BB.brand600, color: '#fff', border: '1px solid transparent', boxShadow: '0 1px 2px rgba(16,24,40,.05)' },
    secondary: { background: hover ? BB.g50 : '#fff', color: BB.g700, border: `1px solid ${BB.g300}`, boxShadow: '0 1px 2px rgba(16,24,40,.05)' },
    ghost: { background: hover ? BB.brand50 : 'transparent', color: BB.brand700, border: '1px solid transparent' },
    gold: { background: press ? BB.gold700 : hover ? BB.gold600 : BB.gold500, color: '#fff', border: '1px solid transparent', boxShadow: '0 1px 2px rgba(16,24,40,.05)' },
  };
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: full ? '100%' : 'auto',
        fontFamily: BB.font, fontWeight: 600, fontSize: fs, padding: pad, borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
        transform: press ? 'scale(.98)' : 'none', transition: 'all .15s cubic-bezier(.4,0,.2,1)', ...variants[variant], ...style }}>
      {icon && <Icon name={icon} size={fs + 3} />}{children}
    </button>
  );
}

// ---- Balance card: Untitled UI CreditCard "gradient-strip", re-skinned ----
function BalanceCard({ total = 'Rp24.500.000', income = '+Rp8.500.000', expense = '−Rp3.412.000' }) {
  return (
    <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: BB.brand800,
      boxShadow: '0 12px 24px -6px rgba(7,131,90,.35)', color: '#fff', padding: '20px 22px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg,transparent 30%,rgba(34,185,129,.55) 46%,rgba(14,159,110,.30) 60%,transparent 72%)' }} />
      <div style={{ position: 'absolute', right: -40, top: -50, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,211,160,.4),transparent 70%)' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 15, letterSpacing: '-.01em' }}>
            <Icon name="sprout" size={20} color="#fff" /> Keluarga Pratama
          </div>
          <Icon name="eye" size={18} color="rgba(255,255,255,.85)" />
        </div>
        <div style={{ fontSize: 12, opacity: .82, marginTop: 22 }}>Total saldo keluarga</div>
        <div style={{ fontWeight: 800, fontSize: 34, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em', marginTop: 2 }}>{total}</div>
        <div style={{ display: 'flex', gap: 20, marginTop: 18 }}>
          <div><div style={{ fontSize: 11, opacity: .82, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="arrow-down-left" size={13} color="#fff" />Masuk</div>
            <div style={{ fontWeight: 700, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{income}</div></div>
          <div><div style={{ fontSize: 11, opacity: .82, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="arrow-up-right" size={13} color="#fff" />Keluar</div>
            <div style={{ fontWeight: 700, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{expense}</div></div>
        </div>
      </div>
    </div>
  );
}

// ---- Transaction row ----
function TxRow({ tx, last }) {
  const tint = { in: BB.success50, out: BB.g100, zakat: BB.gold50, transport: BB.info50 }[tx.kind] || BB.g100;
  const amtColor = tx.kind === 'in' ? BB.success600 : tx.kind === 'zakat' ? BB.gold600 : BB.g900;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderBottom: last ? 'none' : `1px solid ${BB.g100}` }}>
      <div style={{ width: 42, height: 42, borderRadius: 999, background: tint, display: 'grid', placeItems: 'center', fontSize: 19, flex: 'none' }}>{tx.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: BB.g900 }}>{tx.name}</div>
        <div style={{ fontSize: 13, color: BB.g500, marginTop: 1 }}>{tx.cat} · {tx.time}</div>
      </div>
      <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 15, color: amtColor, letterSpacing: '-.01em' }}>{tx.amount}</div>
    </div>
  );
}

// ---- Goal card ----
function GoalCard({ goal, wide }) {
  return (
    <div style={{ minWidth: wide ? 'auto' : 230, background: '#fff', border: `1px solid ${BB.g200}`, borderRadius: 16, boxShadow: '0 1px 3px rgba(16,24,40,.1)', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: BB.gold50, display: 'grid', placeItems: 'center', fontSize: 20 }}>{goal.emoji}</div>
        <div><div style={{ fontWeight: 700, fontSize: 15, color: BB.g900, whiteSpace: 'nowrap' }}>{goal.name}</div>
          <div style={{ fontSize: 12, color: BB.g500 }}>{goal.sub}</div></div>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: BB.g100, margin: '14px 0 8px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: goal.pct + '%', borderRadius: 99, background: `linear-gradient(90deg,${BB.brand500},${BB.brand600})` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: BB.g900 }}>{goal.now}</span>
        <span style={{ fontSize: 13, color: BB.g500 }}>dari {goal.target}</span>
      </div>
    </div>
  );
}

// ---- Section header ----
function SectionHead({ title, action, onAction }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <h3 style={{ margin: 0, fontFamily: BB.font, fontSize: 17, fontWeight: 700, color: BB.g900, whiteSpace: 'nowrap' }}>{title}</h3>
      {action && <button onClick={onAction} style={{ border: 0, background: 'none', cursor: 'pointer', fontFamily: BB.font, fontWeight: 600, fontSize: 14, color: BB.brand700, whiteSpace: 'nowrap', flex: 'none' }}>{action}</button>}
    </div>
  );
}

// ---- Bottom nav ----
function BottomNav({ tab, setTab, onAdd }) {
  const items = [
    { id: 'home', icon: 'house', label: 'Beranda' },
    { id: 'tx', icon: 'chart-no-axes-column', label: 'Laporan' },
    { id: 'add' },
    { id: 'goals', icon: 'target', label: 'Tujuan' },
    { id: 'zakat', icon: 'hand-coins', label: 'Zakat' },
  ];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '8px 18px 22px', background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${BB.g100}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      {items.map(it => it.id === 'add' ? (
        <button key="add" onClick={onAdd} style={{ width: 54, height: 54, borderRadius: '50%', background: BB.brand600, display: 'grid', placeItems: 'center', boxShadow: '0 8px 18px -4px rgba(7,131,90,.5)', border: '4px solid #fff', cursor: 'pointer', marginBottom: 2 }}>
          <Icon name="plus" size={26} color="#fff" strokeWidth={2.4} />
        </button>
      ) : (
        <button key={it.id} onClick={() => setTab(it.id)} style={{ border: 0, background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: 56, color: tab === it.id ? BB.brand600 : BB.g400, fontFamily: BB.font, fontSize: 11, fontWeight: 600 }}>
          <Icon name={it.icon} size={24} />{it.label}
        </button>
      ))}
    </div>
  );
}

Object.assign(window, { BB, Icon, Button, BalanceCard, TxRow, GoalCard, SectionHead, BottomNav });
