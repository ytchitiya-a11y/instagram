import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, updateProfile, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User
} from 'firebase/auth';
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, collection,
  addDoc, getDocs, query, orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore';

// ── CONFIG — replace with your Firebase project values ───────────────────────
export const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// ── Types ─────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id:              string;
  name:            string;
  email:           string;
  business_name:   string;
  website_link:    string;
  offer_text:      string;
  plan:            'free_trial' | 'paid';
  bot_active:      boolean;
  ig_connected:    boolean;
  ig_page_id:      string | null;
  ig_page_name:    string | null;
  ig_access_token: string | null;
  trial_ends_at:   Timestamp | null;
  paid_until:      Timestamp | null;
  is_admin:        boolean;
  created_at:      Timestamp | null;
}

export interface Lead {
  id:            string;
  ig_user_id:    string;
  name:          string;
  business_type: string;
  product:       string;
  budget:        string;
  interest:      string;
  status:        'active' | 'converted';
  flow:          string;
  created_at:    Timestamp | null;
}

export interface PlanStatus {
  plan:    'free_trial' | 'paid';
  active:  boolean;
  expired: boolean;
  isPaid:  boolean;
  isTrial: boolean;
  daysLeft: number;
}

// ── Plan helpers ──────────────────────────────────────────────────────────────
export function getPlanStatus(profile: UserProfile | null): PlanStatus {
  if (!profile) return { plan: 'free_trial', active: false, expired: true, isPaid: false, isTrial: false, daysLeft: 0 };
  const now      = Date.now();
  const paidEnd  = profile.paid_until  ? profile.paid_until.toDate().getTime()  : 0;
  const trialEnd = profile.trial_ends_at ? profile.trial_ends_at.toDate().getTime() : 0;
  const isPaid   = paidEnd  > now;
  const isTrial  = !isPaid && trialEnd > now;
  const daysLeft = isPaid  ? Math.ceil((paidEnd - now) / 86400000)
                 : isTrial ? Math.ceil((trialEnd - now) / 86400000) : 0;
  return { plan: isPaid ? 'paid' : 'free_trial', active: isPaid || isTrial, expired: !isPaid && !isTrial, isPaid, isTrial, daysLeft };
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function signUpEmail(email: string, password: string, name: string, businessName: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await createProfile(cred.user, name, email, businessName);
  return cred.user;
}

export async function signInEmail(email: string, password: string) {
  return (await signInWithEmailAndPassword(auth, email, password)).user;
}

export async function signInGoogle() {
  const provider = new GoogleAuthProvider();
  const cred     = await signInWithPopup(auth, provider);
  const snap     = await getDoc(doc(db, 'users', cred.user.uid));
  if (!snap.exists()) await createProfile(cred.user, cred.user.displayName || '', cred.user.email || '');
  return cred.user;
}

export async function logOut() { await signOut(auth); }

async function createProfile(user: User, name: string, email: string, businessName = '') {
  const trialEnd = new Date(Date.now() + 7 * 86400000);
  await setDoc(doc(db, 'users', user.uid), {
    name, email,
    business_name:   businessName || name,
    website_link:    '',
    offer_text:      '',
    plan:            'free_trial',
    bot_active:      true,
    ig_connected:    false,
    ig_page_id:      null,
    ig_page_name:    null,
    ig_access_token: null,
    trial_ends_at:   trialEnd,
    paid_until:      null,
    is_admin:        false,
    created_at:      serverTimestamp(),
    updated_at:      serverTimestamp(),
  });
}

// ── Profile ───────────────────────────────────────────────────────────────────
export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } as UserProfile : null;
}

export async function saveProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, 'users', uid), { ...data, updated_at: serverTimestamp() });
}

// ── Leads ─────────────────────────────────────────────────────────────────────
export async function getLeads(uid: string): Promise<Lead[]> {
  const q    = query(collection(db, 'users', uid, 'leads'), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead));
}

export function calcStats(leads: Lead[]) {
  const total     = leads.length;
  const converted = leads.filter(l => l.status === 'converted').length;
  const today     = leads.filter(l => {
    const d = (l.created_at?.toDate?.() || new Date(0));
    return d.toDateString() === new Date().toDateString();
  }).length;
  return { total, converted, today, rate: total ? Math.round(converted / total * 100) : 0 };
}

// ── Utils ─────────────────────────────────────────────────────────────────────
export function timeAgo(ts: Timestamp | null | undefined): string {
  if (!ts) return '—';
  const d    = ts.toDate();
  const diff = Date.now() - d.getTime();
  if (diff < 60000)    return 'just now';
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function fmtDate(ts: Timestamp | null | undefined): string {
  if (!ts) return '—';
  return ts.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function exportCSV(leads: Lead[]) {
  const H = ['Name', 'IG User ID', 'Business', 'Product', 'Budget', 'Status', 'Date'];
  const R = leads.map(l => [l.name, l.ig_user_id, l.business_type, l.product, l.budget, l.status, fmtDate(l.created_at)]);
  const csv  = [H, ...R].map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `leads_${Date.now()}.csv`;
  a.click();
}

// ── DM Flow Template ──────────────────────────────────────────────────────────
export const FLOW_TEMPLATE = {
  trigger: ['hi','hello','hii','hey','price','details','start','info','interested','help','kya','bata'],
  steps: [
    { id:1, hi:"Hey 👋 Kaise ho! Aapka naam kya hai?",                                                            en:"Hey 👋 What's your name?",                                                    save:'name'          },
    { id:2, hi:"Nice to meet you {name}! 😊\nBusiness kya hai?\n1️⃣ Service  2️⃣ Product  3️⃣ Freelance  4️⃣ Other", en:"Nice {name}! 😊\n1️⃣ Service  2️⃣ Product  3️⃣ Freelance  4️⃣ Other",         save:'business_type' },
    { id:3, hi:"Aap exactly kya sell karte ho?",                                                                   en:"What exactly do you sell?",                                                   save:'product'       },
    { id:4, hi:"Perfect! 🎯\nBudget approx?\n💰 Under ₹5K\n💰 ₹5–15K\n💰 ₹15K+",                              en:"Budget?\n💰 Under ₹5K\n💰 ₹5–15K\n💰 ₹15K+",                               save:'budget'        },
    { id:5, hi:"🔥 Details yahan dekho 👇\n{website_link}",                                                       en:"🔥 Check here 👇\n{website_link}",                                           save:null            },
    { id:6, hi:"Interested? Reply: YES 👍\nTeam 24hrs me contact karegi! 🚀",                                    en:"Reply YES if interested 👍\nWe'll contact in 24hrs! 🚀",                     save:'interest'      }
  ],
  end_hi: "🎉 Shukriya {name}! Team jald contact karegi। 🙏",
  end_en: "🎉 Thank you {name}! Our team will reach out soon! 🙏"
};

export function injectVars(msg: string, data: Record<string, string>): string {
  return msg.replace(/\{(\w+)\}/g, (_, k) => data[k] || '');
}
export function detectLang(text: string): 'hi' | 'en' {
  return /[\u0900-\u097F]/.test(text) ? 'hi' : 'en';
}
export function isTrigger(text: string): boolean {
  const l = text.toLowerCase();
  return FLOW_TEMPLATE.trigger.some(k => l.includes(k));
}
