import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
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
          <h1 className="font-black text-[clamp(40px,6vw,70px)] leading-[0.9] tracking-tighter mb-3">PRIVACY<br/>POLICY</h1>
          <p className="font-mono text-xs text-white/25 mb-10">Last updated: January 1, 2025</p>
          <div className="bg-green-400/5 border border-green-400/20 rounded-lg px-5 py-4 mb-10 text-sm text-green-400">🔒 Short version: Aapka data aapka hai. Hum sell nahi karte. Firebase pe encrypted store hota hai.</div>
          <Section title="1. Hum kaun hain?"><p>LeadMachine ek Instagram lead automation SaaS, India mein based. Contact: <a href="mailto:privacy@leadmachine.in" className="text-[#ff6b00]">privacy@leadmachine.in</a></p></Section>
          <Section title="2. Hum kya collect karte hain?">
            <p>• Account Info: Name, email, password (Firebase hashed)</p>
            <p>• Business Config: Business name, website URL</p>
            <p>• Lead Data: Instagram user responses from your bot</p>
            <p>• Instagram Token: Meta access token (encrypted)</p>
          </Section>
          <Section title="3. Lead Data — Aapka hai"><p>Aapke bot dwara collect kiye gaye leads ka data poori tarah aapka hai. Hum use kabhi third parties ko sell nahi karte, apne marketing ke liye use nahi karte.</p></Section>
          <Section title="4. Firebase / Google"><p>Hum Firebase (Google) use karte hain — SOC 2, ISO 27001 certified. <a href="https://firebase.google.com/support/privacy" target="_blank" className="text-[#ff6b00]">Firebase Privacy Policy →</a></p></Section>
          <Section title="5. Cookies"><p>Sirf essential cookies — login session ke liye. No tracking. No advertising cookies.</p></Section>
          <Section title="6. Data Retention"><p>Account delete karne par 30 din mein permanently delete. Leads data: aapke account mein jab tak chahein.</p></Section>
          <Section title="7. Aapke Rights"><p>Access, correction, deletion, portability — sab available hain. Email karo: <a href="mailto:privacy@leadmachine.in" className="text-[#ff6b00]">privacy@leadmachine.in</a></p></Section>
        </div>
      </main>
    </div>
  );
}
