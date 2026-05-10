'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { saveProfile, getLeads, calcStats, exportCSV, getPlanStatus, logOut,
         FLOW_TEMPLATE, injectVars, isTrigger, detectLang, timeAgo, Lead } from '@/lib/firebase';

type Page = 'overview' | 'leads' | 'instagram' | 'template' | 'simulator' | 'settings';

export default function DashboardPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router  = useRouter();
  const [page,  setPage]   = useState<Page>('overview');
  const [leads, setLeads]  = useState<Lead[]>([]);
  const [busy,  setBusy]   = useState(false);
  const [toast, setToast]  = useState('');
  const [search,setSearch] = useState('');
  const [cfg,   setCfg]    = useState({ biz:'', link:'', offer:'' });

  // Simulator state
  const [msgs,  setMsgs]   = useState<{text:string;type:'bot'|'user'|'sys'}[]>([{ text:'"hi" ya "price" type karo', type:'sys' }]);
  const [input, setInput]  = useState('');
  const [sim,   setSim]    = useState<any>({ step:0, flow:null, data:{}, lang:'hi' });
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [user, loading]);
  useEffect(() => {
    if (profile) {
      setCfg({ biz: profile.business_name||'', link: profile.website_link||'', offer: profile.offer_text||'' });
      loadLeads();
    }
  }, [profile]);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [msgs]);

  const loadLeads = async () => { if (user) setLeads(await getLeads(user.uid)); };
  const showToast = (msg: string, dur=3000) => { setToast(msg); setTimeout(() => setToast(''), dur); };

  const saveCfg = async () => {
    if (!user) return;
    setBusy(true);
    await saveProfile(user.uid, { business_name: cfg.biz, website_link: cfg.link, offer_text: cfg.offer });
    await refreshProfile();
    showToast('✅ Config saved!');
    setBusy(false);
  };

  const toggleBot = async () => {
    if (!user || !profile) return;
    if (!profile.ig_connected) { showToast('❌ Pehle Instagram connect karo!'); setPage('instagram'); return; }
    await saveProfile(user.uid, { bot_active: !profile.bot_active });
    await refreshProfile();
    showToast(profile.bot_active ? 'Bot deactivated' : '🔥 Bot activated!');
  };

  const saveToken = async (token: string) => {
    if (!user || !token.trim()) return;
    await saveProfile(user.uid, { ig_access_token: token.trim(), ig_connected: true });
    await refreshProfile();
    showToast('✅ Instagram connected!');
  };

  // Simulator
  const addMsg = (text: string, type: 'bot'|'user'|'sys') => setMsgs(m => [...m, { text, type }]);
  const sendSimMsg = () => {
    const txt = input.trim(); if (!txt) return;
    addMsg(txt, 'user'); setInput('');
    setTimeout(() => processSimMsg(txt), 350);
  };
  const processSimMsg = (txt: string) => {
    const cfg2 = { website_link: profile?.website_link || 'https://yourwebsite.com' };
    if (!sim.flow) {
      if (!isTrigger(txt)) { addMsg("'hi' ya 'price' se shuru karo 😊", 'bot'); return; }
      const ns = { step:0, flow:FLOW_TEMPLATE, data:{} as any, lang:detectLang(txt) };
      setSim(ns);
      addMsg('— Flow started —', 'sys');
      const s = FLOW_TEMPLATE.steps[0];
      setTimeout(() => { addMsg(injectVars(s[ns.lang as 'hi'|'en']||s.hi, {...ns.data,...cfg2}), 'bot'); setSim((p:any)=>({...p,step:1})); }, 300);
    } else {
      const prev = sim.flow.steps[sim.step-1];
      let newData = { ...sim.data };
      if (prev?.save) { newData[prev.save] = txt; if (prev.save==='interest'&&txt.toLowerCase()==='yes') addMsg('🎉 CONVERTED!', 'sys'); }
      if (sim.step < sim.flow.steps.length) {
        const s = sim.flow.steps[sim.step];
        const msg = injectVars(s[sim.lang as 'hi'|'en']||s.hi, {...newData,...cfg2});
        setSim((p:any) => ({...p, step:p.step+1, data:newData}));
        setTimeout(() => addMsg(msg, 'bot'), 300);
      } else {
        const end = sim.flow[`end_${sim.lang}`];
        addMsg(injectVars(end, {...newData,...cfg2}), 'bot');
        addMsg('✅ Flow complete!', 'sys');
        setSim({ step:0, flow:null, data:{}, lang:'hi' });
      }
    }
  };
  const resetSim = () => { setSim({ step:0, flow:null, data:{}, lang:'hi' }); setMsgs([{ text:'"hi" ya "price" type karo', type:'sys' }]); };

  const plan = getPlanStatus(profile);
  const stats = calcStats(leads);
  const filtered = leads.filter(l => !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.business_type?.toLowerCase().includes(search.toLowerCase()));

  const sb = (id: Page, icon: string, label: string, count?: number) => (
    <button onClick={() => setPage(id)}
      className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${page===id ? 'bg-[#ff6b00]/10 text-[#ff6b00]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
      <span className="text-base w-5 text-center">{icon}</span>{label}
      {count !== undefined && <span className="ml-auto font-mono text-[10px] bg-white/5 text-white/30 px-2 py-0.5 rounded-full">{count}</span>}
    </button>
  );

  if (loading || !profile) return <div className="min-h-screen bg-[#080810] flex items-center justify-center"><div className="spinner"/></div>;

  return (
    <div className="min-h-screen bg-[#080810] flex">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 border-r border-white/[0.07] sticky top-0 h-screen flex flex-col bg-[#080810]">
        <div className="p-4 border-b border-white/[0.07]">
          <Link href="/" className="font-black text-base tracking-tight">LEAD<span className="text-[#ff6b00]">MACHINE</span></Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="font-mono text-[9px] tracking-[2px] uppercase text-white/20 px-3 pt-2 pb-1">Main</p>
          {sb('overview','📊','Overview')}
          {sb('leads','👥','Leads',leads.length)}
          <p className="font-mono text-[9px] tracking-[2px] uppercase text-white/20 px-3 pt-3 pb-1">Setup</p>
          {sb('instagram','📱','Instagram')}
          {sb('template','💬','Template')}
          {sb('simulator','🎮','Simulator')}
          <p className="font-mono text-[9px] tracking-[2px] uppercase text-white/20 px-3 pt-3 pb-1">Account</p>
          {sb('settings','⚙️','Settings')}
        </nav>
        <div className="p-3 border-t border-white/[0.07]">
          <button onClick={async () => { await logOut(); router.push('/'); }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/30 hover:text-white/60 transition-colors">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 h-14 border-b border-white/[0.07] bg-[#080810]/90 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${profile.bot_active ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-white/20'}`}/>
            <span className="font-mono text-xs text-white/40">{profile.bot_active ? 'Bot Active' : 'Bot Inactive'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-mono text-[10px] px-2.5 py-1 rounded border ${plan.isPaid ? 'bg-green-400/10 text-green-400 border-green-400/20' : plan.isTrial ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' : 'bg-red-400/10 text-red-400 border-red-400/20'}`}>
              {plan.isPaid ? 'PRO' : plan.isTrial ? `TRIAL · ${plan.daysLeft}d left` : 'EXPIRED'}
            </span>
            <span className="text-sm text-white/50">{profile.name}</span>
          </div>
        </div>

        <div className="p-6 max-w-5xl mx-auto">

          {/* OVERVIEW */}
          {page === 'overview' && (
            <div className="fade">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="font-black text-2xl tracking-tight">HEY, {profile.name?.split(' ')[0]?.toUpperCase()}! 👋</h1>
                  <p className="font-mono text-xs text-white/30 mt-1">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</p>
                </div>
                <button onClick={() => setPage('simulator')} className="px-4 py-2 rounded-lg text-sm font-bold bg-[#ff6b00] text-black hover:bg-[#ff8c38] transition-all">🎮 Test Bot</button>
              </div>

              {/* Bot hero */}
              <div className={`rounded-xl p-6 mb-5 border transition-all ${profile.bot_active ? 'bg-[#ff6b00]/5 border-[#ff6b00]/25' : 'bg-[#0f0f1a] border-white/[0.07]'}`}>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-black text-xl mb-1">{profile.bot_active ? '🔥 BOT IS LIVE' : 'BOT INACTIVE'}</h2>
                    <p className="text-sm text-white/50">{profile.bot_active ? 'DMs automatically handle ho rahe hain.' : profile.ig_connected ? 'Bot ready hai — ON karo.' : 'Pehle Instagram connect karo.'}</p>
                  </div>
                  <button onClick={toggleBot}
                    className={`relative w-14 h-7 rounded-full transition-all ${profile.bot_active ? 'bg-[#ff6b00]' : 'bg-white/10'}`}>
                    <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${profile.bot_active ? 'left-[calc(100%-26px)]' : 'left-0.5'}`}/>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[['Total Leads',stats.total,'text-[#ff6b00]'],['Converted',stats.converted,'text-green-400'],['Today',stats.today,'text-white'],['Conv. Rate',`${stats.rate}%`,'text-white']].map(([l,v,c])=>(
                  <div key={l as string} className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-4">
                    <p className="font-mono text-[9px] tracking-[2px] uppercase text-white/30 mb-2">{l}</p>
                    <p className={`font-black text-3xl tracking-tight ${c}`}>{v}</p>
                  </div>
                ))}
              </div>

              {/* Recent leads */}
              <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
                  <span className="font-semibold text-sm">Recent Leads</span>
                  <button onClick={() => setPage('leads')} className="text-xs text-[#ff6b00] hover:underline">View All →</button>
                </div>
                {leads.length === 0 ? <p className="text-center py-10 text-white/30 text-sm">Koi lead nahi abhi — bot activate karo</p> :
                  leads.slice(0,5).map(l => (
                    <div key={l.id} className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.05] hover:bg-white/[0.02] last:border-0">
                      <div className="w-7 h-7 rounded-full bg-[#ff6b00]/20 text-[#ff6b00] flex items-center justify-center font-bold text-xs flex-shrink-0">{(l.name||'?')[0].toUpperCase()}</div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{l.name||'—'}</p><p className="font-mono text-xs text-white/30 truncate">{l.business_type||'—'}</p></div>
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${l.status==='converted'?'bg-green-400/10 text-green-400 border-green-400/20':'bg-white/5 text-white/30 border-white/10'}`}>{l.status==='converted'?'✅ YES':'Active'}</span>
                      <span className="font-mono text-xs text-white/20">{timeAgo(l.created_at)}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* LEADS */}
          {page === 'leads' && (
            <div className="fade">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h1 className="font-black text-2xl tracking-tight">ALL LEADS 👥</h1>
                <div className="flex gap-2">
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search..."
                    className="bg-[#0f0f1a] border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#ff6b00] w-44 placeholder:text-white/20"/>
                  <button onClick={() => { exportCSV(leads); showToast('📥 CSV downloading!'); }}
                    className="px-4 py-2 rounded-lg text-sm font-bold border border-white/[0.12] text-white/70 hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all">↓ CSV</button>
                </div>
              </div>
              <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl overflow-hidden">
                <div className="grid grid-cols-[28px_1.5fr_1fr_1fr_90px_90px] gap-0 px-5 py-3 border-b border-white/[0.07]">
                  {['','Name','Business','Budget','Status','Time'].map(h=><p key={h} className="font-mono text-[9px] tracking-[2px] uppercase text-white/25">{h}</p>)}
                </div>
                {filtered.length===0 ? <p className="text-center py-10 text-white/30 text-sm">Koi lead nahi mila</p> :
                  filtered.map(l=>(
                    <div key={l.id} className="grid grid-cols-[28px_1.5fr_1fr_1fr_90px_90px] gap-0 items-center px-5 py-3 border-b border-white/[0.05] hover:bg-white/[0.02] last:border-0">
                      <div className="w-6 h-6 rounded-full bg-[#ff6b00]/20 text-[#ff6b00] flex items-center justify-center font-bold text-[10px]">{(l.name||'?')[0].toUpperCase()}</div>
                      <div><p className="text-sm font-semibold">{l.name||'—'}</p><p className="font-mono text-xs text-white/30">{l.ig_user_id||''}</p></div>
                      <p className="font-mono text-xs text-white/50">{l.business_type||'—'}</p>
                      <p className="font-mono text-xs text-white/50">{l.budget||'—'}</p>
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded border w-fit ${l.status==='converted'?'bg-green-400/10 text-green-400 border-green-400/20':'bg-white/5 text-white/30 border-white/10'}`}>{l.status==='converted'?'✅ YES':'Active'}</span>
                      <p className="font-mono text-xs text-white/30">{timeAgo(l.created_at)}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* INSTAGRAM */}
          {page === 'instagram' && (
            <div className="fade">
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-black text-2xl tracking-tight">INSTAGRAM 📱</h1>
                {profile.ig_connected && <span className="flex items-center gap-2 text-green-400 text-sm font-semibold"><span className="dot-live"/>Connected</span>}
              </div>
              <div className={`bg-[#0f0f1a] border rounded-xl p-6 mb-5 ${profile.ig_connected?'border-green-400/20':'border-white/[0.07]'}`}>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-red-500 to-yellow-400 flex items-center justify-center text-2xl">📷</div>
                  <div>
                    <h2 className="font-black text-lg">{profile.ig_connected ? '✅ Instagram Connected' : 'Connect Instagram'}</h2>
                    <p className="text-sm text-white/40">{profile.ig_page_name || 'Apna Instagram Business Account connect karo'}</p>
                  </div>
                </div>

                {!profile.ig_connected ? (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {[['1','Meta Developer App banao','developers.facebook.com pe jao'],['2','Webhook configure karo','Callback URL + Verify Token paste karo'],['3','Access Token paste karo','Neeche field mein']].map(([n,t,s])=>(
                        <div key={n} className="bg-[#080810] border border-white/[0.07] rounded-xl p-4">
                          <div className="font-black text-2xl text-[#ff6b00] mb-2">{n}</div>
                          <div className="font-bold text-sm mb-1">{t}</div>
                          <div className="text-xs text-white/40">{s}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mb-4">
                      <label className="block text-[11px] font-bold tracking-[1.5px] uppercase text-white/40 mb-2">Instagram Page Access Token</label>
                      <div className="flex gap-2">
                        <input id="ig-token" type="password" placeholder="EAABwzLixnjY..." className="flex-1 bg-[#080810] border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-white font-mono outline-none focus:border-[#ff6b00] placeholder:text-white/20"/>
                        <button onClick={() => { const el = document.getElementById('ig-token') as HTMLInputElement; saveToken(el?.value||''); }}
                          className="px-5 py-3 rounded-lg font-bold text-sm bg-[#ff6b00] text-black hover:bg-[#ff8c38] transition-all">Save</button>
                      </div>
                      <p className="text-xs text-white/30 mt-2">developers.facebook.com → App → Instagram → Generate Token</p>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <div className="flex-1 bg-green-400/5 border border-green-400/20 rounded-lg p-4 text-sm text-green-400">✅ Token saved. Bot DMs handle kar raha hai.</div>
                    <button onClick={async () => { await saveProfile(user!.uid, { ig_connected:false, ig_access_token:null, bot_active:false }); await refreshProfile(); showToast('Disconnected'); }}
                      className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">Disconnect</button>
                  </div>
                )}
              </div>

              {/* Webhook info */}
              <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-5">
                <h3 className="font-bold text-sm mb-4">📡 Webhook Setup Info</h3>
                {[
                  ['Callback URL','https://your-backend.railway.app/webhook/instagram'],
                  ['Verify Token','leadmachine_verify_2025'],
                ].map(([label, val]) => (
                  <div key={label} className="mb-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-1.5">{label}</p>
                    <div onClick={() => { navigator.clipboard.writeText(val); showToast('Copied! 📋'); }}
                      className="bg-[#080810] border border-white/[0.07] rounded-lg px-4 py-3 font-mono text-xs text-[#ff6b00] cursor-pointer hover:border-[#ff6b00] transition-all break-all">
                      {val}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-white/30 mt-3">💡 Backend Railway ya Render pe free deploy karo. README mein guide hai.</p>
              </div>
            </div>
          )}

          {/* TEMPLATE */}
          {page === 'template' && (
            <div className="fade">
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-black text-2xl tracking-tight">DM TEMPLATE 💬</h1>
                <span className="font-mono text-[10px] px-2.5 py-1 rounded border bg-[#ff6b00]/10 text-[#ff6b00] border-[#ff6b00]/25">ACTIVE</span>
              </div>
              <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-5 mb-5">
                <h3 className="font-bold text-sm mb-4">⚙️ Business Config</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[['biz','Business Name','My Brand'],['link','Website URL','https://yourwebsite.com']].map(([k,l,ph])=>(
                    <div key={k}>
                      <label className="block text-[11px] font-bold tracking-[1.5px] uppercase text-white/40 mb-2">{l}</label>
                      <input value={(cfg as any)[k]} onChange={e => setCfg(c => ({...c,[k]:e.target.value}))} placeholder={ph}
                        className="w-full bg-[#080810] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00] placeholder:text-white/20"/>
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold tracking-[1.5px] uppercase text-white/40 mb-2">Offer Text</label>
                    <input value={cfg.offer} onChange={e=>setCfg(c=>({...c,offer:e.target.value}))} placeholder="Special offer sirf aapke liye!"
                      className="w-full bg-[#080810] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00] placeholder:text-white/20"/>
                  </div>
                </div>
                <button onClick={saveCfg} disabled={busy} className="mt-4 px-5 py-2.5 rounded-lg font-bold text-sm bg-[#ff6b00] text-black hover:bg-[#ff8c38] transition-all disabled:opacity-40">
                  {busy ? 'Saving...' : '💾 Save Config'}
                </button>
              </div>

              <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm">👁 Template Preview — Lead Funnel</h3>
                  <span className="font-mono text-[10px] text-[#ff6b00]">Triggers: hi · price · details · start</span>
                </div>
                <div className="space-y-3">
                  {FLOW_TEMPLATE.steps.map(s => (
                    <div key={s.id} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#ff6b00] flex items-center justify-center font-bold text-[10px] text-black flex-shrink-0">{s.id}</div>
                      <div className="bg-[#080810] border border-white/[0.07] rounded-xl rounded-tl-sm px-4 py-2.5 text-sm text-white/80 whitespace-pre-line leading-relaxed">
                        {s.hi.replace('{website_link}', cfg.link || 'https://yourwebsite.com').replace('{name}','{name}')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR */}
          {page === 'simulator' && (
            <div className="fade">
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-black text-2xl tracking-tight">SIMULATOR 🎮</h1>
                <button onClick={resetSim} className="px-4 py-2 rounded-lg text-sm font-bold border border-white/[0.12] text-white/50 hover:text-white hover:border-white/30 transition-all">↺ Reset</button>
              </div>
              <div className="grid grid-cols-[1fr_260px] gap-4">
                <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-yellow-400 flex items-center justify-center text-sm">👤</div>
                      <div><p className="font-semibold text-sm">Test User</p><p className="font-mono text-xs text-white/30">@testuser</p></div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-green-400"><span className="dot-live"/>LIVE</div>
                  </div>
                  <div ref={chatRef} className="h-72 overflow-y-auto p-4 flex flex-col gap-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10">
                    {msgs.map((m, i) => (
                      <div key={i} className={`max-w-[75%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-line
                        ${m.type==='user' ? 'bg-[#ff6b00] text-black font-medium self-end rounded-br-sm' :
                          m.type==='bot'  ? 'bg-[#1a1a2a] border border-white/[0.07] self-start rounded-bl-sm' :
                          'self-center bg-green-400/5 border border-green-400/20 text-green-400 font-mono text-xs text-center max-w-full rounded-lg'}`}>
                        {m.text}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 p-3 border-t border-white/[0.07]">
                    <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendSimMsg()} placeholder="Message likho..."
                      className="flex-1 bg-[#1a1a2a] border border-white/[0.1] rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00] placeholder:text-white/20"/>
                    <button onClick={sendSimMsg} className="px-4 py-2.5 rounded-lg font-bold text-sm bg-[#ff6b00] text-black hover:bg-[#ff8c38] transition-all">Send →</button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-4">
                    <p className="font-mono text-[9px] tracking-[2px] uppercase text-white/30 mb-3">Session Info</p>
                    {[['Step', sim.flow ? `${sim.step}/${sim.flow.steps.length}` : '—'],['Lang', sim.lang==='hi'?'Hinglish':'English'],['Status', sim.step===0?'Idle':sim.step>=(sim.flow?.steps.length||0)?'Done ✅':'Running']].map(([k,v])=>(
                      <div key={k} className="flex justify-between py-2 border-b border-white/[0.05] last:border-0 text-sm">
                        <span className="text-white/30 font-mono text-xs">{k}</span>
                        <span className="text-[#ff6b00] font-mono text-xs">{v}</span>
                      </div>
                    ))}
                  </div>
                  {Object.keys(sim.data).length > 0 && (
                    <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-4">
                      <p className="font-mono text-[9px] tracking-[2px] uppercase text-white/30 mb-3">Captured Data</p>
                      {Object.entries(sim.data).map(([k,v]) => (
                        <div key={k} className="flex justify-between py-2 border-b border-white/[0.05] last:border-0">
                          <span className="text-white/30 font-mono text-xs">{k}</span>
                          <span className="text-white text-xs font-medium">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {page === 'settings' && (
            <div className="fade">
              <h1 className="font-black text-2xl tracking-tight mb-6">SETTINGS ⚙️</h1>
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-5">
                  <h3 className="font-bold text-sm mb-4">👤 Profile</h3>
                  <div className="space-y-4">
                    {[['Name',profile.name||''],['Email',profile.email||'']].map(([l,v])=>(
                      <div key={l}>
                        <label className="block text-[11px] font-bold tracking-[1.5px] uppercase text-white/40 mb-2">{l}</label>
                        <input defaultValue={v} id={`prf-${l.toLowerCase()}`} disabled={l==='Email'}
                          className="w-full bg-[#080810] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff6b00] disabled:opacity-40"/>
                      </div>
                    ))}
                    <button onClick={async () => {
                      const n = (document.getElementById('prf-name') as HTMLInputElement)?.value;
                      if (n && user) { await saveProfile(user.uid, { name: n }); await refreshProfile(); showToast('✅ Profile updated!'); }
                    }} className="px-5 py-2.5 rounded-lg font-bold text-sm bg-[#ff6b00] text-black hover:bg-[#ff8c38] transition-all">Save Profile</button>
                  </div>
                </div>
                <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-5">
                  <h3 className="font-bold text-sm mb-4">🏷 Current Plan</h3>
                  <div className="bg-[#080810] border border-white/[0.07] rounded-xl p-4 mb-4">
                    <div className={`font-black text-3xl tracking-tight mb-1 ${plan.isPaid?'text-green-400':plan.isTrial?'text-yellow-400':'text-red-400'}`}>
                      {plan.isPaid ? 'PRO' : plan.isTrial ? 'FREE TRIAL' : 'EXPIRED'}
                    </div>
                    <div className="text-sm text-white/40">{plan.isPaid ? 'Unlimited leads · Unlimited templates' : plan.isTrial ? `${plan.daysLeft} din bacha hai` : 'Trial khatam ho gaya'}</div>
                  </div>
                  {!plan.isPaid && (
                    <Link href="/pricing" className="flex items-center justify-center w-full py-3 rounded-lg font-bold text-sm bg-[#ff6b00] text-black hover:bg-[#ff8c38] transition-all">
                      ⚡ UPGRADE TO PRO — ₹499/month
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {plan.expired && page !== 'settings' && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1a0800] border border-[#ff6b00]/40 rounded-xl px-5 py-3 flex items-center gap-4 shadow-2xl z-50">
            <span className="text-sm text-white/80">⚠️ Trial expired — bot paused hai</span>
            <Link href="/pricing" className="px-4 py-1.5 rounded-lg font-bold text-xs bg-[#ff6b00] text-black hover:bg-[#ff8c38] transition-all">Upgrade Now →</Link>
          </div>
        )}
      </main>

      {toast && (
        <div className="fixed bottom-5 right-5 bg-[#1a1a2a] border border-white/[0.12] rounded-xl px-4 py-3 text-sm text-white shadow-2xl z-50 animate-fade">
          {toast}
        </div>
      )}
    </div>
  );
}
