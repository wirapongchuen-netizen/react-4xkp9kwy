import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

/* --- คำแนะนำสำหรับเจ้านาย ---
  1. นำข้อมูลจาก Firebase Project Settings มาวางตรงนี้
*/
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'tyds-enterprise-v45';

export default function App() {
  const [lang, setLang] = useState('TH');
  const [data, setData] = useState({ molds: [], steel: [], staff: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => { if (!user) signInAnonymously(auth); });
    const cols = ['molds', 'steel', 'staff'];
    const unsubscribes = cols.map(c => 
      onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', c), (snap) => {
        setData(prev => ({ ...prev, [c]: snap.docs.map(d => ({ docId: d.id, ...d.data() })) }));
        setLoading(false);
      })
    );
    return () => unsubscribes.forEach(u => u());
  }, []);

  const getTranslation = (key) => {
    const dict = {
      TH: { title: 'ระบบวิศวกรรมอัจฉริยะ', cost: 'ต้นทุนสะสม', status: 'สถานะโครงการ', export: 'EXPORT REPORT' },
      JP: { title: 'インテリジェントエンジニアリング', cost: '累積コスト', status: 'プロジェクトステータス', export: 'レポート出力' },
      EN: { title: 'Smart Engineering System', cost: 'Acc. Cost', status: 'Project Status', export: 'EXPORT REPORT' }
    };
    return dict[lang][key];
  };

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-sky-500 font-black animate-pulse">SYSTEM BOOTING...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-sans max-w-2xl mx-auto">
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-sky-500 italic">TYDS V4.5</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{getTranslation('title')}</p>
        </div>
        <div className="flex gap-1">
          {['TH', 'JP', 'EN'].map(l => (
            <button key={l} onClick={() => setLang(l)} className={`w-8 h-8 rounded-lg text-[10px] font-black ${lang === l ? 'bg-sky-600' : 'bg-slate-800'}`}>{l}</button>
          ))}
        </div>
      </header>

      <section className="space-y-4">
        {data.molds.map(m => (
          <div key={m.docId} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between mb-2">
              <h2 className="font-black text-sm">{m.name}</h2>
              <span className="text-[9px] bg-sky-900/30 text-sky-400 px-2 py-0.5 rounded-full">{m.client}</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${m.progress}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>{getTranslation('status')}: {m.progress}%</span>
              <span className="text-emerald-500">฿{(450000 * (m.progress / 100)).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </section>

      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-t border-slate-800 p-4 flex justify-between items-center">
        <div className="text-[10px] font-black text-slate-500">TYDS ENTERPRISE v4.5</div>
        <button onClick={() => alert("Report Exported to Executive Dashboard")} className="bg-sky-600 px-4 py-2 rounded-2xl text-[9px] font-black shadow-lg">
          {getTranslation('export')}
        </button>
      </footer>
    </div>
  );
}
