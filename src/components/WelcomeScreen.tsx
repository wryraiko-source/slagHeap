import React from 'react';
import { Sword, Zap } from 'lucide-react';
import { SETTINGS } from '../constants';

export const WelcomeScreen = ({ resetForge, slagSetting, setSlagSetting, handleCheckTheSlag, slagLevel, setSlagLevel }: any) => (
  <div className="max-w-2xl mx-auto space-y-6 py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 text-white font-black italic uppercase">
    <div className="mb-10 text-white font-black uppercase italic"><h2 className="text-4xl tracking-tighter">the foundry is hot</h2><p className="text-zinc-500 font-serif normal-case italic text-lg">Ready the iron.</p></div>
    <button onClick={resetForge} className="w-full group relative overflow-hidden p-8 bg-zinc-900 border-2 border-zinc-800 hover:border-blue-500 rounded-3xl transition-all shadow-2xl flex flex-col items-center justify-center">
      <div className="flex items-center gap-4 mb-2 font-black italic uppercase"><Sword size={48} className="text-zinc-400 group-hover:text-blue-400" /><h3 className="text-4xl tracking-tight italic">Fresh Ore</h3></div>
    </button>
    <div className="relative group overflow-hidden bg-gradient-to-br from-orange-600 via-orange-700 to-red-900 border-2 border-orange-500 rounded-3xl transition-all shadow-2xl flex flex-col">
      <div className="flex items-stretch">
        <div className="w-28 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 cursor-pointer border-r border-white/10">
          <label className="text-[9px] text-orange-200 uppercase tracking-widest mb-1 opacity-60 font-black italic">World</label>
          <select value={slagSetting} onChange={(e) => setSlagSetting(e.target.value)} className="bg-transparent text-white font-black text-xs outline-none cursor-pointer appearance-none px-2 text-center uppercase tracking-tighter italic">
            <option value="Random" className="bg-zinc-900">RND</option>
            {SETTINGS.map(s => (<option key={s} value={s} className="bg-zinc-900 italic">{s.slice(0, 10)}</option>))}
          </select>
        </div>
        <button onClick={handleCheckTheSlag} className="flex-1 p-8 flex flex-col items-center justify-center gap-1 hover:bg-black/10 transition-all text-center italic">
          <div className="flex items-center gap-4 mb-2"><Zap size={48} fill="currentColor" /><h3 className="text-4xl font-black uppercase tracking-tight italic">Check the Slag</h3></div>
        </button>
        <div className="w-24 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 cursor-pointer border-l border-white/10 italic">
          <label className="text-[9px] font-black text-orange-200 uppercase tracking-widest mb-1 opacity-60 font-black italic">Level</label>
          <select value={slagLevel} onChange={(e) => setSlagLevel(e.target.value)} className="bg-transparent text-white font-black text-xl outline-none cursor-pointer appearance-none px-2 text-center italic font-black">
            <option value="Random" className="bg-zinc-900 text-sm italic">RND</option>
            {Array.from({ length: 20 }).map((_, i) => (<option key={i+1} value={i+1} className="bg-zinc-900 italic font-black">{i+1}</option>))}
          </select>
        </div>
      </div>
    </div>
  </div>
);
