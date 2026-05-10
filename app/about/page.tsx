import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <span className="font-mono text-[11px] tracking-[3px] uppercase text-[#ff6b00] block mb-4">Our Story</span>
          <h1 className="font-black text-[clamp(48px,7vw,90px)] leading-[0.9] tracking-tighter mb-6">
            MADE FOR<br/>INDIAN <span className="text-[#ff6b00]">INSTA</span><br/>BUSINESSES
          </h1>
          <p className="text-lg text-white/50 max-w-xl leading-relaxed mb-16">LeadMachine isliye bana kyunki India mein Instagram pe business karna matlab har DM manually handle karna. Humne isse automate kar diya.</p>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="font-black text-4xl tracking-tight mb-5">HAMARA<br/>MISSION</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-4">India mein lakho chote businesses Instagram pe bechte hain — clothes, food, courses, services. Lekin har DM ka reply manually dena practically impossible hai.</p>
              <p className="text-white/50 text-sm leading-relaxed mb-4">LeadMachine ka solution: <strong className="text-white">User DM kare → Bot qualify kare → Lead capture ho → Aap sirf converted leads se baat karo.</strong></p>
              <p className="text-white/50 text-sm leading-relaxed">100% Meta policy compliant. Direct Webhook. No third-party apps. Firebase secured.</p>
            </div>
            <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-2xl p-10 text-center">
              <div className="text-6xl mb-4">🇮🇳</div>
              <div className="font-black text-xl mb-2">Made in India</div>
              <div className="text-sm text-white/40">Indian businesses ke liye</div>
              <div className="flex justify-center gap-8 mt-6 pt-6 border-t border-white/[0.07]">
                {[['₹0','to start'],['24/7','bot active'],['6','step flow']].map(([n,l])=>(
                  <div key={l}><div className="font-black text-2xl text-[#ff6b00]">{n}</div><div className="font-mono text-xs text-white/30 mt-1">{l}</div></div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-0 divide-y divide-white/[0.07] border border-white/[0.07] rounded-2xl overflow-hidden mb-16">
            {[
              ['🆓','Free First Philosophy','Har Indian business ko free mein start karne ka right hai. Free plan hamesha free rahega.'],
              ['🔒','Privacy First','Aapke leads ka data aapka hai. Hum kabhi third party ko sell nahi karte.'],
              ['⚡','Simple Rakho','Setup 5 minutes. No tech knowledge required. Bana lo aur chala lo.'],
            ].map(([icon,title,desc])=>(
              <div key={title as string} className="flex items-start gap-5 p-6 bg-[#0f0f1a] hover:bg-[#131320] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/20 flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
                <div><div className="font-bold text-sm mb-1">{title}</div><div className="text-sm text-white/40 leading-relaxed">{desc}</div></div>
              </div>
            ))}
          </div>

          <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-2xl p-16 text-center">
            <h2 className="font-black text-4xl tracking-tight mb-4">ABHI SHURU KARO 🚀</h2>
            <p className="text-white/40 mb-8">Hazar businesses pehle se use kar rahe hain.</p>
            <Link href="/signup" className="inline-flex px-10 py-4 rounded-xl font-black text-sm bg-[#ff6b00] text-black hover:bg-[#ff8c38] transition-all hover:shadow-[0_6px_28px_rgba(255,107,0,0.5)]">FREE ACCOUNT BANAO →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
