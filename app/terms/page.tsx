import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function TermsPage() {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8">
      <h2 className="font-bold text-base mb-3 pl-3 border-l-2 border-[#ff6b00]">{title}</h2>
      <div className="text-sm text-white/50 leading-relaxed space-y-2">{children}</div>
    </div>
  );
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 relative z-10 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <span className="font-mono text-[11px] tracking-[3px] uppercase text-[#ff6b00] block mb-3">Legal</span>
          <h1 className="font-black text-[clamp(40px,6vw,70px)] leading-[0.9] tracking-tighter mb-3">TERMS OF<br/>SERVICE</h1>
          <p className="font-mono text-xs text-white/25 mb-10">Last updated: January 1, 2025</p>
          <div className="bg-[#ff6b00]/10 border border-[#ff6b00]/25 rounded-lg px-5 py-4 mb-10 text-sm text-[#ff8c38]">⚡ Short version: LeadMachine use karo, Meta ki policies follow karo, spam mat karo.</div>
          <Section title="1. Service Description"><p>LeadMachine ek Instagram DM automation SaaS platform hai. Hum Meta Platforms Inc. ke webhooks use karte hain. Hum Meta ke saath affiliated nahi hain.</p></Section>
          <Section title="2. Account & Eligibility"><p>Account banane ke liye umar 18+ honi chahiye. Password ki security aapki zimmedari hai. Ek email se sirf ek account.</p></Section>
          <Section title="3. Subscription & Billing"><p>Free trial: 7 din, koi card nahi. Pro plan: ₹499/month, Razorpay se. Trial expire hone par bot automatically pause hoga. Upgrade karo to immediately active ho jayega.</p></Section>
          <Section title="4. Instagram / Meta Compliance">
            <p>✅ User-initiated conversations allowed (user pehle message kare)</p>
            <p>✅ Comment-triggered DMs allowed</p>
            <p>❌ Cold DMs — bilkul allowed nahi</p>
            <p>❌ Spam ya harassment — allowed nahi</p>
          </Section>
          <Section title="5. Free Plan Limitations"><p>1 DM template (Lead Funnel), maximum 100 leads/month. Hum limitations kabhi bhi change kar sakte hain.</p></Section>
          <Section title="6. Data & Privacy"><p>Aapke leads ka data aapka hai. Details hamaari <Link href="/privacy" className="text-[#ff6b00]">Privacy Policy</Link> mein hain.</p></Section>
          <Section title="7. Termination"><p>Aap kabhi bhi account delete kar sakte hain. Hum bhi Terms violation par account terminate kar sakte hain.</p></Section>
          <Section title="8. Contact"><p>Questions: <a href="mailto:legal@leadmachine.in" className="text-[#ff6b00]">legal@leadmachine.in</a></p></Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
