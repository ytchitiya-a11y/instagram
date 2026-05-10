import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const steps = [
  { n:'1', icon:'💬', label:'DM Aata Hai',    sub:'User message karta hai' },
  { n:'2', icon:'🎯', label:'Trigger Match',   sub:'Keyword detect hota hai' },
  { n:'3', icon:'🤖', label:'Bot Q&A',         sub:'6 steps auto-reply' },
  { n:'4', icon:'🔗', label:'Link Bheja',      sub:'Website auto-send' },
  { n:'5', icon:'✅', label:'Lead Captured',   sub:'Dashboard mein save' },
];

const features = [
  { icon:'📱', title:'Instagram Graph API',   desc:'Direct Meta Webhook. No third-party. 100% policy compliant.' },
  { icon:'💳', title:'Razorpay Payment',       desc:'UPI, cards, netbanking. 7-day free trial. ₹499/month.' },
  { icon:'🌐', title:'Hinglish + English',     desc:'User ki language auto-detect. Bot usi mein reply kare.' },
  { icon:'👥', title:'Multi-User SaaS',        desc:'Har user ka alag account, alag leads, alag Instagram.' },
  { icon:'📊', title:'Lead Dashboard',         desc:'Real-time stats, CSV export, conversion tracking.' },
  { icon:'👑', title:'Admin Panel',            desc:'Sab users, revenue, plans — ek jagah manage karo.' },
];

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 relative z-10">

        {/* Hero */}
        <section className="py-24 text-center px-6">
          <div className="max-w-4xl mx-auto">
            <span className="rise font-mono text-xs tracking-[3px] uppercase text-[#ff6b00] block mb-5">
              Instagram Graph API · Razorpay · Firebase · India 🇮🇳
            </span>
            <h1 className="rise d1 text-[clamp(56px,9vw,110px)] font-black leading-[0.9] tracking-tighter mb-6">
              <span className="text-white/30 [-webkit-text-stroke:1.5px_rgba(255,255,255,0.4)]">INSTAGRAM</span><br/>
              <span className="text-white">LEADS ON</span><br/>
              <span className="text-[#ff6b00]">AUTOPILOT</span>
            </h1>
            <p className="rise d2 text-lg text-white/60 max-w-[480px] mx-auto leading-relaxed mb-10">
              User "hi" bheje — bot qualify kare, website link bheje, lead capture ho.
              7 din free. Phir ₹499/month.
            </p>
            <div className="rise d3 flex gap-3 justify-center flex-wrap">
              <Link href="/signup"
                className="px-9 py-4 rounded-lg font-black text-base bg-[#ff6b00] text-black hover:bg-[#ff8c38] transition-all hover:shadow-[0_6px_28px_rgba(255,107,0,0.5)] hover:-translate-y-1">
                7 DIN FREE SHURU KARO →
              </Link>
              <Link href="/pricing"
                className="px-7 py-4 rounded-lg font-bold text-base border border-white/20 text-white hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all">
                Pricing Dekho
              </Link>
            </div>
            <p className="rise d4 font-mono text-xs text-white/30 mt-5">
              ✓ Credit card nahi chahiye &nbsp;·&nbsp; ✓ 5 min setup &nbsp;·&nbsp; ✓ Cancel anytime
            </p>

            {/* Stats */}
            <div className="rise d5 flex gap-12 justify-center mt-16 pt-10 border-t border-white/[0.07] flex-wrap">
              {[['7','Day Free Trial'],['₹499','Per Month'],['6','Step Auto Flow'],['24/7','Bot Active']].map(([n,l]) => (
                <div key={l}>
                  <div className="font-black text-4xl text-[#ff6b00] leading-none">{n}</div>
                  <div className="font-mono text-xs text-white/40 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-6" id="how">
          <div className="max-w-6xl mx-auto">
            <span className="font-mono text-[10px] tracking-[3px] uppercase text-[#ff6b00] block mb-3">How it Works</span>
            <h2 className="font-black text-[clamp(32px,4vw,56px)] leading-none tracking-tighter mb-4">5 STEPS MEIN LEAD</h2>
            <p className="text-white/50 text-base mb-16">User sirf "hi" bheje — baaki sab automatic.</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {steps.map(s => (
                <div key={s.n} className="text-center group">
                  <div className="relative w-[68px] h-[68px] mx-auto mb-4 bg-[#0f0f1a] border border-white/[0.07] rounded-2xl flex items-center justify-center text-2xl transition-all group-hover:border-[#ff6b00] group-hover:shadow-[0_0_30px_rgba(255,107,0,0.2)] group-hover:-translate-y-1">
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#ff6b00] rounded-full flex items-center justify-center font-mono text-[9px] font-bold text-black">{s.n}</span>
                    {s.icon}
                  </div>
                  <div className="font-bold text-sm mb-1">{s.label}</div>
                  <div className="text-xs text-white/40">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <span className="font-mono text-[10px] tracking-[3px] uppercase text-[#ff6b00] block mb-3">Features</span>
            <h2 className="font-black text-[clamp(32px,4vw,56px)] leading-none tracking-tighter mb-12">SABKUCH EK JAGAH</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-y divide-white/[0.07] border border-white/[0.07] rounded-xl overflow-hidden">
              {features.map(f => (
                <div key={f.title} className="p-7 bg-[#080810] hover:bg-[#0f0f1a] transition-colors">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <div className="font-bold text-sm mb-2">{f.title}</div>
                  <div className="text-sm text-white/50 leading-relaxed">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 px-6 mb-10">
          <div className="max-w-6xl mx-auto">
            <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-2xl p-16 text-center relative overflow-hidden">
              <div className="absolute w-[500px] h-[500px] rounded-full -top-[200px] left-1/2 -translate-x-1/2 bg-[radial-gradient(circle,rgba(255,107,0,0.06),transparent_70%)]" />
              <h2 className="font-black text-[clamp(36px,5vw,64px)] tracking-tighter mb-3 relative z-10">
                ABHI SHURU KARO 🚀
              </h2>
              <p className="text-white/50 mb-8 text-base relative z-10">7 din free. Koi card nahi. Setup 5 minute.</p>
              <Link href="/signup"
                className="relative z-10 inline-flex px-10 py-4 rounded-lg font-black text-base bg-[#ff6b00] text-black hover:bg-[#ff8c38] hover:shadow-[0_6px_28px_rgba(255,107,0,0.5)] hover:-translate-y-1 transition-all">
                FREE TRIAL SHURU KARO →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
