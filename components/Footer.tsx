import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] py-9 px-6">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="font-black text-lg tracking-tight">
          LEAD<span className="text-[#ff6b00]">MACHINE</span>
        </div>
        <div className="flex gap-5 flex-wrap">
          {[
            { href: '/pricing',  label: 'Pricing' },
            { href: '/about',    label: 'About' },
            { href: '/contact',  label: 'Contact' },
            { href: '/terms',    label: 'Terms' },
            { href: '/privacy',  label: 'Privacy' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm text-white/40 hover:text-white/70 transition-colors">
              {label}
            </Link>
          ))}
        </div>
        <div className="font-mono text-xs text-white/30">© 2025 LEADMACHINE · 🇮🇳</div>
      </div>
    </footer>
  );
}
