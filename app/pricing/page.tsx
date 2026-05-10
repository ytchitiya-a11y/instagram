'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

declare global { interface Window { Razorpay: any; } }

const faqs = [
  ['Free trial mein card kyun nahi chahiye?','Hum believe karte hain ki product pehle try karo, phir pay karo. 7 din free mein sab features use karo.'],
  ['Trial expire ke baad kya hoga?','Bot automatically pause ho jayega. Data safe rahega. Upgrade karo aur immediately active ho jayega.'],
  ['₹499/month mein kya milega?','Unlimited leads, unlimited DM templates, advanced analytics, priority WhatsApp support, custom keywords, AI replies (coming).'],
  ['Cancel kaise karein?','Dashboard → Settings → Cancel. Ek click mein. Current period ke end tak access rahega.'],
  ['Payment secure hai?','Haan. Razorpay use karte hain — India ka most trusted gateway. UPI, cards, netbanking sab supported.'],
  ['GST invoice milegi?','Haan. Har payment ke baad automatic GST invoice email ho jaati hai.'],
];

export default function PricingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [busy, setBusy]   = useState(false);
  const [open, setOpen]   = useState<number|null>(null);

  const handleUpgrade = async () => {
    if (!user) { router.push('/signup'); return; }
    setBusy(true);
    try {
      const token = await user.getIdToken();
      const res   = await fetch('/api/payment/create-order', {
        method: 'POST', headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ plan: 'paid' })
      });
      const { orderId } = await res.json();
      if (!orderId) throw new Error('Order creation failed');

      await new Promise<void>((resolve, reject) => {
        const script  = document.createElement('script');
        script.src    = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve();
        script.onerror= () => reject(new Error('Razorpay load failed'));
        document.body.appendChild(script);
      });

      const rzp = new window.Razorpay({
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      49900,
        currency:    'INR',
        name:        'LeadMachine',
        description: 'Pro Plan — ₹499/month',
        order_id:    orderId,
        prefill:     { name: profile?.name||'', email: profile?.email||user.email||'' },
        theme:       { color: '#ff6b00' },
        handler: async (response: any) => {
          const vRes  = await fetch('/api/payment/verify', {
            method: 'POST', headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
            body: JSON.stringify(response)
          });
          const vData = await vRes.json();
          if (vData.success) router.push('/dashboard?upgraded=1');
          else alert('Payment verify failed. Contact support.');
        },
        modal: { ondismiss: () => setBusy(false) }
      });
      rzp.open();
    } catch(err: any) {
      alert(err.message || 'Something went wrong');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-16">
            <span className="font-mono text-[11px] tracking-[3px] uppercase text-[#ff6b00] block mb-4">Pricing</span>
            <h1 className="font-black text-[clamp(48px,7vw,88px)] leading-[0.9] tracking-tighter mb-5">
              SIMPLE<br/><span className="text-[#ff6b00]">HONEST</span><br/>PRICING
            </h1>
            <p className="text-white/50 text-lg max-w-md mx-auto">7 din free trial — koi card nahi. Pasand aaye to ₹499/month. Kabhi bhi cancel karo.</p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto mb-20">
            {/* Free Trial */}
            <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-2xl p-8">
              <div className="font-mono text-[10px] tracking-[2px] uppercase text-white/30 mb-4">🆓 Free Trial</div>
              <div className="flex items-end gap-2 mb-1">
                <span className="font-black text-6xl tracking-tighter leading-none">₹0</span>
                <span className="text-white/30 text-sm pb-2">/ 7 days</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5">⏰ 7 din ka free trial</div>
              <p className="text-sm text-white/50 mb-6 leading-relaxed">Puri features test karo bina kisi payment ke. Credit card bilkul nahi chahiye.</p>
              <ul className="space-y-3 mb-8">
                {[['✓','1 DM Template (Lead Funnel)',true],['✓','100 leads capture',true],['✓','Instagram Graph API',true],['✓','CSV Export',true],['✓','Live Simulator',true],['✗','Unlimited templates',false],['✗','Priority support',false]].map(([icon,text,active],i)=>(
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className={active?'text-green-400':'text-white/20'}>{icon}</span>
                    <span className={active?'text-white/70':'text-white/25'}>{text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full text-center py-3 rounded-xl font-bold text-sm border border-white/[0.12] text-white hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all">7 Din Free Start Karo →</Link>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-br from-[#0f0f1a] to-[#1a0a00] border border-[#ff6b00]/40 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_60px_rgba(255,107,0,0.1)]">
              <div className="absolute top-5 right-[-28px] bg-[#ff6b00] text-black font-mono text-[9px] font-bold tracking-[2px] px-9 py-1 rotate-[35deg]">BEST VALUE</div>
              <div className="font-mono text-[10px] tracking-[2px] uppercase text-white/30 mb-4">⚡ Pro</div>
              <div className="flex items-end gap-2 mb-6">
                <span className="font-black text-6xl tracking-tighter leading-none text-[#ff6b00]">₹499</span>
                <span className="text-white/30 text-sm pb-2">/ month</span>
              </div>
              <p className="text-sm text-white/50 mb-6 leading-relaxed">Unlimited leads, unlimited templates. Scale karo bina limits ke.</p>
              <ul className="space-y-3 mb-8">
                {[['✓','Unlimited DM Templates'],['✓','Unlimited Leads'],['✓','Advanced Analytics'],['✓','Priority WhatsApp Support'],['✓','Custom Trigger Keywords'],['✓','Bulk CSV + Reports'],['✓','AI Replies (Coming Soon)'],['✓','Cancel Anytime']].map(([icon,text],i)=>(
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-green-400">{icon}</span>
                    <span className="text-white/70">{text}</span>
                  </li>
                ))}
              </ul>
              <button onClick={handleUpgrade} disabled={busy}
                className="w-full py-3.5 rounded-xl font-black text-sm bg-[#ff6b00] text-black hover:bg-[#ff8c38] transition-all hover:shadow-[0_4px_24px_rgba(255,107,0,0.5)] disabled:opacity-50">
                {busy ? 'Processing...' : '⚡ PRO UPGRADE — ₹499/MONTH'}
              </button>
              <p className="text-center font-mono text-[10px] text-white/20 mt-3">UPI · Cards · Netbanking · Wallets</p>
            </div>
          </div>

          {/* Guarantee */}
          <div className="max-w-lg mx-auto mb-20 bg-[#0f0f1a] border border-white/[0.07] rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="font-black text-2xl tracking-tight mb-3">7-DAY MONEY BACK</h3>
            <p className="text-sm text-white/50 leading-relaxed">Pro plan lene ke baad 7 din mein kisi bhi reason se full refund milega. No questions asked. Bas email karo: <a href="mailto:support@leadmachine.in" className="text-[#ff6b00]">support@leadmachine.in</a></p>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="font-black text-3xl tracking-tight text-center mb-8">COMMON QUESTIONS</h2>
            {faqs.map(([q, a], i) => (
              <div key={i} className="border-b border-white/[0.07]">
                <button onClick={() => setOpen(open===i?null:i)} className="w-full flex items-center justify-between gap-4 py-5 text-left">
                  <span className="font-semibold text-sm text-white/80">{q}</span>
                  <span className={`text-[#ff6b00] text-xl transition-transform ${open===i?'rotate-45':''}`}>+</span>
                </button>
                {open === i && <p className="text-sm text-white/50 leading-relaxed pb-5">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
