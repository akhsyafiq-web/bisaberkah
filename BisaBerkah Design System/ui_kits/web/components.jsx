/* global React */
// BisaBerkah Web UI kit — shared chrome & primitives

const WB = {
  brand50:'#E3FAF0', brand100:'#BFF2DC', brand200:'#8AE6C1', brand300:'#4FD3A0',
  brand400:'#22B981', brand500:'#0E9F6E', brand600:'#07835A', brand700:'#086848',
  brand800:'#09533B', brand900:'#093F2E', brand950:'#04261C',
  gold50:'#FFF6DB', gold100:'#FCEBB3', gold300:'#F2C14E', gold500:'#D6900F', gold600:'#B57108', gold700:'#91560B',
  g50:'#F9FAFB', g100:'#F2F4F7', g200:'#EAECF0', g300:'#D0D5DD', g400:'#98A2B3',
  g500:'#667085', g600:'#475467', g700:'#344054', g800:'#182230', g900:'#101828',
  font:"'Plus Jakarta Sans', system-ui, sans-serif",
};

function WIcon({ name, size = 20, color, style, strokeWidth }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const node = ref.current; if (!node) return;
    node.innerHTML = `<i data-lucide="${name}"></i>`;
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': strokeWidth || 2 } });
  });
  return <span ref={ref} style={{ fontSize: size, color, display: 'inline-flex', lineHeight: 0, ...style }} />;
}

function WButton({ children, variant = 'primary', size = 'md', icon, iconRight, onClick, style }) {
  const [h, setH] = React.useState(false);
  const pad = size === 'lg' ? '14px 24px' : '10px 18px';
  const fs = size === 'lg' ? 16 : 15;
  const v = {
    primary: { background: h ? WB.brand700 : WB.brand600, color: '#fff', border: '1px solid transparent', boxShadow: '0 1px 2px rgba(16,24,40,.05)' },
    secondary: { background: h ? WB.g50 : '#fff', color: WB.g700, border: `1px solid ${WB.g300}`, boxShadow: '0 1px 2px rgba(16,24,40,.05)' },
    ghost: { background: h ? WB.g100 : 'transparent', color: WB.g700, border: '1px solid transparent' },
  };
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: WB.font, fontWeight: 600, fontSize: fs,
        padding: pad, borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s ease', ...v[variant], ...style }}>
      {icon && <WIcon name={icon} size={fs + 3} />}{children}{iconRight && <WIcon name={iconRight} size={fs + 1} />}
    </button>
  );
}

function StoreButton({ os }) {
  const cfg = os === 'ios' ? { icon: 'apple', top: 'Download di', big: 'App Store' } : { icon: 'play', top: 'Dapatkan di', big: 'Google Play' };
  return (
    <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', background: WB.g900, color: '#fff', borderRadius: 10, padding: '8px 16px' }}>
      <WIcon name={cfg.icon} size={22} color="#fff" />
      <span style={{ lineHeight: 1.1 }}><span style={{ fontSize: 10, opacity: .8, display: 'block', fontFamily: WB.font }}>{cfg.top}</span>
        <span style={{ fontSize: 16, fontWeight: 700, fontFamily: WB.font }}>{cfg.big}</span></span>
    </a>
  );
}

function FeaturedIcon({ name, tone = 'brand' }) {
  const bg = tone === 'gold' ? WB.gold50 : WB.brand50;
  const fg = tone === 'gold' ? WB.gold600 : WB.brand600;
  return <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'grid', placeItems: 'center', flex: 'none' }}><WIcon name={name} size={24} color={fg} /></div>;
}

function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const sc = document.getElementById('webscroll');
    const fn = () => setScrolled((sc ? sc.scrollTop : window.scrollY) > 12);
    (sc || window).addEventListener('scroll', fn); return () => (sc || window).removeEventListener('scroll', fn);
  });
  const links = ['Fitur', 'Zakat', 'Cerita', 'Harga'];
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, transition: 'all .2s',
      background: scrolled ? 'rgba(255,255,255,.8)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: `1px solid ${scrolled ? WB.g200 : 'transparent'}` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src="../../assets/logo-wordmark.svg" alt="BisaBerkah" style={{ height: 34 }} />
        <nav style={{ display: 'flex', gap: 30 }}>
          {links.map(l => <a key={l} href="#" style={{ textDecoration: 'none', fontFamily: WB.font, fontWeight: 600, fontSize: 15, color: WB.g600 }}>{l}</a>)}
        </nav>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <WButton variant="ghost">Masuk</WButton>
          <WButton icon="download">Download app</WButton>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const cols = [
    { h: 'Produk', items: ['Fitur', 'Zakat & Sedekah', 'Tujuan keluarga', 'Harga'] },
    { h: 'Perusahaan', items: ['Tentang kami', 'Karier', 'Blog', 'Kontak'] },
    { h: 'Bantuan', items: ['Pusat bantuan', 'Keamanan', 'Privasi', 'Syarat'] },
  ];
  return (
    <footer style={{ background: WB.brand950, color: '#fff', padding: '64px 32px 36px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 60, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ maxWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <WIcon name="sprout" size={26} color="#fff" />
            <span style={{ fontFamily: WB.font, fontWeight: 800, fontSize: 20 }}>BisaBerkah</span>
          </div>
          <p style={{ fontFamily: WB.font, fontSize: 14, lineHeight: 1.6, color: WB.brand200, margin: 0 }}>Catat berkah, raih tujuan. Aplikasi keuangan keluarga muda Indonesia.</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            {['camera', 'at-sign', 'message-circle'].map(s => <WIcon key={s} name={s} size={20} color={WB.brand200} />)}
          </div>
        </div>
        {cols.map(c => (
          <div key={c.h}>
            <div style={{ fontFamily: WB.font, fontWeight: 700, fontSize: 14, marginBottom: 14, color: WB.brand100 }}>{c.h}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {c.items.map(i => <a key={i} href="#" style={{ textDecoration: 'none', fontFamily: WB.font, fontSize: 14, color: WB.brand200 }}>{i}</a>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1200, margin: '40px auto 0', paddingTop: 24, borderTop: `1px solid ${WB.brand900}`, fontFamily: WB.font, fontSize: 13, color: WB.brand300 }}>
        © 2026 BisaBerkah. Terdaftar &amp; diawasi OJK.
      </div>
    </footer>
  );
}

Object.assign(window, { WB, WIcon, WButton, StoreButton, FeaturedIcon, Header, Footer });
