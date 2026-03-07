import React from 'react';
import { Download, Upload, ChevronRight, Trash2 } from 'lucide-react';
import { ScreenWrapper } from './ScreenWrapper';

export const ArchiveScreen = ({ savedCharacters, setCharacter, setSelectedImage, setStep, setView, deleteChar, fileInputRef, onImport }: any) => (
  <ScreenWrapper title="Archives">
    <div className="flex gap-4 mb-8 justify-center text-white font-black uppercase italic">
      <button onClick={() => { const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedCharacters)); const dlAnchor = document.createElement('a'); dlAnchor.setAttribute("href", dataStr); dlAnchor.setAttribute("download", `Archive_Export.json`); dlAnchor.click(); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-orange-500 transition-all text-zinc-400 text-xs"><Download size={16} /> Export JSON</button>
      <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-orange-500 transition-all text-zinc-400 text-xs"><Upload size={16} /> Import JSON</button>
      <input type="file" ref={fileInputRef} onChange={onImport} accept=".json" className="hidden" />
    </div>
    <div className="grid gap-4">
      {savedCharacters.map((char: any) => (
        <div key={char.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex items-center justify-between hover:border-orange-500 transition-all group text-white font-black uppercase italic">
          <div className="flex items-center gap-6">
            {char.portrait ? <img src={char.portrait} className="w-16 h-16 rounded-xl object-cover border border-zinc-800" alt="" /> : <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-600">N/A</div>}
            <div><h3 className="text-xl text-zinc-100 italic">{char.coreIdentity?.name || "Unnamed"}</h3><p className="text-orange-500 text-sm tracking-widest">Lvl {char.coreIdentity?.level} {char.coreIdentity?.species} {char.coreIdentity?.className}</p></div>
          </div>
          <div className="flex gap-2 text-white"><button onClick={() => { setCharacter(char); setSelectedImage(char.portrait); setStep(10); setView('generator'); }} className="p-2 bg-zinc-800 hover:bg-orange-600 rounded-lg transition-colors"><ChevronRight size={18} /></button><button onClick={() => deleteChar(char.id)} className="p-2 bg-zinc-800 hover:bg-red-600 rounded-lg transition-colors text-white"><Trash2 size={18} /></button></div>
        </div>
      ))}
    </div>
  </ScreenWrapper>
);
