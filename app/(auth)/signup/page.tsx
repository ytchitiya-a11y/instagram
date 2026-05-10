'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signUpEmail, signInGoogle } from '@/lib/firebase';

export default function SignupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm]   = useState({ name:'', business:'', email:'', pass:'' });
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);

  useEffect(() => { if (!loading && user) router.replace('/dashboard'); }, [user, loading]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await signUpEmail(form.email, form.pass, form.name, form.business);
      router.replace('/dashboard');
    } catch (err: any) {
      const c = err.code || '';
      setError(c.includes('email-already-in-use') ? 'Email already registered. Login karo.' :
               c.includes('weak-password')         ? 'Password kam se kam 6 characters.' :
               c.includes('invalid-email')          ? 'Email valid nahi hai.' : 'Signup failed. Try again.');
    } finally { setBusy(false); }
  };

  const handleGoogle = async () => {
    setBusy(true); setError('');
    try { await signInGoogle(); router.replace('/dashboard'); }
    catch { setError('Google signup failed.'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#080810] flex items-center justify-center"><div className="spinner" /></div>;

  return (
    <div className="min-h-screen bg-[#080810] grid md:grid-cols-2">
      {/* Left */}
      <div className="hidden md:flex flex-col justify-between p-10 bg-[#0d0d18] border-r border-white/[0.07] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(255,107,0,0.09),transparent)]" />
        <Link href="/" className="font-black text-xl tracking-tight text-white relative z-10">LEAD<span className="text-[#ff6b00]">MACHINE</span></Link>
        <div className="relative z-10">
          <h2 className="font-black text-[clamp(40px,5vw,60px)] leading-[0.9] tracking-tighter mb-6">4 STEPS<br/>MEIN <span className="text-[#ff6b00]">LIVE</span></h2>
          {[
            ['1','Account banao','Email ya Google — 30 seconds'],
            ['2','Instagram connect karo','Facebook Login → auto-link'],
            ['3','Website link add karo','Jo DM mein bhejni hai'],
            ['4','Bot auto-activate 🔥','Leads aane shuru!'],
          ].map(([n,t,s]) => (
            <div key={n} className="flex items-start gap-4 py-4 border-b border-white/[0.07] last:border-0">
              <div className="w-8 h-8 rounded-full bg-[#ff6b00] flex items-center justify-center font-black text-sm text-black flex-shrink-0">{n}</div>
              <div><div className="font-bold text-sm">{t}</div><div className="text-xs text-white/40">{s}</div></div>
            </div>
          ))}
        </div>
        <div className="font-mono text-xs text-white/30 relative z-10">FREE PLAN · NO CARD NEEDED</div>
      </div>

      {/* Right */}
      <div className="flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-sm rise">
          <Link href="/" className="md:hidden font-black text-xl tracking-tight block mb-8">LEAD<span className="text-[#ff6b00]">MACHINE</span></Link>
          <h1 className="font-black text-4xl tracking-tight mb-1">FREE<br/>ACCOUNT</h1>
          <p className="text-white/40 text-sm mb-7">7 din free trial. Koi card nahi.</p>

          {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          <button onClick={handleGoogle} disabled={busy}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-[#1a1a2a] border border-white/[0.12] text-sm font-semibold text-white hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all mb-4 disabled:opacity-40">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google se Signup karo
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/[0.07]"/><span className="font-mono text-[10px] uppercase tracking-widest text-white/30">ya email se</span><div className="flex-1 h-px bg-white/[0.07]"/>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { k:'name',     label:'Full Name',      ph:'Rahul Sharma',         type:'text'     },
              { k:'business', label:'Business Name',  ph:'My Brand / Meri Dukan',type:'text'     },
              { k:'email',    label:'Email',           ph:'aap@example.com',      type:'email'    },
              { k:'pass',     label:'Password',        ph:'Min 6 characters',     type:'password' },
            ].map(({ k, label, ph, type }) => (
              <div key={k}>
                <label className="block text-[11px] font-bold tracking-[1.5px] uppercase text-white/40 mb-2">{label}</label>
                <input type={type} value={(form as any)[k]} onChange={set(k)} required minLength={k==='pass'?6:undefined}
                  className="w-full bg-[#0d0d18] border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.08)] transition-all placeholder:text-white/20"
                  placeholder={ph}/>
              </div>
            ))}
            <button type="submit" disabled={busy}
              className="w-full py-3 rounded-lg font-bold text-sm bg-[#ff6b00] text-black hover:bg-[#ff8c38] transition-all hover:shadow-[0_4px_20px_rgba(255,107,0,0.4)] disabled:opacity-40 flex items-center justify-center gap-2">
              {busy ? <><span className="spinner border-black/20 border-t-black"/>&nbsp;Creating...</> : 'ACCOUNT BANAO →'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-5">Already account hai? <Link href="/login" className="text-[#ff6b00] font-semibold hover:underline">Login karo →</Link></p>
          <p className="text-center text-xs text-white/20 mt-3">Account banane par <Link href="/terms" className="hover:text-white/40">Terms</Link> & <Link href="/privacy" className="hover:text-white/40">Privacy</Link> se agree karte ho।</p>
        </div>
      </div>
    </div>
  );
}
