'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, logOut, timeAgo, fmtDate } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

type AdminPage = 'overview'|'users'|'revenue'|'leads'|'bots'|'settings';

export default function AdminDashboard() {
  const router = useRouter();
  const [pg,       setPg]      = useState<AdminPage>('overview');
  const [admin,    setAdmin]   = useState<any>(null);
  const [users,    setUsers]   = useState<any[]>([]);
  const [allLeads, setLeads]   = useState<any[]>([]);
  const [payments, setPay]     = useState<any[]>([]);
  const [search,   setSearch]  = useState('');
  const [toast,    setToast]   = useState('');
  const [loading,  setLoading] = useState(true);
  const [modal,    setModal]   = useState<any>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(''), 3000); };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.replace('/admin'); return; }
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists() || !snap.data().is_admin) { await logOut(); router.replace('/admin'); return; }
      setAdmin({ uid: user.uid, ...snap.data() });
      await loadAll();
      setLoading(false);
    });
    return unsub;
  }, []);

  const loadAll = async () => {
    // Users
    const uSnap = await getDocs(collection(db, 'users'));
    const uList = uSnap.docs.map(d => ({ uid: d.id, ...d.data(), _leads: 0 }));

    // Lead counts
    const leads: any[] = [];
    for (const u of uList) {
      try {
        const lSnap = await getDocs(query(collection(db, 'users', u.uid, 'leads'), orderBy('created_at','desc')));
        const ul = lSnap.docs.map(d => ({ id: d.id, ownerUid: u.uid, ownerName: u.name||u.email, ...d.data() }));
        u._leads = ul.length;
        leads.push(...ul);
      } catch {}
    }

    // Payments
    try {
      const pSnap = await getDocs(query(collection(db, 'payments'), orderBy('created_at','desc')));
      setPay(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { setPay([]); }

    setUsers(uList);
    setLeads(leads);
  };

  const now = () => new Date();
  const isPaid  = (u: any) => u.paid_until?._seconds  && new Date(u.paid_until._seconds*1000)  > now();
  const isTrial = (u: any) => !isPaid(u) && u.trial_ends_at?._seconds && new Date(u.trial_ends_at._seconds*1000) > now();
  const planLabel = (u: any) => isPaid(u)?'PRO':isTrial(u)?'TRIAL':'EXPIRED';
  const daysLeft  = (u: any) => {
    const d = isPaid(u) ? new Date(u.paid_until._seconds*1000) : isTrial(u) ? new Date(u.trial_ends_at._seconds*1000) : null;
    if (!d) return 'Expired';
    return Math.ceil((d.getTime()-Date.now())/86400000)+'d';
  };
  const planCls = (u: any) => isPaid(u)?'bg-green-400/10 text-green-400 border-green-400/20':isTrial(u)?'bg-yellow-400/10 text-yellow-400 border-yellow-400/20':'bg-red-400/10 text-red-400 border-red-400/20';

  const activePaid  = users.filter(isPaid).length;
  const activeTrial = users.filter(isTrial).length;
  const mrr         = activePaid * 499;
  const totalRev    = payments.reduce((s,p) => s+(p.amount||499), 0);

  const toggleBot = async (uid: string, val: boolean) => {
    await updateDoc(doc(db,'users',uid), { bot_active: val, updated_at: serverTimestamp() });
    setUsers(u => u.map(x => x.uid===uid ? {...x,bot_active:val} : x));
    showToast(val ? '🤖 Bot activated' : 'Bot deactivated');
  };

  const grantPro = async (uid: string, name: string) => {
    if (!confirm(`Grant 30-day Pro to ${name}?`)) return;
    const d = new Date(Date.now()+30*86400000);
    await updateDoc(doc(db,'users',uid), { plan:'paid', paid_until: d, bot_active:true, updated_at: serverTimestamp() });
    await loadAll();
    showToast('✅ Pro granted to '+name);
    setModal(null);
  };

  const suspend = async (uid: string) => {
    if (!confirm('Suspend this user?')) return;
    await updateDoc(doc(db,'users',uid), { bot_active:false, suspended:true, updated_at: serverTimestamp() });
    await loadAll();
    showToast('User suspended'); setModal(null);
  };

  const makeAdmin = async (uid: string) => {
    await updateDoc(doc(db,'users',uid), { is_admin:true, updated_at:serverTimestamp() });
    showToast('✅ Admin granted!');
  };

  const exportCSV = (rows: any[][], headers: string[]) => {
    const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'),{ href:URL.createObjectURL(new Blob([csv],{type:'text/csv'})), download:`export_${Date.now()}.csv`});
    a.click();
  };

  const SbItem = ({ id, icon, label, count }: { id:AdminPage; icon:string; label:string; count?:number }) => (
    <button onClick={()=>setPg(id)} className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${pg===id?'bg-purple-500/10 text-purple-400':'text-white/40 hover:text-white hover:bg-white/5'}`}>
      <span className="w-4 text-center text-sm">{icon}</span>{label}
      {count!==undefined && <span className="ml-auto font-mono text-[10px] bg-white/5 text-white/25 px-1.5 py-0.5 rounded">{count}</span>}
    </button>
  );

  const filtered = users.filter(u => !search || (u.name||'').toLowerCase().includes(search.toLowerCase()) || (u.email||'').toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="min-h-screen bg-[#07070e] flex items-center justify-center"><div className="spinner"/></div>;

  return (
    <div className="min-h-screen bg-[#07070e] flex text-white">
      {/* Sidebar */}
      <aside className="w-48 flex-shrink-0 border-r border-white/[0.06] flex flex-col sticky top-0 h-screen bg-[#07070e]">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-2.5">
          <div className="w-7 h-7 bg-purple-500 rounded-lg flex items-center justify-center text-xs font-black text-black">👑</div>
          <span className="font-black text-sm tracking-tight">LEAD<span className="text-purple-400">MACHINE</span></span>
        </div>
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          <p className="font-mono text-[8px] tracking-[2px] uppercase text-white/20 px-3 pt-2 pb-1">Overview</p>
          <SbItem id="overview" icon="📊" label="Dashboard"/>
          <SbItem id="revenue"  icon="💰" label="Revenue"/>
          <p className="font-mono text-[8px] tracking-[2px] uppercase text-white/20 px-3 pt-3 pb-1">Manage</p>
          <SbItem id="users"    icon="👥" label="Users"    count={users.length}/>
          <SbItem id="leads"    icon="📥" label="Leads"    count={allLeads.length}/>
          <SbItem id="bots"     icon="🤖" label="Bot Status"/>
          <p className="font-mono text-[8px] tracking-[2px] uppercase text-white/20 px-3 pt-3 pb-1">System</p>
          <SbItem id="settings" icon="⚙️" label="Settings"/>
        </nav>
        <div className="p-2.5 border-t border-white/[0.06]">
          <button onClick={async()=>{await logOut();router.push('/admin');}} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-white/25 hover:text-white/50 transition-colors">🚪 Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="sticky top-0 z-10 h-12 border-b border-white/[0.06] bg-[#07070e]/90 backdrop-blur-xl flex items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]"/>
            <span className="font-mono text-xs text-white/30">{pg.toUpperCase()}</span>
          </div>
          <span className="text-xs text-white/30">{admin?.name || 'Admin'}</span>
        </div>

        <div className="flex-1 p-5 max-w-6xl mx-auto w-full">

          {/* OVERVIEW */}
          {pg==='overview' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h1 className="font-black text-xl tracking-tight">DASHBOARD</h1>
                <button onClick={loadAll} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/[0.1] text-white/40 hover:text-white transition-colors">↻ Refresh</button>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[['Total Users',users.length,'text-purple-400'],['Active Paid',activePaid,'text-green-400'],['Trial Active',activeTrial,'text-yellow-400'],['MRR','₹'+mrr.toLocaleString('en-IN'),'text-white']].map(([l,v,c])=>(
                  <div key={l as string} className="bg-[#0d0d18] border border-white/[0.06] rounded-xl p-4">
                    <p className="font-mono text-[8px] tracking-[2px] uppercase text-white/25 mb-2">{l}</p>
                    <p className={`font-black text-3xl tracking-tight ${c}`}>{v}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0d0d18] border border-white/[0.06] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.06] text-xs font-bold">Recent Signups</div>
                  {users.slice(0,5).map(u=>(
                    <div key={u.uid} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">{(u.name||'?')[0].toUpperCase()}</div>
                      <div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate">{u.name||'—'}</p><p className="font-mono text-[10px] text-white/30 truncate">{u.email}</p></div>
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${planCls(u)}`}>{planLabel(u)}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-[#0d0d18] border border-white/[0.06] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.06] text-xs font-bold">Recent Payments</div>
                  {payments.length===0 ? <p className="text-center py-8 text-white/25 text-xs">No payments yet</p> :
                    payments.slice(0,5).map(p=>(
                      <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0">
                        <div className="flex-1 text-xs font-semibold">{p.userName||'—'}</div>
                        <div className="font-black text-base text-green-400">₹{p.amount||499}</div>
                        <div className="font-mono text-[10px] text-white/25">{timeAgo(p.created_at)}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* REVENUE */}
          {pg==='revenue' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h1 className="font-black text-xl tracking-tight">REVENUE 💰</h1>
                <button onClick={()=>exportCSV(payments.map(p=>[p.userName||'',p.userEmail||'',p.amount||499,'Paid',fmtDate(p.created_at)]),['User','Email','Amount','Status','Date'])} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/[0.1] text-white/40 hover:text-white transition-colors">↓ Export</button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[['Total Revenue','₹'+totalRev.toLocaleString('en-IN'),'text-green-400'],['MRR','₹'+mrr.toLocaleString('en-IN'),'text-purple-400'],['Active Subs',activePaid,'text-yellow-400']].map(([l,v,c])=>(
                  <div key={l as string} className="bg-[#0d0d18] border border-white/[0.06] rounded-xl p-5">
                    <p className="font-mono text-[8px] tracking-[2px] uppercase text-white/25 mb-2">{l}</p>
                    <p className={`font-black text-3xl tracking-tight ${c}`}>{v}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#0d0d18] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1.5fr_1fr_80px_80px_110px] px-4 py-2.5 border-b border-white/[0.06]">
                  {['User','Plan','Amount','Status','Date'].map(h=><p key={h} className="font-mono text-[8px] tracking-[2px] uppercase text-white/25">{h}</p>)}
                </div>
                {payments.length===0 ? <p className="text-center py-10 text-white/25 text-xs">No payments yet</p> :
                  payments.map(p=>(
                    <div key={p.id} className="grid grid-cols-[1.5fr_1fr_80px_80px_110px] items-center px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                      <div><p className="text-xs font-semibold">{p.userName||'—'}</p><p className="font-mono text-[10px] text-white/30">{p.userEmail||''}</p></div>
                      <p className="text-xs text-white/50">Pro Plan</p>
                      <p className="font-bold text-sm text-green-400">₹{p.amount||499}</p>
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded border bg-green-400/10 text-green-400 border-green-400/20 w-fit">Paid</span>
                      <p className="font-mono text-[10px] text-white/30">{fmtDate(p.created_at)}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* USERS */}
          {pg==='users' && (
            <div>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h1 className="font-black text-xl tracking-tight">USERS 👥 <span className="text-white/30 font-mono text-sm">({users.length})</span></h1>
                <div className="flex gap-2">
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search..." className="bg-[#0d0d18] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-500 w-40 placeholder:text-white/20"/>
                  <button onClick={()=>exportCSV(users.map(u=>[u.name||'',u.email||'',u.business_name||'',planLabel(u),u._leads||0,u.bot_active?'Yes':'No',fmtDate(u.created_at)]),['Name','Email','Business','Plan','Leads','Bot','Joined'])} className="px-3 py-2 rounded-lg text-xs font-bold border border-white/[0.1] text-white/40 hover:text-white transition-colors">↓ CSV</button>
                </div>
              </div>
              <div className="bg-[#0d0d18] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="grid grid-cols-[28px_1.6fr_1fr_90px_60px_80px_80px_90px] px-4 py-2.5 border-b border-white/[0.06] gap-2">
                  {['','User','Business','Plan','Leads','Bot','IG','Actions'].map(h=><p key={h} className="font-mono text-[8px] tracking-[2px] uppercase text-white/25">{h}</p>)}
                </div>
                {filtered.map(u=>(
                  <div key={u.uid} className="grid grid-cols-[28px_1.6fr_1fr_90px_60px_80px_80px_90px] items-center px-4 py-2.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[9px]">{(u.name||'?')[0].toUpperCase()}</div>
                    <div className="min-w-0"><p className="text-xs font-semibold truncate">{u.name||'—'}</p><p className="font-mono text-[9px] text-white/30 truncate">{u.email}</p></div>
                    <p className="font-mono text-[10px] text-white/40 truncate">{u.business_name||'—'}</p>
                    <div><span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${planCls(u)}`}>{planLabel(u)}</span><p className="font-mono text-[9px] text-white/25 mt-0.5">{daysLeft(u)}</p></div>
                    <p className="font-mono text-xs text-white/50">{u._leads||0}</p>
                    <button onClick={()=>toggleBot(u.uid,!u.bot_active)} className={`relative w-9 h-5 rounded-full transition-all ${u.bot_active?'bg-green-400':'bg-white/10'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${u.bot_active?'left-[calc(100%-18px)]':'left-0.5'}`}/>
                    </button>
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border w-fit ${u.ig_connected?'bg-green-400/10 text-green-400 border-green-400/20':'bg-white/5 text-white/25 border-white/10'}`}>{u.ig_connected?'✓':'-'}</span>
                    <div className="flex gap-1">
                      <button onClick={()=>setModal(u)} className="px-2 py-1 rounded text-[10px] font-bold border border-white/[0.1] text-white/40 hover:text-white transition-colors">View</button>
                      <button onClick={()=>grantPro(u.uid,u.name||'')} className="px-2 py-1 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors">Pro</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEADS */}
          {pg==='leads' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h1 className="font-black text-xl tracking-tight">ALL LEADS 📥 <span className="text-white/30 font-mono text-sm">({allLeads.length})</span></h1>
                <button onClick={()=>exportCSV(allLeads.map(l=>[l.name||'',l.ownerName||'',l.business_type||'',l.product||'',l.budget||'',l.status||'',fmtDate(l.created_at)]),['Lead','Owner','Business','Product','Budget','Status','Date'])} className="px-3 py-2 rounded-lg text-xs font-bold border border-white/[0.1] text-white/40 hover:text-white transition-colors">↓ CSV</button>
              </div>
              <div className="bg-[#0d0d18] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="grid grid-cols-[24px_1.4fr_1fr_1fr_85px_90px] px-4 py-2.5 border-b border-white/[0.06] gap-2">
                  {['','Lead','Owner','Business','Status','Date'].map(h=><p key={h} className="font-mono text-[8px] tracking-[2px] uppercase text-white/25">{h}</p>)}
                </div>
                {allLeads.length===0 ? <p className="text-center py-10 text-white/25 text-xs">No leads yet</p> :
                  allLeads.map(l=>(
                    <div key={l.id} className="grid grid-cols-[24px_1.4fr_1fr_1fr_85px_90px] items-center px-4 py-2.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] gap-2">
                      <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[9px]">{(l.name||'?')[0].toUpperCase()}</div>
                      <div><p className="text-xs font-semibold">{l.name||'—'}</p><p className="font-mono text-[9px] text-white/30">{l.ig_user_id||''}</p></div>
                      <p className="font-mono text-[10px] text-white/40">{l.ownerName||'—'}</p>
                      <p className="font-mono text-[10px] text-white/40 truncate">{l.business_type||'—'}</p>
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border w-fit ${l.status==='converted'?'bg-green-400/10 text-green-400 border-green-400/20':'bg-white/5 text-white/25 border-white/10'}`}>{l.status==='converted'?'✅ YES':'Active'}</span>
                      <p className="font-mono text-[9px] text-white/30">{fmtDate(l.created_at)}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* BOTS */}
          {pg==='bots' && (
            <div>
              <h1 className="font-black text-xl tracking-tight mb-5">BOT STATUS 🤖</h1>
              <div className="bg-[#0d0d18] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="grid grid-cols-[24px_1.5fr_1fr_90px_90px_80px] px-4 py-2.5 border-b border-white/[0.06] gap-2">
                  {['','User','Instagram','Plan','Bot','Force'].map(h=><p key={h} className="font-mono text-[8px] tracking-[2px] uppercase text-white/25">{h}</p>)}
                </div>
                {users.map(u=>(
                  <div key={u.uid} className="grid grid-cols-[24px_1.5fr_1fr_90px_90px_80px] items-center px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[9px]">{(u.name||'?')[0].toUpperCase()}</div>
                    <div><p className="text-xs font-semibold">{u.name||'—'}</p><p className="font-mono text-[9px] text-white/30">{u.email}</p></div>
                    <p className="font-mono text-[10px] text-white/40">{u.ig_page_name||'Not connected'}</p>
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${planCls(u)}`}>{planLabel(u)}</span>
                    <button onClick={()=>toggleBot(u.uid,!u.bot_active)} className={`relative w-9 h-5 rounded-full transition-all ${u.bot_active?'bg-green-400':'bg-white/10'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${u.bot_active?'left-[calc(100%-18px)]':'left-0.5'}`}/>
                    </button>
                    <button onClick={()=>toggleBot(u.uid,!u.bot_active)} className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${u.bot_active?'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20':'bg-green-400/10 text-green-400 border border-green-400/20 hover:bg-green-400/20'}`}>
                      {u.bot_active?'Stop':'Start'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {pg==='settings' && (
            <div>
              <h1 className="font-black text-xl tracking-tight mb-5">SETTINGS ⚙️</h1>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0d0d18] border border-white/[0.06] rounded-xl p-5">
                  <h3 className="font-bold text-sm mb-4">Grant Admin Access</h3>
                  <label className="block text-[10px] font-bold tracking-[1.5px] uppercase text-white/30 mb-2">Firebase User UID</label>
                  <input id="admin-uid" placeholder="Firebase UID" className="w-full bg-[#07070e] border border-white/[0.1] rounded-lg px-3 py-2.5 text-xs text-white font-mono outline-none focus:border-purple-500 placeholder:text-white/20 mb-3"/>
                  <button onClick={()=>{ const uid=(document.getElementById('admin-uid') as HTMLInputElement)?.value; if(uid) makeAdmin(uid); }} className="px-4 py-2 rounded-lg font-bold text-xs bg-purple-500 text-black hover:bg-purple-400 transition-all">Grant Admin</button>
                  <p className="text-[10px] text-white/25 mt-2">Firebase Console → Firestore → users → UID → is_admin = true</p>
                </div>
                <div className="bg-[#0d0d18] border border-white/[0.06] rounded-xl p-5">
                  <h3 className="font-bold text-sm mb-4">Platform Stats</h3>
                  {[['Total Users',users.length],['Active Paid',activePaid],['Active Trial',activeTrial],['Total Revenue','₹'+totalRev.toLocaleString('en-IN')],['MRR','₹'+mrr.toLocaleString('en-IN')]].map(([l,v])=>(
                    <div key={l as string} className="flex justify-between py-2.5 border-b border-white/[0.05] last:border-0 text-sm">
                      <span className="text-white/40 text-xs">{l}</span>
                      <span className="font-bold text-white text-xs">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={()=>setModal(null)}>
          <div className="bg-[#0d0d18] border border-white/[0.1] rounded-2xl p-6 w-full max-w-md" onClick={e=>e.stopPropagation()}>
            <h3 className="font-black text-xl tracking-tight mb-4">{(modal.name||'USER').toUpperCase()}</h3>
            <div className="space-y-0 divide-y divide-white/[0.06]">
              {[['Email',modal.email||'—'],['Business',modal.business_name||'—'],['Plan',planLabel(modal)],['Days Left',daysLeft(modal)],['Bot Active',modal.bot_active?'✅ Yes':'❌ No'],['IG Connected',modal.ig_connected?'✅ '+( modal.ig_page_name||'Yes'):'❌ No'],['Total Leads',modal._leads||0],['Joined',fmtDate(modal.created_at)]].map(([k,v])=>(
                <div key={k as string} className="flex justify-between py-2.5 text-sm">
                  <span className="text-white/30 text-xs font-mono">{k}</span>
                  <span className="font-medium text-xs">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={()=>setModal(null)} className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-white/[0.1] text-white/40 hover:text-white transition-colors">Close</button>
              <button onClick={()=>suspend(modal.uid)} className="px-4 py-2.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">🚫 Suspend</button>
              <button onClick={()=>grantPro(modal.uid,modal.name||'')} className="px-4 py-2.5 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors">⚡ Grant Pro</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-5 right-5 bg-[#0d0d18] border border-white/[0.1] rounded-xl px-4 py-3 text-xs text-white shadow-2xl z-50">{toast}</div>}
    </div>
  );
}
