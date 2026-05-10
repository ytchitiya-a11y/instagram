'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInEmail, auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists() && snap.data().is_admin) router.replace('/admin/dashboard');
    });
    return unsub;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const user = await signInEmail(email, pass);
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists() || !snap.data().is_admin) {
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
        throw new Error('Admin access nahi hai.');
      }
      router.replace('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#07070e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-[#0d0d18] border border-white/[0.06] rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center text-base font-black text-black">👑</div>
          <span className="font-black text-lg tracking-tight">LEAD<span className="text-purple-400">MACHINE</span></span>
        </div>
        <h1 className="font-black text-3xl tracking-tight mb-1 text-white">ADMIN<br/>LOGIN</h1>
        <p className="font-mono text-[10px] text-white/25 mb-7 tracking-widest">// restricted area</p>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[['Admin Email','email',email,setEmail,'admin@leadmachine.in'],['Password','password',pass,setPass,'••••••••']].map(([l,t,v,sv,ph]: any)=>(
            <div key={l}>
              <label className="block text-[11px] font-bold tracking-[1.5px] uppercase text-white/30 mb-2">{l}</label>
              <input type={t} value={v} onChange={(e:any)=>sv(e.target.value)} placeholder={ph} required
                className="w-full bg-[#07070e] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 placeholder:text-white/20"/>
            </div>
          ))}
          <button type="submit" disabled={busy}
            className="w-full py-3 rounded-lg font-black text-sm bg-purple-500 text-black hover:bg-purple-400 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
            {busy ? <><span className="spinner border-black/20 border-t-black"/>Verifying...</> : 'LOGIN →'}
          </button>
        </form>
        <p className="text-center text-xs text-white/20 mt-5 font-mono">🔒 Unauthorized attempts logged</p>
      </div>
    </div>
  );
}
