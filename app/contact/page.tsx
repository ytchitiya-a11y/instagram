'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true); setBusy(false);
  };
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <span className="font-mono text-[11px] tracking-[3px] uppercase text-[#ff6b00] block mb-4">Contact</span>
              <h1 className="font-black text-[clamp(40px,6vw,72px)] leading-[0.9] tracking-tighter mb-5">BAAT<br/>KARO</h1>
              <p className="text-white/50 text-base leading-relaxed mb-8">Koi bhi sawaal ho — setup help, Instagram issue, billing, ya suggestion — hum yahan hain.</p>
              <div className="space-y-0 divide-y divide-white/[0.07]">
                {[['📧','Email','support@leadmachine.in'],['💬','WhatsApp','+91 99999 99999'],['📱','Instagram','@leadmachine'],['⏰','Support Hours','Mon–Sat, 10am–7pm IST']].map(([icon,label,val])=>(
                  <div key={label as string} className="flex items-center gap-4 py-5">
                    <div className="w-10 h-10 rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/20 flex items-center justify-center text-lg flex-shrink-0">{icon}</div>
                    <div><div className="font-bold text-sm">{label}</div><div className="text-sm text-white/40">{val}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-2xl p-8">
              {sent ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="font-black text-2xl tracking-tight mb-2">MESSAGE AA GAYA!</h3>
                  <p className="text-white/40 text-sm">24 hours mein reply karenge. Shukriya! 🙏</p>
                  <button onClick={() => setSent(false)} className="mt-6 px-5 py-2.5 rounded-lg font-bold text-sm border border-white/[0.12] text-white/50 hover:text-white transition-colors">Ek aur message</button>
                </div>
              ) : (
                <>
                  <h2 className="font-black text-2xl tracking-tight mb-6">MESSAGE BHEJO 📨</h2>
                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[['Naam','text','Rahul Sharma'],['Email','email','aap@example.com']].map(([l,t,ph])=>(
                        <div key={l as string}>
                          <label className="block text-[11px] font-bold tracking-[1.5px] uppercase text-white/40 mb-2">{l}</label>
                          <input type={t as string} placeholder={ph as string} required className="w-full bg-[#080810] border border-white/[0.12] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00] placeholder:text-white/20"/>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold tracking-[1.5px] uppercase text-white/40 mb-2">Topic</label>
                      <select className="w-full bg-[#080810] border border-white/[0.12] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00]">
                        {['Setup Help','Instagram Connect Issue','Billing / Pricing','Bug Report','Feature Request','Kuch Aur'].map(o=><option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold tracking-[1.5px] uppercase text-white/40 mb-2">Message</label>
                      <textarea rows={4} required placeholder="Apni problem ya question yahan likhao..." className="w-full bg-[#080810] border border-white/[0.12] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00] placeholder:text-white/20 resize-none"/>
                    </div>
                    <button type="submit" disabled={busy} className="w-full py-3 rounded-lg font-bold text-sm bg-[#ff6b00] text-black hover:bg-[#ff8c38] transition-all disabled:opacity-40">
                      {busy ? 'Sending...' : '📨 MESSAGE BHEJO →'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
