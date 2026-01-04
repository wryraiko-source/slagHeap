import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Dices, 
  RotateCcw, 
  History, 
  Settings2, 
  Trash2, 
  Plus,
  Flame,
  Zap,
  Sparkles,
  Star,
  Snowflake,
  Ghost,
  Leaf,
  Sword,
  Waves,
  Sun,
  Moon,
  CloudLightning,
  Skull,
  Share2,
  Users,
  Copy,
  Check,
  LogOut,
  ArrowRight
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  query, 
  updateDoc 
} from 'firebase/firestore';

// --- Firebase Configuration & Initialization ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'dice-roller-pro';

// --- Theme Definitions ---
const THEMES = {
  cinder: { name: 'Cinder', primary: 'from-orange-500 via-amber-500 to-yellow-400', accent: 'text-orange-500', bgAccent: 'bg-orange-500', border: 'border-orange-500/30', shadow: 'shadow-orange-500/20', glow: 'rgba(249, 115, 22, 0.4)', button: 'hover:bg-orange-500', gradient: 'from-orange-600 to-amber-600', icon: Flame },
  frost: { name: 'Frost', primary: 'from-cyan-400 via-blue-500 to-indigo-500', accent: 'text-cyan-400', bgAccent: 'bg-cyan-500', border: 'border-cyan-500/30', shadow: 'shadow-cyan-500/20', glow: 'rgba(34, 211, 238, 0.4)', button: 'hover:bg-cyan-500', gradient: 'from-cyan-600 to-blue-600', icon: Snowflake },
  void: { name: 'Void', primary: 'from-purple-500 via-indigo-600 to-fuchsia-500', accent: 'text-purple-400', bgAccent: 'bg-purple-500', border: 'border-purple-500/30', shadow: 'shadow-purple-500/20', glow: 'rgba(168, 85, 247, 0.4)', button: 'hover:bg-purple-500', gradient: 'from-purple-700 to-indigo-800', icon: Ghost },
  emerald: { name: 'Emerald', primary: 'from-emerald-400 via-green-500 to-lime-500', accent: 'text-emerald-400', bgAccent: 'bg-emerald-500', border: 'border-emerald-500/30', shadow: 'shadow-emerald-500/20', glow: 'rgba(16, 185, 129, 0.4)', button: 'hover:bg-emerald-500', gradient: 'from-emerald-600 to-green-700', icon: Leaf },
  rose: { name: 'Rose', primary: 'from-rose-500 via-red-600 to-orange-600', accent: 'text-rose-500', bgAccent: 'bg-rose-500', border: 'border-rose-500/30', shadow: 'shadow-rose-500/20', glow: 'rgba(244, 63, 94, 0.4)', button: 'hover:bg-rose-500', gradient: 'from-rose-600 to-red-700', icon: Sword },
  ocean: { name: 'Ocean', primary: 'from-teal-400 via-cyan-500 to-blue-500', accent: 'text-teal-400', bgAccent: 'bg-teal-500', border: 'border-teal-500/30', shadow: 'shadow-teal-500/20', glow: 'rgba(20, 184, 166, 0.4)', button: 'hover:bg-teal-500', gradient: 'from-teal-600 to-cyan-700', icon: Waves },
  solar: { name: 'Solar', primary: 'from-yellow-300 via-amber-400 to-yellow-500', accent: 'text-yellow-400', bgAccent: 'bg-yellow-400', border: 'border-yellow-500/30', shadow: 'shadow-yellow-500/20', glow: 'rgba(234, 179, 8, 0.4)', button: 'hover:bg-yellow-400', gradient: 'from-yellow-500 to-amber-600', icon: Sun },
  toxic: { name: 'Toxic', primary: 'from-lime-400 via-green-400 to-yellow-300', accent: 'text-lime-400', bgAccent: 'bg-lime-500', border: 'border-lime-500/30', shadow: 'shadow-lime-500/20', glow: 'rgba(132, 204, 22, 0.4)', button: 'hover:bg-lime-500', gradient: 'from-lime-600 to-green-600', icon: Skull },
  midnight: { name: 'Midnight', primary: 'from-slate-300 via-zinc-400 to-slate-500', accent: 'text-slate-300', bgAccent: 'bg-zinc-500', border: 'border-zinc-500/30', shadow: 'shadow-zinc-500/20', glow: 'rgba(113, 113, 122, 0.4)', button: 'hover:bg-zinc-500', gradient: 'from-zinc-700 to-slate-800', icon: Moon },
  aura: { name: 'Aura', primary: 'from-fuchsia-400 via-pink-500 to-purple-500', accent: 'text-fuchsia-400', bgAccent: 'bg-fuchsia-500', border: 'border-fuchsia-500/30', shadow: 'shadow-fuchsia-500/20', glow: 'rgba(217, 70, 239, 0.4)', button: 'hover:bg-fuchsia-500', gradient: 'from-fuchsia-600 to-pink-700', icon: CloudLightning }
};

