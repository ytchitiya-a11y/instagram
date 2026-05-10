'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logOut } from '@/lib/firebase';

export default function Navbar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    await logOut();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#080810]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-black text-xl tracking-tight text-white">
          LEAD<span className="text-[#ff6b00]">MACHINE</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { href: '/pricing', label: 'Pricing' },
            { href: '/about',   label: 'About' },
            { href: '/contact', label: 'Contact' },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === href ? 'text-[#ff6b00]' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-20 h-8 bg-white/5 rounded-md animate-pulse" />
          ) : user ? (
            <>
              <Link href="/dashboard"
                className="px-3 py-1.5 rounded-md text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                Dashboard
              </Link>
              <button onClick={handleLogout}
                className="px-3 py-1.5 rounded-md text-sm font-semibold text-white/40 hover:text-white transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login"
                className="px-3 py-1.5 rounded-md text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                Login
              </Link>
              <Link href="/signup"
                className="px-4 py-2 rounded-md text-sm font-bold bg-[#ff6b00] text-black hover:bg-[#ff8c38] transition-all hover:shadow-[0_4px_20px_rgba(255,107,0,0.4)] hover:-translate-y-0.5">
                7 Din Free →
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
