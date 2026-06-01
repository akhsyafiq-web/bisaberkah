/* global React, WB, WIcon, WButton, StoreButton, FeaturedIcon */
// BisaBerkah Web UI kit — page sections

function HeroPhone() {
  return (
    <div style={{ position: 'relative', width: 300, margin: '0 auto' }}>
      {/* phone */}
      <div style={{ width: 300, background: '#000', borderRadius: 42, padding: 9, boxShadow: '0 40px 80px -24px rgba(9,63,46,.5)' }}>
        <div style={{ background: WB.g50, borderRadius: 34, overflow: 'hidden', padding: '40px 16px 18px' }}>
          {/* balance card (gradient-strip) */}
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: WB.brand800, color: '#fff', padding: '16px 18px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg,transparent 30%,rgba(34,185,129,.55) 46%,rgba(14,159,110,.3) 60%,transparent 72%)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 800, fontSize: 13 }}><WIcon name="sprout" size={16} color="#fff" />Keluarga Pratama</div>
              <div style={{ fontSize: 11, opacity: .82, marginTop: 16 }}>Total saldo keluarga</div>
              <div style={{ fontWeight: 800, fontSize: 25, letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums' }}>Rp24.500.000</div>
            </div>
          </div>
          {/* rows */}
          {[{ e: '💼', n: 'Gaji Mei', c: 'Pemasukan', a: '+Rp8.500.000', col: WB.brand600 }, { e: '🤲', n: 'Zakat', c: 'Zakat · 25 Mei', a: 'Rp212.500', col: WB.gold600 }, { e: '🍜', n: 'Warung Tegal', c: 'Makan', a: '−Rp28.000', col: WB.g900 }].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 2px', borderBottom: i < 2 ? `1px solid ${WB.g100}` : 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: 99, background: WB.g100, display: 'grid', placeItems: 'center', fontSize: 16 }}>{r.e}</div>
              <div style={{ flex: 1 }}><div style={{ fontFamily: WB.font, fontWeight: 600, fontSize: 13, color: WB.g900 }}>{r.n}</div>
                <div style={{ fontFamily: WB.font, fontSize: 11, color: WB.g500 }}>{r.c}</div></div>
              <div style={{ fontFamily: WB.font, fontWeight: 700, fontSize: 13, color: r.col, fontVariantNumeric: 'tabular-nums' }}>{r.a}</div>
            </div>
          ))}
        </div>
      </div>
      {/* floating goal chip */}
      <div style={{ position: 'absolute', top: 150, right: -38, background: '#fff', borderRadius: 14, boxShadow: '0 12px 24px -6px rgba(16,24,40,.18)', padding: '12px 14px', width: 150 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 16 }}>🕋</span><span style={{ fontFamily: WB.font, fontWeight: 700, fontSize: 13, color: WB.g900 }}>Umrah 2026</span></div>
        <div style={{ height: 6, borderRadius: 99, background: WB.g100, margin: '9px 0 6px' }}><div style={{ width: '68%', height: '100%', borderRadius: 99, background: WB.brand500 }} /></div>
        <div style={{ fontFamily: WB.font, fontSize: 11, color: WB.g500 }}>68% · Rp34jt / Rp50jt</div>
      </div>
      {/* floating zakat chip */}
      <div style={{ position: 'absolute', bottom: 30, left: -62, background: '#fff', borderRadius: 14, boxShadow: '0 12px 24px -6px rgba(16,24,40,.18)', padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: WB.gold50, display: 'grid', placeItems: 'center' }}><WIcon name="hand-coins" size={18} color={WB.gold600} /></div>
        <div><div style={{ fontFamily: WB.font, fontWeight: 700, fontSize: 12, color: WB.g900 }}>Zakat otomatis</div>
          <div style={{ fontFamily: WB.font, fontSize: 11, color: WB.gold700 }}>2,5% tersisihkan</div></div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(80% 60% at 70% 0%, #E3FAF0 0%, transparent 60%)' }} />
      <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '64px 32px 80px', display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 40, alignItems: 'center' }}>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: `1px solid ${WB.brand200}`, color: WB.brand700, fontFamily: WB.font, fontWeight: 600, fontSize: 13, padding: '5px 12px', borderRadius: 999 }}>
            <WIcon name="sparkles" size={15} color={WB.brand600} /> Keuangan keluarga, penuh berkah
          </span>
          <h1 style={{ fontFamily: WB.font, fontWeight: 800, fontSize: 52, lineHeight: 1.08, letterSpacing: '-.03em', color: WB.g900, margin: '20px 0 0' }}>
            Atur uang keluarga, raih tujuan <span style={{ color: WB.brand600 }}>bareng.</span>
          </h1>
          <p style={{ fontFamily: WB.font, fontSize: 18, lineHeight: 1.6, color: WB.g600, margin: '18px 0 0', maxWidth: 460 }}>
            Catat pemasukan &amp; pengeluaran, tabung untuk tujuan keluarga, dan sisihkan zakat otomatis — semua dalam satu aplikasi.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <StoreButton os="ios" /><StoreButton os="play" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22, fontFamily: WB.font, fontSize: 14, color: WB.g500 }}>
            <div style={{ display: 'flex' }}>{[WB.brand200, WB.gold300, WB.brand400, WB.brand600].map((c, i) => <div key={i} style={{ width: 30, height: 30, borderRadius: 99, background: c, border: '2px solid #fff', marginLeft: i ? -10 : 0 }} />)}</div>
            Dipercaya <b style={{ color: WB.g700 }}>500rb+</b> keluarga
          </div>
        </div>
        <HeroPhone />
      </div>
    </section>
  );
}