// --- Sub-Components ---

const Die = ({ value, type, isRolling, theme }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [showSparkles, setShowSparkles] = useState(false);
  const activeTheme = THEMES[theme] || THEMES.cinder;

  const animationStyle = useMemo(() => {
    if (!isRolling) return {};
    return {
      animationDelay: `${Math.random() * 0.2}s`,
      animationDuration: `${0.4 + Math.random() * 0.4}s`,
      transform: `rotate(${5 + Math.random() * 20}deg) scale(1.1)`
    };
  }, [isRolling]);

  useEffect(() => {
    if (!isRolling && type === 20 && value === 20) {
      setShowSparkles(true);
      const timer = setTimeout(() => setShowSparkles(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isRolling, value, type]);

  useEffect(() => {
    let interval;
    if (isRolling) {
      const flipSpeed = 60 + Math.random() * 40;
      interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * type) + 1);
      }, flipSpeed);
    } else {
      setDisplayValue(value);
    }
    return () => clearInterval(interval);
  }, [isRolling, value, type]);

  const getShapeClasses = () => {
    switch (type) {
      case 4: return "clip-path-triangle";
      case 6: return "rounded-xl";
      case 8: return "clip-path-diamond";
      case 10: return "clip-path-diamond"; 
      case 12: return "clip-path-hexagon";
      case 20: return "clip-path-hexagon";
      default: return "rounded-xl";
    }
  };

  return (
    <div 
      style={animationStyle}
      className={`relative flex items-center justify-center w-20 h-20 transition-all duration-500 transform 
        ${isRolling ? 'animate-bounce' : 'scale-100 rotate-0'}
        border-2 bg-gradient-to-br ${showSparkles ? 'from-yellow-300 via-white to-yellow-500' : activeTheme.primary}
        ${showSparkles ? 'text-black shadow-[0_0_40px_rgba(250,204,21,0.8)] border-white scale-110 z-20' : 'text-black shadow-lg border-white/20'}
        font-black text-3xl select-none m-2 ${getShapeClasses()}
      `}
    >
      <span className={`drop-shadow-md z-10 ${showSparkles ? 'animate-pulse scale-125' : ''}`}>
        {displayValue}
      </span>
      {showSparkles && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          <Sparkles className="text-yellow-600 animate-ping absolute" size={40} />
        </div>
      )}
      {type === 6 && !isRolling && !showSparkles && (
        <div className="absolute inset-0 p-2 opacity-40 pointer-events-none">
           <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-black"></div>
           <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-black"></div>
        </div>
      )}
      {type !== 6 && !showSparkles && <div className="absolute inset-0 bg-black/5 pointer-events-none" style={{ clipPath: 'inherit' }}></div>}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [joinId, setJoinId] = useState('');
  const [diceList, setDiceList] = useState([{ id: 1, type: 20, value: 1 }]);
  const [notation, setNotation] = useState('1d20');
  const [theme, setTheme] = useState('cinder');
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');
  const [isCopying, setIsCopying] = useState(false);

  const activeTheme = THEMES[theme] || THEMES.cinder;
  const DICE_TYPES = [4, 6, 8, 10, 12, 20];

  // 1. Auth Setup
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Room Sync Setup
  useEffect(() => {
    if (!user || !roomId) return;

    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDiceList(data.diceList || []);
        setTheme(data.theme || 'cinder');
        setTotal(data.total || 0);
        setIsRolling(data.isRolling || false);
        if (data.history) setHistory(data.history);
      }
    }, (err) => console.error("Sync error:", err));

    return () => unsubscribe();
  }, [user, roomId]);

  const updateRoomState = async (updates) => {
    if (!user || !roomId) return;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomId);
    try {
      await updateDoc(roomRef, updates);
    } catch (e) {
      await setDoc(roomRef, {
        diceList, theme, total, isRolling, history, ...updates
      });
    }
  };

  const rollDice = useCallback(async () => {
    if (isRolling) return;
    
    setIsRolling(true);
    if (roomId) updateRoomState({ isRolling: true });

    setTimeout(async () => {
      const newDice = diceList.map(die => ({
        ...die,
        value: Math.floor(Math.random() * die.type) + 1
      }));
      
      const newTotal = newDice.reduce((acc, die) => acc + die.value, 0);
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        dice: newDice.map(d => ({ value: d.value, type: d.type })),
        total: newTotal
      };
      const newHistory = [historyItem, ...history].slice(0, 50);

      setDiceList(newDice);
      setTotal(newTotal);
      setHistory(newHistory);
      setIsRolling(false);

      if (roomId) {
        updateRoomState({
          diceList: newDice,
          total: newTotal,
          history: newHistory,
          isRolling: false
        });
      }
    }, 800);
  }, [diceList, isRolling, roomId, history]);

  const createRoom = () => {
    const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newId);
    updateRoomState({ diceList, theme, total, isRolling, history });
  };

  const joinRoom = () => {
    if (!joinId) return;
    setRoomId(joinId.toUpperCase());
    setJoinId('');
  };

  const leaveRoom = () => {
    setRoomId('');
  };

  const handleNotationAdd = (e) => {
    e.preventDefault();
    setError('');
    const regex = /^(\d+)?d(\d+)$/i;
    const match = notation.trim().match(regex);
    if (!match) return setError('Format: XdX (e.g. 2d6)');

    const count = Math.min(parseInt(match[1]) || 1, 20);
    const sides = parseInt(match[2]);
    if (diceList.length + count > 30) return setError('Table limit: 30 dice');

    const newDiceItems = Array.from({ length: count }, () => ({
      id: Math.random() + Date.now(),
      type: sides,
      value: 1
    }));

    const newList = [...diceList, ...newDiceItems];
    setDiceList(newList);
    setNotation('');
    if (roomId) updateRoomState({ diceList: newList });
  };

  const removeDie = (id) => {
    if (diceList.length <= 1) return;
    const newList = diceList.filter(d => d.id !== id);
    setDiceList(newList);
    if (roomId) updateRoomState({ diceList: newList });
  };

  const copyRoomId = () => {
    const tempInput = document.createElement('input');
    tempInput.value = roomId;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Header */}
        <header className="flex justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className={`bg-gradient-to-br ${activeTheme.primary} p-2 rounded-lg text-black transition-all`}>
              <Dices size={32} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none transition-colors">
                {activeTheme.name.toUpperCase()} ROLL
              </h1>
              <p className={`text-[10px] ${activeTheme.accent} font-bold tracking-[0.2em] uppercase`}>
                Forged in Luck
              </p>
            </div>
          </div>

          {/* Center Room Code Card */}
          <div className="flex-1 flex justify-center">
            {roomId ? (
              <div className="flex items-center gap-2 sm:gap-4 bg-zinc-900 border border-zinc-800 p-1 pl-3 pr-1 rounded-2xl h-[52px] shadow-lg">
                <div className="flex flex-col justify-center">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-0.5">Room ID</span>
                  <span className="text-sm sm:text-lg font-black text-white tracking-widest leading-none">{roomId}</span>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={copyRoomId} 
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
                    title="Copy Code"
                  >
                    {isCopying ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                  <button 
                    onClick={leaveRoom} 
                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 rounded-xl transition-all"
                    title="Leave Room"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 p-1 pl-2 pr-1 rounded-2xl h-[52px]">
                <div className="hidden md:flex items-center gap-2 px-2">
                  <Users size={14} className="text-zinc-600" />
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Single Player</span>
                </div>
                <button 
                  onClick={createRoom} 
                  className="px-3 h-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all border border-zinc-700 whitespace-nowrap"
                >
                  Share
                </button>
                <div className="h-6 w-px bg-zinc-800 mx-1"></div>
                <div className="flex gap-1">
                  <input 
                    type="text" 
                    value={joinId} 
                    onChange={e => setJoinId(e.target.value.toUpperCase())}
                    placeholder="Join ID" 
                    className="w-16 sm:w-24 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1 text-[10px] font-bold focus:outline-none focus:border-zinc-600 transition-colors uppercase"
                  />
                  <button 
                    onClick={joinRoom} 
                    className="p-2 bg-zinc-100 text-black hover:bg-white rounded-xl transition-all active:scale-95"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-500 transition-all relative"
            >
              <History size={22} />
              {history.length > 0 && <span className={`absolute -top-1 -right-1 w-3 h-3 ${activeTheme.bgAccent} rounded-full border-2 border-[#0a0a0c]`}></span>}
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <section className="lg:col-span-1 space-y-6">
            {/* Config Panel */}
            <div className="bg-zinc-900/50 backdrop-blur-md p-6 rounded-3xl border border-zinc-800 shadow-xl">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Settings2 size={14} className={activeTheme.accent} /> Summon Dice
              </h2>
              <form onSubmit={handleNotationAdd} className="mb-6">
                <div className="flex gap-2">
                  <input 
                    type="text" value={notation} onChange={(e) => setNotation(e.target.value)}
                    placeholder="e.g. 2d20" className={`flex-1 bg-zinc-950 border ${error ? 'border-red-500' : 'border-zinc-800'} rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-white transition-colors uppercase`}
                  />
                  <button type="submit" className={`${activeTheme.bgAccent} text-black rounded-xl px-4 active:scale-95 transition-all`}><Plus size={20}/></button>
                </div>
                {error && <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">{error}</p>}
              </form>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {diceList.map((die) => (
                  <div key={die.id} className="flex items-center justify-between p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl group hover:border-zinc-700 transition-colors">
                    <span className={`text-xs font-black ${activeTheme.accent} opacity-60`}>D{die.type} Polyhedron</span>
                    <button onClick={() => removeDie(die.id)} className="text-zinc-600 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => {
                  const newList = [{ id: Date.now(), type: 20, value: 1 }];
                  setDiceList(newList);
                  if (roomId) updateRoomState({ diceList: newList });
                }}
                className={`w-full mt-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-500 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2`}
              >
                <RotateCcw size={14} /> Wipe Table
              </button>
            </div>

            {/* Total Display */}
            <div className={`bg-gradient-to-br ${activeTheme.gradient} p-6 rounded-3xl shadow-lg text-black text-center relative overflow-hidden group`} style={{ boxShadow: `0 10px 40px ${activeTheme.glow}` }}>
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700"><activeTheme.icon size={120} /></div>
              <p className="text-black/50 text-xs font-black uppercase tracking-widest mb-1 relative z-10">Total Accumulation</p>
              <div className="text-6xl font-black relative z-10 tabular-nums">{isRolling ? '...' : total}</div>
            </div>
          </section>

          <section className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/30 rounded-[2.5rem] p-8 md:p-12 border border-zinc-800/50 shadow-inner min-h-[450px] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-8 left-8 flex items-center gap-3 z-30">
                {Object.keys(THEMES).map((t) => (
                  <button key={t} onClick={() => { setTheme(t); if(roomId) updateRoomState({theme: t}); }} className={`w-4 h-4 rounded-full transition-all border-2 ${theme === t ? 'scale-125 border-white ring-2 ring-white/10' : 'border-zinc-800'} ${THEMES[t].bgAccent}`}/>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-6 z-10">
                {diceList.map((die) => <Die key={die.id} value={die.value} type={die.type} isRolling={isRolling} theme={theme} />)}
              </div>
              <button 
                onClick={rollDice} disabled={isRolling}
                className={`mt-16 px-16 py-6 rounded-2xl font-black text-xl uppercase tracking-[0.2em] transition-all transform active:scale-95 z-10 flex items-center gap-3 ${isRolling ? 'bg-zinc-800 text-zinc-600 border border-zinc-700 shadow-none' : `bg-white text-black ${activeTheme.button} hover:text-white shadow-xl`}`}
                style={{ boxShadow: !isRolling ? `0 0 30px ${activeTheme.glow}` : 'none' }}
              >
                {isRolling ? 'Igniting...' : <><Zap size={24} fill="currentColor" /> Strike Dice</>}
              </button>
            </div>
          </section>
        </main>

        {showHistory && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-end" onClick={() => setShowHistory(false)}>
            <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/10">
                <h2 className="text-xl font-black italic flex items-center gap-3"><History className={activeTheme.accent} /> LOGS</h2>
                <button onClick={() => setShowHistory(false)} className="text-zinc-400 hover:text-white p-2 text-2xl">×</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                    <History size={48} className="mb-2" />
                    <p>No rolls logged</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl flex items-center justify-between group hover:border-zinc-700 transition-all">
                      <div>
                        <p className="text-[9px] font-black text-zinc-600 uppercase mb-2 tracking-widest">{item.timestamp}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.dice.map((d, i) => <span key={i} className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${activeTheme.bgAccent} text-black`}>{d.value}</span>)}
                        </div>
                      </div>
                      <div className={`text-4xl font-black ${activeTheme.accent}`}>{item.total}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .clip-path-triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
        .clip-path-diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
        .clip-path-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </div>
  );
}
