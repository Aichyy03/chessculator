import React, { useState, useEffect } from 'react';
// Crown (Vezir/Şah) ikonu import edildi
import { Trophy, Trash2, PlusCircle, Info, Target, Crown } from 'lucide-react';

function App() {
  const [matches, setMatches] = useState(() => {
    try {
      const saved = localStorage.getItem('chess_engine_v7_custom');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [startingElo, setStartingElo] = useState(() => {
    const saved = localStorage.getItem('starting_elo_v7_custom');
    return saved ? parseInt(saved) : 1775;
  });

  const [kFactor, setKFactor] = useState(20);
  const [showKInfo, setShowKInfo] = useState(false);

  useEffect(() => {
    localStorage.setItem('chess_engine_v7_custom', JSON.stringify(matches));
    localStorage.setItem('starting_elo_v7_custom', startingElo.toString());
  }, [matches, startingElo]);

  const calculateGain = (oppElo, result) => {
    const currentElo = startingElo + matches.reduce((acc, m) => acc + m.eloGain, 0);
    const expected = 1 / (1 + Math.pow(10, (oppElo - currentElo) / 400));
    const score = result.toLowerCase() === 'win' ? 1 : result.toLowerCase() === 'draw' ? 0.5 : 0;
    return Math.round(kFactor * (score - expected));
  };

  const addMatch = () => {
    // 1. İsim sorusu (İçi boş)
    const name = prompt("Rakip Adı:");
    if (!name) return; // Boş bırakılıp OK denirse işlemi iptal et

    // 2. ELO sorusu (İçi boş)
    const oppEloStr = prompt("Rakip ELO:");
    if (!oppEloStr) return;
    const oppElo = parseInt(oppEloStr);
    if (isNaN(oppElo)) {
      alert("Lütfen geçerli bir sayı giriniz.");
      return;
    }

    // 3. Sonuç sorusu (Açılış sorusu tamamen kaldırıldı)
    const result = prompt("Sonuç (Win/Loss/Draw):", "Win");
    if (!result) return;
    
    const gain = calculateGain(oppElo, result);

    setMatches([{
      id: Date.now(),
      opponentName: name,
      opponentElo: oppElo,
      myResult: result, // Açılış (openingPlayed) verisi kaldırıldı
      eloGain: gain,
      appliedK: kFactor,
      date: new Date().toLocaleDateString('tr-TR')
    }, ...matches]);
  };

  const totalChange = matches.reduce((acc, m) => acc + (m.eloGain || 0), 0);
  const currentElo = startingElo + totalChange;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col items-center py-16 px-6 font-sans">
      
      <div className="w-full max-w-5xl flex flex-col items-center gap-14">
        
        {/* ÖZEL BAŞLIK: Vezir/Şah Logosu ve İsim Kartı */}
        <header className="flex flex-col items-center text-center gap-5 w-full">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center gap-6 w-full max-w-lg transition-transform hover:scale-[1.02]">
            
            {/* Şık ve modern Vezir/Şah Kutusu */}
            <div className="bg-slate-800 p-6 rounded-[2rem] shadow-md drop-shadow-lg">
              <Crown size={60} className="text-white" strokeWidth={1.5} />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-800">
              ChessCulator
            </h1>
          </div>

          <div className="bg-slate-200/50 border border-slate-200 px-8 py-2.5 rounded-xl shadow-sm mt-2">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.3em]">Elo Hesaplama Paneli</p>
          </div>
        </header>

        {/* TOP ROW: Global Rating ve Ekleme Butonu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-4">
          <div className="bg-[#3b82f6] p-10 rounded-[2.5rem] shadow-2xl flex items-center justify-between text-white border border-blue-600 transition-all hover:scale-[1.01]">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 p-4 rounded-3xl"><Trophy size={48} /></div>
              <div>
                <p className="text-blue-100 text-xs font-black uppercase tracking-widest opacity-80">Global Rating</p>
                <p className="text-6xl font-black tracking-tighter leading-none">{currentElo}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-300">+{totalChange} ELO</p>
            </div>
          </div>

          <button 
            onClick={addMatch}
            className="bg-[#3b82f6] hover:bg-blue-700 p-10 rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-4 text-white font-black text-xl transition-all active:scale-95"
          >
            <PlusCircle size={32} /> YENİ MAÇ ANALİZİ EKLE
          </button>
        </div>

        {/* BOTTOM SECTION: Girdiler (Sol) ve Liste (Sağ) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full mb-16">
          
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col gap-4">
              <label className="text-xs font-black text-slate-500 text-center uppercase">Başlangıç Elo</label>
              <input type="number" value={startingElo} onChange={(e) => setStartingElo(parseInt(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl text-3xl font-black text-blue-600 text-center outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative text-center">
              <div className="flex justify-between items-center mb-6 px-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">K-Katsayısı Seçimi</label>
                <button onClick={() => setShowKInfo(!showKInfo)} className="text-slate-300 hover:text-blue-600 transition-colors"><Info size={22} /></button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 px-2">
                {[10, 20, 40].map((val) => (
                  <button
                    key={val}
                    onClick={() => setKFactor(val)}
                    className={`py-5 rounded-2xl font-black text-xl transition-all ${kFactor === val ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-200'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>

              {showKInfo && (
                <div className="absolute top-full left-0 right-0 mt-4 p-5 bg-slate-900 text-white rounded-[2rem] shadow-2xl z-50 text-[10px] leading-relaxed animate-in fade-in slide-in-from-top-2">
                  <p className="font-bold text-blue-400 mb-2 underline">FIDE STANDARTLARI</p>
                  <p>K=40 (Yeni/Genç), K=20 (Standart), K=10 (Pro)</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden mb-20 min-h-[400px]">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
                Calculation History
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-inner">
                   <Target size={12} className="text-blue-600" />
                   <span className="text-blue-600">K:{kFactor}</span>
                   <span className="text-slate-300">|</span>
                   <span>FIDE STANDART</span>
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {matches.length === 0 ? (
                  <div className="p-20 text-center text-slate-300 italic text-sm font-medium">Henüz bir hesaplama yapılmadı. İlk hamleni hemen ekle!</div>
                ) : (
                matches.map((match) => (
                <div key={match.id} className="p-10 flex items-center justify-between hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-8">
                    <div className={`w-2 h-16 rounded-full ${match.myResult.toLowerCase() === 'win' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : match.myResult.toLowerCase() === 'draw' ? 'bg-slate-400' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'}`} />
                    <div>
                      <h4 className="font-bold text-2xl text-slate-900 group-hover:text-blue-600 transition-colors">{match.opponentName} <span className="text-slate-500 font-medium text-lg ml-3">({match.opponentElo})</span></h4>
                      <p className="text-[11px] text-slate-600 font-bold uppercase mt-2.5 tracking-widest">{match.date} • {match.myResult} • K:{match.appliedK}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <span className={`text-4xl font-black ${match.eloGain > 0 ? 'text-green-600' : match.eloGain === 0 ? 'text-slate-500' : 'text-red-600'}`}>
                      {match.eloGain > 0 ? '+' : ''}{match.eloGain}
                    </span>
                    <button onClick={() => setMatches(matches.filter(m => m.id !== match.id))} className="text-slate-200 group-hover:text-red-400 transition-colors p-2">
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
                ))
                )}
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center pb-12 opacity-30 text-[10px] font-black uppercase tracking-[0.5em]">
          ChessCulator // BY ORHAN EREN KARABIYIK
        </footer>
      </div>
    </div>
  );
}

export default App;