function Metrics() {
  const m = [['500rb+', 'Keluarga aktif'], ['Rp2,1T', 'Dana dikelola'], ['Rp84M', 'Zakat tersalurkan'], ['4.9★', 'Rating App Store']];
  return (
    <section style={{ background: WB.g50, borderTop: `1px solid ${WB.g200}`, borderBottom: `1px solid ${WB.g200}` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
        {m.map(([v, l], i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: WB.font, fontWeight: 800, fontSize: 34, color: WB.brand700, letterSpacing: '-.02em' }}>{v}</div>
            <div style={{ fontFamily: WB.font, fontSize: 14, color: WB.g600, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const f = [
    { i: 'wallet', t: 'Catat otomatis', d: 'Hubungkan rekening &amp; e-wallet. Transaksi tercatat dan terkategori sendiri.' },
    { i: 'target', t: 'Tujuan bareng', d: 'Tabung untuk umrah, DP rumah, atau dana darurat — bareng pasangan.' },
    { i: 'hand-coins', t: 'Zakat &amp; sedekah', d: 'Hitung zakat penghasilan 2,5% otomatis dan salurkan ke lembaga tepercaya.', tone: 'gold' },
    { i: 'chart-pie', t: 'Laporan jelas', d: 'Lihat ke mana uang pergi tiap bulan, tanpa bikin pusing.' },
    { i: 'users', t: 'Mode keluarga', d: 'Satu dompet, banyak anggota. Semua transparan dan terkendali.' },
    { i: 'shield-check', t: 'Aman & syariah', d: 'Diawasi OJK, data terenkripsi, dan ramah prinsip syariah.' },
  ];
  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 32px' }}>
      <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 52px' }}>
        <span style={{ fontFamily: WB.font, fontWeight: 700, fontSize: 14, letterSpacing: '.04em', textTransform: 'uppercase', color: WB.brand600 }}>Fitur</span>
        <h2 style={{ fontFamily: WB.font, fontWeight: 800, fontSize: 38, letterSpacing: '-.02em', color: WB.g900, margin: '10px 0 12px' }}>Semua yang keluarga butuh</h2>
        <p style={{ fontFamily: WB.font, fontSize: 17, color: WB.g600, margin: 0 }}>Dari catat harian sampai tujuan besar — dan ibadah harta yang nggak kelupaan.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
        {f.map((x, i) => (
          <div key={i}>
            <FeaturedIcon name={x.i} tone={x.tone} />
            <h3 style={{ fontFamily: WB.font, fontWeight: 700, fontSize: 19, color: WB.g900, margin: '18px 0 8px' }} dangerouslySetInnerHTML={{ __html: x.t }} />
            <p style={{ fontFamily: WB.font, fontSize: 15, lineHeight: 1.6, color: WB.g600, margin: 0 }} dangerouslySetInnerHTML={{ __html: x.d }} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ZakatSplit() {
  return (
    <section style={{ background: `linear-gradient(135deg,${WB.brand900},${WB.brand800})`, color: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(242,193,78,.15)', color: WB.gold300, fontFamily: WB.font, fontWeight: 600, fontSize: 13, padding: '5px 12px', borderRadius: 999 }}>
            <WIcon name="hand-coins" size={15} color={WB.gold300} /> Zakat &amp; Sedekah
          </span>
          <h2 style={{ fontFamily: WB.font, fontWeight: 800, fontSize: 38, letterSpacing: '-.02em', margin: '18px 0 14px', lineHeight: 1.15 }}>Berkah harta, dihitung otomatis</h2>
          <p style={{ fontFamily: WB.font, fontSize: 17, lineHeight: 1.65, color: WB.brand100, margin: '0 0 24px' }}>
            Setiap pemasukan, BisaBerkah menyisihkan 2,5% sebagai zakat penghasilan. Salurkan kapan saja ke lembaga amil zakat tepercaya, lengkap dengan laporan.
          </p>
          {['Hitung nisab &amp; haul otomatis', 'Salurkan ke BAZNAS &amp; lembaga resmi', 'Riwayat & bukti untuk laporan pajak'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 99, background: WB.gold500, display: 'grid', placeItems: 'center', flex: 'none' }}><WIcon name="check" size={15} color="#fff" strokeWidth={3} /></div>
              <span style={{ fontFamily: WB.font, fontSize: 15, color: '#fff' }} dangerouslySetInnerHTML={{ __html: t }} />
            </div>
          ))}
        </div>
        <div style={{ background: `linear-gradient(135deg,${WB.gold500},${WB.gold600})`, borderRadius: 24, padding: 28, boxShadow: '0 24px 48px -12px rgba(0,0,0,.35)' }}>
          <div style={{ fontFamily: WB.font, fontSize: 14, opacity: .9, display: 'flex', alignItems: 'center', gap: 7 }}><WIcon name="hand-coins" size={20} color="#fff" /> Zakat penghasilan Mei</div>
          <div style={{ fontFamily: WB.font, fontWeight: 800, fontSize: 40, letterSpacing: '-.02em', margin: '8px 0 2px', fontVariantNumeric: 'tabular-nums' }}>Rp212.500</div>
          <div style={{ fontFamily: WB.font, fontSize: 13, opacity: .9 }}>2,5% dari Rp8.500.000</div>
          <div style={{ background: '#fff', color: WB.gold700, borderRadius: 12, padding: '13px 0', textAlign: 'center', fontFamily: WB.font, fontWeight: 700, fontSize: 15, marginTop: 22 }}>Salurkan sekarang</div>
        </div>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section style={{ maxWidth: 880, margin: '0 auto', padding: '88px 32px', textAlign: 'center' }}>
      <WIcon name="quote" size={40} color={WB.brand300} />
      <p style={{ fontFamily: WB.font, fontWeight: 600, fontSize: 28, lineHeight: 1.4, letterSpacing: '-.01em', color: WB.g900, margin: '20px 0 28px' }}>
        “Pertama kali aku &amp; suami punya rekening tujuan bareng yang beneran kepakai. Zakatnya juga kehitung sendiri — nggak pernah lupa lagi.”
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 99, background: WB.brand100, color: WB.brand700, display: 'grid', placeItems: 'center', fontFamily: WB.font, fontWeight: 700 }}>RP</div>
        <div style={{ textAlign: 'left' }}><div style={{ fontFamily: WB.font, fontWeight: 700, fontSize: 15, color: WB.g900 }}>Rara Pratama</div>
          <div style={{ fontFamily: WB.font, fontSize: 14, color: WB.g500 }}>Ibu muda · Bandung</div></div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{ padding: '0 32px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', background: WB.brand600, borderRadius: 28, padding: '56px 48px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(34,185,129,.4)' }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontFamily: WB.font, fontWeight: 800, fontSize: 38, letterSpacing: '-.02em', color: '#fff', margin: '0 0 12px' }}>Mulai gratis hari ini</h2>
          <p style={{ fontFamily: WB.font, fontSize: 18, color: WB.brand100, margin: '0 0 28px' }}>Unduh BisaBerkah dan rasakan atur keuangan keluarga yang tenang &amp; berkah.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}><StoreButton os="ios" /><StoreButton os="play" /></div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Hero, Metrics, Features, ZakatSplit, Testimonial, CTA });
