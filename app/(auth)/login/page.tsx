'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signInEmail, signInGoogle } from '@/lib/firebase';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail]   = useState('');
  const [pass,  setPass]    = useState('');
  const [error, setError]   = useState('');
  const [busy,  setBusy]    = useState(false);

  useEffect(() => { if (!loading && user) router.replace('/dashboard'); }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await signInEmail(email, pass);
      router.replace('/dashboard');
    } catch (err: any) {
      const code = err.code || '';
      setError(code.includes('user-not-found') ? 'Account nahi mila.' :
               code.includes('wrong-password')  ? 'Password galat hai.' :
               code.includes('invalid-email')   ? 'Email valid nahi.' :
               code.includes('too-many-requests')? 'Bahut attempts. Thodi der baad try karo.' :
               'Login failed. Try again.');
    } finally { setBusy(false); }
  };

  const handleGoogle = async () => {
    setBusy(true); setError('');
    try { await signInGoogle(); router.replace('/dashboard'); }
    catch { setError('Google login failed.'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#080810] flex items-center justify-center"><div className="spinner" /></div>;

  return (
    <div className="min-h-screen bg-[#080810] grid md:grid-cols-2">
      {/* Left visual */}
      <div className="hidden md:flex flex-col justify-between p-10 bg-[#0d0d18] border-r border-white/[0.07] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_110%,rgba(255,107,0,0.08),transparent)]" />
        <Link href="/" className="font-black text-xl tracking-tight text-white relative z-10">
          LEAD<span className="text-[#ff6b00]">MACHINE</span>
        </Link>
        <div className="relative z-10">
          <h2 className="font-black text-[clamp(40px,5vw,70px)] leading-[0.9] tracking-tighter mb-5">
            LEADS ON<br/><span className="text-[#ff6b00]">AUTO</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">Instagram DMs automatically leads mein convert ho rahe hain.</p>
          <div className="flex flex-wrap gap-2 mt-6">
            {['Instagram Graph API','Firebase Auth','Hinglish Bot','Free Trial'].map(t => (
              <span key={t} className="font-mono text-[10px] px-3 py-1.5 rounded-full bg-white/5 border border-white/[0.07] text-white/50">{t}</span>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-sm text-white/30 italic">"Pehle 50 DMs manually handle karte the. Ab sab automatic."</p>
          <p className="font-mono text-xs text-white/20 mt-2">— Rahul Sharma, Delhi</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-sm rise">
          <Link href="/" className="md:hidden font-black text-xl tracking-tight block mb-8">
            LEAD<span className="text-[#ff6b00]">MACHINE</span>
          </Link>
          <h1 className="font-black text-4xl tracking-tight mb-1">WELCOME<br/>BACK</h1>
          <p className="text-white/40 text-sm mb-7">Apne account mein login karo.</p>

          {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          {/* Google */}
          <button onClick={handleGoogle} disabled={busy}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-[#1a1a2a] border border-white/[0.12] text-sm font-semibold text-white hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all mb-4 disabled:opacity-40">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google se Login karo
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/[0.07]"/><span className="font-mono text-[10px] uppercase tracking-widest text-white/30">ya</span><div className="flex-1 h-px bg-white/[0.07]"/>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[1.5px] uppercase text-white/40 mb-2">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                className="w-full bg-[#0d0d18] border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.08)] transition-all placeholder:text-white/20"
                placeholder="aap@example.com"/>
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[1.5px] uppercase text-white/40 mb-2">Password</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required
                className="w-full bg-[#0d0d18] border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.08)] transition-all placeholder:text-white/20"
                placeholder="••••••••"/>
            </div>
            <button type="submit" disabled={busy}
              className="w-full py-3 rounded-lg font-bold text-sm bg-[#ff6b00] text-black hover:bg-[#ff8c38] transition-all hover:shadow-[0_4px_20px_rgba(255,107,0,0.4)] disabled:opacity-40 flex items-center justify-center gap-2">
              {busy ? <><span className="spinner border-black/20 border-t-black"/>&nbsp;Logging in...</> : 'LOGIN KARO →'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Account nahi hai? <Link href="/signup" className="text-[#ff6b00] font-semibold hover:underline">Free mein banao →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
