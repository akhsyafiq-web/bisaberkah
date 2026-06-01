/* global React, ReactDOM, WB, Header, Footer, Hero, Metrics, Features, ZakatSplit, Testimonial, CTA */
function WebApp() {
  return (
    <div id="webscroll" style={{ height: '100vh', overflowY: 'auto', background: '#fff', fontFamily: WB.font }}>
      <Header />
      <Hero />
      <Metrics />
      <Features />
      <ZakatSplit />
      <Testimonial />
      <CTA />
      <Footer />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<WebApp />);
