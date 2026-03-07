import React, { useState } from 'react';
import { 
  Dices, 
  Loader2,
  Save, 
  Trash2,
  Zap, 
  Check,
  BookOpen,
  Sword,
  Sparkles,
  FileText,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  Coins,
  Package,
  Star,
  Edit2,
  Plus
} from 'lucide-react';
import { getModifier, formatBonus, getProficiencyBonus } from '../utils/helpers';
import { STAT_KEYS, ABILITY_SKILLS } from '../constants';

export const CharacterSheet = React.forwardRef(({ 
  character, setCharacter, selectedImage, isEditingName, setIsEditingName, handleNameChange, 
  reRollName, reRollStory, reRollAppearance, 
  exportPDF, saveToLibrary, setStep, regenerateCharacter,
  playVoice, isSpeaking, forgeCustomLoot, isForgingLoot,
  refreshTrackers, isRefreshingTrackers
}: any, ref: any) => {
  const [editingAttackIdx, setEditingAttackIdx] = useState<number | null>(null);
  const [attackEditForm, setAttackEditForm] = useState({ name: '', bonus: 0, damage: '', type: '' });
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const [itemEditForm, setItemEditForm] = useState({ name: '', summary: '', source: '' });

  if (!character) return null;

  const cleanSourceText = (src: string) => src ? src.replace(/[()[\]]/g, '') : '';

  // --- Attack Handlers ---
  const moveAttack = (idx: number, dir: number) => {
    const arr = character.mainAttacks || [];
    if (idx + dir < 0 || idx + dir >= arr.length) return;
    const newArr = [...arr];
    [newArr[idx], newArr[idx + dir]] = [newArr[idx + dir], newArr[idx]];
    setCharacter({ ...character, mainAttacks: newArr });
  };
  const deleteAttack = (idx: number) => {
    const newArr = [...(character.mainAttacks || [])];
    newArr.splice(idx, 1);
    setCharacter({ ...character, mainAttacks: newArr });
  };
  const addAttack = () => {
    const newArr = [...(character.mainAttacks || []), { name: 'New Attack', bonus: 0, damage: '1d4', type: 'bludgeoning' }];
    setCharacter({ ...character, mainAttacks: newArr });
    setEditingAttackIdx(newArr.length - 1);
    setAttackEditForm(newArr[newArr.length - 1]);
  };
  const saveAttackEdit = (idx: number) => {
    const newArr = [...(character.mainAttacks || [])];
    newArr[idx] = attackEditForm;
    setCharacter({ ...character, mainAttacks: newArr });
    setEditingAttackIdx(null);
  };

  // --- Item Handlers ---
  const moveItem = (idx: number, dir: number) => {
    const arr = character.equipment || [];
    if (idx + dir < 0 || idx + dir >= arr.length) return;
    const newArr = [...arr];
    [newArr[idx], newArr[idx + dir]] = [newArr[idx + dir], newArr[idx]];
    setCharacter({ ...character, equipment: newArr });
  };
  const deleteItem = (idx: number) => {
    const newArr = [...(character.equipment || [])];
    newArr.splice(idx, 1);
    setCharacter({ ...character, equipment: newArr });
  };
  const addItem = () => {
    const newItem = { name: 'New Item', summary: '', source: 'Custom' };
    const newArr = [newItem, ...(character.equipment || [])];
    setCharacter({ ...character, equipment: newArr });
    setEditingItemIdx(0);
    setItemEditForm(newItem);
  };
  const saveItemEdit = (idx: number) => {
    const newArr = [...(character.equipment || [])];
    newArr[idx] = itemEditForm;
    setCharacter({ ...character, equipment: newArr });
    setEditingItemIdx(null);
  };

  return (
    <div className="py-10 animate-in fade-in duration-700 text-zinc-900">
      <div className="flex flex-wrap justify-center gap-4 mb-12 no-print text-white font-black italic uppercase">
        <button onClick={exportPDF} className="bg-orange-600 px-8 py-3 rounded-full flex items-center gap-2 shadow-lg hover:bg-orange-700 transition-all text-white"><FileText size={18} /> Export PDF</button>
        <button onClick={() => setStep(9)} className="bg-orange-950/50 text-orange-400 px-8 py-3 rounded-full flex items-center gap-2 border border-orange-900/50 hover:bg-orange-900/40 transition-all"><Sparkles size={18} /> Art Weaver</button>
        <button onClick={() => setStep(11)} className="bg-orange-950/50 text-orange-400 px-8 py-3 rounded-full flex items-center gap-2 border border-orange-900/50 hover:bg-orange-900/40 transition-all"><ChevronsUp size={18} /> Level-Up</button>
        <button onClick={saveToLibrary} className="bg-zinc-100 text-zinc-950 px-8 py-3 rounded-full flex items-center gap-2 shadow-lg hover:bg-zinc-200 transition-all text-zinc-950"><Save size={18} /> Archive Hero</button>
        <button onClick={() => regenerateCharacter()} className="bg-zinc-900 text-zinc-400 p-3 rounded-full border border-zinc-800 hover:text-white hover:bg-zinc-800 transition-all" title="Regenerate Hero"><RefreshCw size={18} /></button>
      </div>

      <div ref={ref} className="bg-stone-50 text-zinc-900 shadow-2xl rounded-sm font-serif border border-stone-200 overflow-hidden max-w-5xl mx-auto printable-record">
        {/* PAGE 1 */}
        <div className="page-section p-8 relative flex flex-col text-zinc-950 font-black italic uppercase">
          <div className="flex flex-col md:flex-row gap-6 border-b-4 border-zinc-900 pb-4 mb-4">
            {selectedImage ? <img src={selectedImage} className="w-48 h-48 object-cover border-4 border-zinc-900 shadow-lg grayscale" alt="" /> : <div className="w-48 h-48 bg-stone-200 border-4 border-dashed border-stone-400 flex items-center justify-center text-stone-400 font-black">NO PORTRAIT</div>}
            <div className="flex-1 space-y-2 overflow-hidden text-zinc-950">
              <div className="flex items-center gap-3 w-full h-16 relative">
                {isEditingName ? (<input autoFocus value={character.coreIdentity?.name || ""} onChange={(e) => handleNameChange(e.target.value)} onBlur={() => setIsEditingName(false)} className="text-4xl font-black uppercase tracking-tighter leading-tight w-full bg-stone-200 p-1 border-2 border-orange-500 outline-none text-zinc-950 font-black italic" />) : (<div onClick={() => setIsEditingName(true)} className="flex-1 h-full cursor-pointer hover:bg-stone-200 transition-colors px-1 flex items-center overflow-hidden"><h1 className="text-4xl font-black uppercase tracking-tighter italic text-zinc-950 truncate">{character.coreIdentity?.name || "UNNAMED HERO"}</h1></div>)}
                <button onClick={(e) => { e.stopPropagation(); reRollName(); }} className="p-2 bg-stone-200 hover:bg-orange-500 hover:text-white rounded-lg transition-all text-stone-400 shadow-sm no-print"><Dices size={18} /></button>
                <button onClick={playVoice} disabled={isSpeaking} className="p-2 bg-orange-100 hover:bg-orange-600 hover:text-white rounded-lg transition-all text-orange-600 shadow-sm disabled:opacity-50 no-print" title="Voice of the Hero">
                  {isSpeaking ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                </button>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase italic text-orange-800">
                <span className="bg-stone-200 px-2 py-0.5 border border-stone-300 font-black">Lvl {character.coreIdentity?.level}</span>
                <span className="bg-stone-200 px-2 py-0.5 border border-stone-300 font-black">{character.coreIdentity?.species}</span>
                <span className="bg-stone-200 px-2 py-0.5 border border-stone-300 font-black">{character.coreIdentity?.className}</span>
                <span className="bg-stone-200 px-2 py-0.5 border border-stone-300 font-black">{character.coreIdentity?.background}</span>
              </div>
              <div className="grid grid-cols-5 gap-2 bg-white border-2 border-zinc-900 p-2 shadow-sm mt-4 text-center">
                <div className="border-r border-stone-200"><span className="block text-[9px] tracking-wider text-stone-400 font-black italic uppercase">AC</span><span className="text-xl font-black">{character.vitals?.ac || 10}</span></div>
                <div className="border-r border-stone-200"><span className="block text-[9px] tracking-wider text-stone-400 font-black italic uppercase">HP</span><span className="text-xl font-black">{character.vitals?.hp || 10}</span></div>
                <div className="border-r border-stone-200"><span className="block text-[9px] tracking-wider text-stone-400 font-black italic uppercase">Speed</span><span className="text-xl font-black">{character.vitals?.speed || "30ft"}</span></div>
                <div className="border-r border-stone-200"><span className="block text-[9px] tracking-wider text-stone-400 font-black italic uppercase">Init</span><span className="text-xl font-black">{formatBonus(character.vitals?.initiative || 0)}</span></div>
                <div className="text-zinc-950 font-black italic uppercase"><span className="block text-[9px] tracking-wider text-stone-400">Prof</span><span className="text-xl text-orange-800">+{getProficiencyBonus(character.coreIdentity?.level || 1)}</span></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6 flex-1 text-zinc-950 font-black italic uppercase">
            <div className="w-full md:w-48 shrink-0 space-y-1.5 font-black italic uppercase text-zinc-950">
              {STAT_KEYS.map(key => {
                const val = character.abilityScores?.[key] || 10; const mod = getModifier(val);
                const isSaveProf = (character.savingThrowProficiencies || []).some((s: string) => s.toLowerCase() === key.toLowerCase());
                const lvlProf = getProficiencyBonus(character.coreIdentity?.level || 1);
                return (<div key={key} className="border-2 border-zinc-900 p-1.5 bg-white shadow-sm relative flex flex-col pt-4"><span className="absolute top-0.5 left-1 text-[9px] tracking-wider font-black">{key}</span><div className="flex items-end justify-between mb-1 mt-0.5"><div className="text-2xl tabular-nums leading-none font-black">{val}</div><div className="text-base bg-zinc-900 text-white px-2 py-0.5 rounded text-center leading-none min-w-[2.2rem] font-black">{formatBonus(mod)}</div></div><div className="w-full space-y-0.5 pt-0.5 border-t border-stone-200 font-black"><div className={`flex items-center justify-between text-[8px] ${isSaveProf ? 'text-orange-800' : 'opacity-60'}`}><span className="flex items-center gap-1">{isSaveProf && <Check size={7} strokeWidth={4} />} Save</span><span>{formatBonus(mod + (isSaveProf ? lvlProf : 0))}</span></div>{(ABILITY_SKILLS[key] || []).map(skill => { const isProf = (character.skillProficiencies || []).some((s: string) => s.toLowerCase() === skill.toLowerCase()); const isExpert = (character.expertise || []).some((s: string) => s.toLowerCase() === skill.toLowerCase()); const totalProf = isExpert ? 2 : (isProf ? 1 : 0); return (<div key={skill} className={`flex items-center justify-between text-[8px] ${totalProf > 0 ? 'text-orange-800' : 'opacity-60'}`}><span className="flex items-center gap-1">{totalProf > 0 && Array.from({length: totalProf}).map((_, i) => <Check key={i} size={7} strokeWidth={4} className={i > 0 ? "-ml-1.5" : ""} />)} {skill}</span><span>{formatBonus(mod + (totalProf * lvlProf))}</span></div>); })}</div></div>);
              })}
            </div>
            <div className="flex-1 flex flex-col space-y-4 font-black italic uppercase text-zinc-950 text-left">
              <section className="flex-1 flex flex-col">
                <h3 className="text-xl border-b-2 border-zinc-900 mb-1 flex items-center gap-2 italic font-black uppercase"><Sword size={20} /> Combat</h3>
                <table className="w-full text-left text-sm mb-1 font-black italic uppercase text-zinc-950">
                  <thead>
                    <tr className="text-[10px] text-stone-400 border-b uppercase font-black italic">
                      <th>Attack</th>
                      <th className="text-center font-black italic uppercase text-zinc-950">Bonus</th>
                      <th className="text-right font-black italic uppercase text-zinc-400 pr-1">Damage</th>
                      <th className="w-0 no-print"><button onClick={addAttack} className="p-1 hover:text-orange-500 transition-colors"><Plus size={12} strokeWidth={3} /></button></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(character.mainAttacks || []).map((a: any, i: number) => {
                      if (editingAttackIdx === i) {
                        return (
                          <tr key={i} className="border-b border-stone-200 uppercase text-xs italic font-black text-zinc-900 bg-stone-100">
                            <td className="py-1 flex gap-1">
                              <input value={attackEditForm.name} onChange={e => setAttackEditForm({...attackEditForm, name: e.target.value})} className="w-full bg-white border border-stone-300 p-0.5 outline-none focus:border-orange-500" placeholder="Name" />
                            </td>
                            <td className="text-center px-1">
                              <input type="number" value={attackEditForm.bonus} onChange={e => setAttackEditForm({...attackEditForm, bonus: parseInt(e.target.value) || 0})} className="w-12 mx-auto bg-white border border-stone-300 p-0.5 outline-none focus:border-orange-500 text-center" />
                            </td>
                            <td className="text-right px-1 pt-1 pb-1">
                              <div className="flex gap-1 justify-end">
                                <input value={attackEditForm.damage} onChange={e => setAttackEditForm({...attackEditForm, damage: e.target.value})} className="w-16 bg-white border border-stone-300 p-0.5 outline-none focus:border-orange-500 text-right" placeholder="1d8+3" />
                                <input value={attackEditForm.type} onChange={e => setAttackEditForm({...attackEditForm, type: e.target.value})} className="w-16 bg-white border border-stone-300 p-0.5 outline-none focus:border-orange-500 text-right" placeholder="Type" />
                              </div>
                            </td>
                            <td className="no-print w-0 whitespace-nowrap align-middle pl-1 pr-1">
                               <button onClick={() => saveAttackEdit(i)} className="text-green-600 hover:text-green-500 p-1"><Check size={14} strokeWidth={4} /></button>
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={i} className="border-b border-stone-200 uppercase text-xs italic font-black text-zinc-900 group">
                          <td className="py-1">{a.name}</td>
                          <td className="text-center">{formatBonus(a.bonus)}</td>
                          <td className="text-right italic lowercase text-zinc-600 font-serif font-medium pr-1">{a.damage} {a.type}</td>
                          <td className="no-print w-0 whitespace-nowrap align-middle pr-1">
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 pl-1 transition-opacity text-stone-400">
                              <button onClick={() => moveAttack(i, -1)} className="hover:text-zinc-900"><ChevronUp size={12}/></button>
                              <button onClick={() => moveAttack(i, 1)} className="hover:text-zinc-900"><ChevronDown size={12}/></button>
                              <button onClick={() => { setEditingAttackIdx(i); setAttackEditForm(a); }} className="hover:text-orange-500"><Edit2 size={12}/></button>
                              <button onClick={() => deleteAttack(i)} className="hover:text-red-500"><Trash2 size={12}/></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 4 - (character.mainAttacks?.length || 0)) }).map((_, i) => (
                      <tr key={`empty-${i}`} className="border-b border-stone-100"><td className="py-2.5 h-6"></td><td className="h-6"></td><td className="h-6"></td><td className="no-print w-0"></td></tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex-1 combat-ruled-lines mt-2 opacity-10" />
              </section>
              <section className="mt-auto pt-4 border-t border-dashed border-stone-300 font-black italic uppercase text-zinc-950 text-left">
                <div className="flex items-center justify-between mb-2 text-zinc-950 font-black uppercase italic">
                  <h3 className="text-xs tracking-widest flex items-center gap-1">
                    <Star size={12} className="text-orange-500" /> Trackers 
                    <button onClick={refreshTrackers} disabled={isRefreshingTrackers} className="p-1 text-stone-400 hover:text-orange-500 transition-colors no-print" title="Auto-detect Actions">
                       <RefreshCw size={12} className={isRefreshingTrackers ? "animate-spin" : ""} />
                    </button>
                  </h3>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-900 rounded-sm font-black uppercase text-[8px] text-zinc-900 italic">Inspiration <div className="w-3.5 h-3.5 border-2 border-zinc-900 rounded-full font-black uppercase italic" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase italic text-zinc-700">
                  <div className="bg-stone-100 p-2 border border-stone-300 rounded-sm font-black italic uppercase"><div>Bonus Action <span className="text-[6px] not-italic">Tactical (BA)</span></div><div className="leading-tight text-zinc-950">{(character.vitals?.bonusActions || []).join(", ") || "None"}</div></div>
                  <div className="bg-stone-100 p-2 border border-stone-300 rounded-sm font-black italic uppercase text-zinc-950"><div>Reaction <span className="text-[6px] not-italic">Tactical (R)</span></div><div className="leading-tight text-zinc-950">{(character.vitals?.reactions || []).join(", ") || "None"}</div></div>
                </div>
              </section>
            </div>
          </div>
        </div>
        {/* PAGE 2 ARSENAL */}
        <div className="page-section page-break p-8 text-zinc-950 font-black italic uppercase">
            <div className="flex justify-between items-end border-b-4 border-zinc-900 mb-6 pb-2 text-zinc-900 font-black uppercase italic"><h2 className="text-4xl flex items-center gap-3"><BookOpen size={32} /> Arsenal</h2><p className="text-orange-800 tracking-widest text-xs font-black uppercase italic">Features & Equipment</p></div>
            <div className="grid grid-cols-2 gap-12 h-auto mb-8 border-b-2 border-stone-200 pb-8 text-zinc-950 font-black italic uppercase text-left">
              <section><h3 className="text-[10px] tracking-[0.2em] text-stone-400 mb-2 border-b border-stone-300 pb-1 italic font-black uppercase text-zinc-950">Class & Subclass</h3><div className="space-y-4 overflow-hidden text-zinc-950 font-black italic uppercase">{(character.classFeatures || []).concat(character.subclassFeatures || []).map((f: any, i: number) => (<div key={i} className="text-[10px] leading-tight mb-2 break-inside-avoid"><strong className="block mb-0.5 font-black uppercase italic text-zinc-950">{f.name} <span className="text-[7px] text-zinc-800 not-italic font-black italic uppercase">[{cleanSourceText(f.source)}]</span></strong><p className="text-zinc-600 font-serif not-italic normal-case lowercase text-[9px] font-medium">{f.summary}</p></div>))}</div></section>
              <section>
                  <div className="space-y-8">
                    <div><h3 className="text-[10px] tracking-[0.2em] text-stone-400 mb-2 border-b border-stone-300 pb-1 italic font-black uppercase text-zinc-950">Feats</h3><div className="space-y-3 font-black uppercase italic">{(character.feats || []).map((f: any, i: number) => (<div key={i} className="text-[10px] font-black uppercase italic break-inside-avoid"><strong className="block font-black uppercase italic text-zinc-950">Feat {i+1}: {f.name} <span className="text-[7px] text-zinc-800 not-italic font-black italic uppercase">[{cleanSourceText(f.source)}]</span></strong><p className="text-stone-600 font-serif not-italic normal-case lowercase text-[9px] font-medium">{f.summary}</p></div>))}</div></div>
                    <div><h3 className="text-[10px] tracking-[0.2em] text-stone-400 mb-2 border-b border-stone-300 pb-1 italic font-black uppercase text-zinc-400">Species Traits</h3><div className="space-y-3 overflow-hidden font-black italic uppercase text-zinc-950">{(character.speciesFeatures || []).map((f: any, i: number) => (<div key={i} className="text-[10px] leading-tight break-inside-avoid"><strong className="block mb-0.5">{f.name} <span className="text-[7px] text-zinc-800 not-italic font-black italic uppercase">[{cleanSourceText(f.source)}]</span></strong><p className="text-stone-600 font-serif not-italic lowercase normal-case text-[9px] font-medium">{f.summary}</p></div>))}</div></div>
                  </div>
              </section>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <section className="col-span-2 font-black italic uppercase text-zinc-950 text-left">
                <div className="flex justify-between items-end border-b border-stone-300 pb-1 mb-2">
                  <h3 className="text-[10px] tracking-[0.2em] text-stone-400 italic font-black uppercase flex items-center gap-1">
                    <Package size={14} className="-mt-0.5" /> Equipment 
                    <button onClick={addItem} className="text-orange-500 hover:text-orange-600 no-print ml-1"><Plus size={12}/></button>
                  </h3>
                  <button onClick={forgeCustomLoot} disabled={isForgingLoot} className="text-[8px] flex items-center gap-1 text-orange-600 hover:text-orange-500 transition-colors no-print">
                      {isForgingLoot ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} FORGE LOOT
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-zinc-950 font-black italic uppercase">
                  {(character.equipment || []).map((item: any, i: number) => { 
                    if (editingItemIdx === i) {
                      return (
                        <div key={i} className="text-[10px] border-b border-stone-100 py-1 leading-tight flex flex-col gap-1 bg-stone-100 p-1 rounded-sm col-span-2 md:col-span-1">
                          <input value={itemEditForm.name} onChange={e=>setItemEditForm({...itemEditForm, name:e.target.value})} className="w-full bg-white border border-stone-300 px-1 py-0.5 outline-none focus:border-orange-500" placeholder="Name" />
                          <input value={itemEditForm.source} onChange={e=>setItemEditForm({...itemEditForm, source:e.target.value})} className="w-full bg-white border border-stone-300 px-1 py-0.5 outline-none focus:border-orange-500 text-[8px]" placeholder="Source (e.g. PHB 150)" />
                          <textarea value={itemEditForm.summary} onChange={e=>setItemEditForm({...itemEditForm, summary:e.target.value})} className="w-full bg-white border border-stone-300 px-1 py-0.5 outline-none focus:border-orange-500 text-[8px] resize-none normal-case font-serif" placeholder="Summary" rows={2} />
                          <button onClick={() => saveItemEdit(i)} className="bg-orange-500 text-white p-1 flex items-center justify-center no-print rounded-sm hover:bg-orange-600 transition-colors"><Check size={12} strokeWidth={4} className="mr-1" /> Save Item</button>
                        </div>
                      );
                    }
                    const itName = typeof item === 'string' ? item : item.name; 
                    const itSum = typeof item === 'string' ? '' : item.summary; 
                    const itSrc = typeof item === 'string' ? '' : item.source; 
                    return (
                      <div key={i} className="text-[10px] border-b border-stone-100 py-1 leading-tight relative group pr-2">
                        <strong className="block font-black uppercase italic">{itName} {itSrc && <span className="text-[7px] text-zinc-800 not-italic font-black italic uppercase">[{cleanSourceText(itSrc)}]</span>}</strong>
                        {itSum && <p className="text-stone-500 font-serif not-italic line-clamp-1 lowercase text-[8px] font-medium">{itSum}</p>}
                        <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 flex gap-1 no-print text-stone-500 bg-stone-50 border border-stone-200 shadow-sm p-0.5 rounded-sm z-10">
                            <button onClick={() => moveItem(i, -1)} className="hover:text-zinc-900"><ChevronUp size={10}/></button>
                            <button onClick={() => moveItem(i, 1)} className="hover:text-zinc-900"><ChevronDown size={10}/></button>
                            <button onClick={() => { setEditingItemIdx(i); setItemEditForm(typeof item === 'string' ? {name: item, summary: '', source: ''} : item); }} className="hover:text-orange-500"><Edit2 size={10}/></button>
                            <button onClick={() => deleteItem(i)} className="hover:text-red-600"><Trash2 size={10}/></button>
                        </div>
                      </div>
                    ); 
                  })}
                  {Array.from({ length: Math.max(0, 10 - (character.equipment?.length || 0)) }).map((_, i) => (<div key={`empty-eq-${i}`} className="text-[10px] border-b border-stone-100 h-8" />))}
                </div>
              </section>
              <section className="space-y-6 font-black italic uppercase text-zinc-950 text-left"><div><h3 className="text-[10px] tracking-[0.2em] text-stone-400 mb-2 border-b border-stone-300 pb-1 italic font-black uppercase">Attunement</h3><div className="space-y-1 text-zinc-950 font-black italic uppercase">{(character.attunedItems || []).map((item: any, i: number) => (<div key={i} className="h-auto border-b border-stone-200 text-[9px] px-1 py-1 italic">{typeof item === 'string' ? item : item.name}</div>))}{Array.from({ length: Math.max(0, 3 - (character.attunedItems?.length || 0)) }).map((_, i) => (<div key={i} className="h-6 border-b border-stone-200 text-[9px] italic text-stone-300 flex items-center px-1 not-italic opacity-40">Available</div>))}</div></div><div><h3 className="text-[10px] tracking-[0.2em] text-stone-400 mb-2 border-b border-stone-300 pb-1 italic font-black uppercase"><Coins size={14} /> Currency</h3><div className="flex justify-between border-b border-stone-200 px-1 text-xs pt-2 font-black italic uppercase tracking-tighter"><span>Wealth</span><span>{character.currency?.gp || 0} GP</span></div></div></section>
            </div>
        </div>
        {/* PAGE 3 STORY */}
        <div className="page-section page-break p-8 text-zinc-900 font-black italic uppercase">
            <div className="flex justify-between items-end border-b-4 border-zinc-900 mb-4 pb-2 text-zinc-900 font-black uppercase italic"><h2 className="text-4xl flex items-center gap-3 font-black italic uppercase"><BookOpen size={32} /> Description</h2><p className="text-orange-800 text-xs font-black uppercase italic">{character.coreIdentity?.name || "Unnamed"}</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-black italic uppercase text-zinc-900 text-left">
              <div className="md:col-span-2 space-y-4 text-sm font-black italic uppercase text-zinc-900"><section><div className="flex items-center justify-between border-b-2 border-zinc-900 mb-3 uppercase italic font-black text-zinc-900"><h3 className="text-2xl font-black italic uppercase text-zinc-900">Heroic Origins</h3><div className="flex gap-2"><button onClick={reRollStory} className="p-1 text-zinc-400 hover:text-orange-500 transition-colors no-print font-black italic uppercase"><RefreshCw size={18} /></button></div></div><p className="text-[13px] leading-snug whitespace-pre-wrap text-zinc-950 normal-case italic font-serif font-medium text-justify">{character.backgroundStory}</p></section></div>
              <div className="space-y-6 font-black italic uppercase text-zinc-900"><section className="bg-stone-100 p-4 border-2 border-stone-200 text-zinc-900 font-black italic uppercase"><div className="flex items-center justify-between border-b border-stone-300 pb-1 mb-2 italic text-zinc-900 font-black uppercase"><h3 className="text-xs font-black italic uppercase text-zinc-900">Appearance</h3><button onClick={reRollAppearance} className="p-1 text-zinc-300 hover:text-orange-500 transition-colors no-print font-black italic uppercase"><RefreshCw size={14} /></button></div><p className="text-[13px] leading-relaxed whitespace-pre-wrap font-serif font-medium not-italic normal-case lowercase text-zinc-900">{character.description}</p></section></div>
            </div>
        </div>
        {/* PAGE 4 SPELLS */}
        {character.spellcasting && character.spellcasting.isCaster && (
          <div className="page-section page-break p-8 text-zinc-900 font-black italic uppercase text-zinc-950">
            <div className="flex justify-between items-end border-b-4 border-zinc-900 mb-2 pb-2 text-zinc-900 font-black uppercase italic"><h2 className="text-4xl flex items-center gap-3 font-black uppercase italic text-zinc-950"><Zap size={32} /> Spellcasting</h2><div className="flex gap-4 text-orange-800 text-xs font-black italic uppercase tracking-tighter"><span>DC: {character.spellcasting.spellDC}</span><span>Atk: {formatBonus(character.spellcasting.spellAttack)}</span></div></div>
            <div className="flex flex-wrap gap-4 mb-8 p-3 bg-stone-100 border border-stone-200 rounded-sm text-zinc-900 font-black italic uppercase">
                {Object.entries(character.spellcasting.slots || {}).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([lvl, count]: any) => (<div key={lvl} className="flex flex-col items-center border-r border-stone-300 pr-4 last:border-0 font-black uppercase italic"><span className="text-[7px] text-stone-400 mb-1 leading-none uppercase font-black italic">Lv{lvl}</span><div className="flex gap-1">{Array.from({ length: count }).map((_, i) => (<div key={i} className="w-2.5 h-2.5 border border-zinc-950 rounded-sm bg-white shadow-sm font-black italic uppercase" />))}</div></div>))}
            </div>
            <div className="spell-grid-container text-zinc-900 font-black italic uppercase text-left">
              {Object.entries(character.spellcasting?.spellsByLevel || character.spellcasting?.spells || {}).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([lvl, spells]: any) => {
                if (!spells || spells.length === 0) return null;
                return (
                  <div key={lvl} className="break-inside-avoid mb-6 border-b border-stone-100 pb-4 font-black italic uppercase text-left">
                    <h4 className="text-sm text-zinc-500 border-b border-stone-300 pb-1 mb-2 italic uppercase font-black tracking-widest">Level {lvl} Spells</h4>
                    <div className="space-y-3">
                      {(spells || []).map((s: any, i: number) => (
                        <div key={i} className="text-[14px] leading-tight font-black uppercase italic">
                          <strong className="text-zinc-950 font-black italic uppercase">{s.name}:</strong> <span className="text-zinc-600 font-serif not-italic normal-case font-medium">{s.summary}</span> <span className="text-[7px] text-zinc-400 not-italic normal-case font-black italic uppercase">[{cleanSourceText(s.source)}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {character.coreIdentity?.className === 'Warlock' && (
                <div className="break-inside-avoid mb-6 border-b border-stone-100 pb-4 font-black italic uppercase text-left">
                  <h4 className="text-sm text-zinc-500 border-b border-stone-300 pb-1 mb-2 italic uppercase font-black tracking-widest">Eldritch Invocations</h4>
                  <div className="space-y-3">
                    {(character.invocations || character.classFeatures?.filter((f: any) => f.name.toLowerCase().includes('invocation')) || []).map((f: any, i: number) => (
                      <div key={i} className="text-[14px] leading-tight font-black uppercase italic">
                        <strong className="text-zinc-950 font-black italic uppercase">{f.name.replace(/Eldritch Invocation:?\s*/i, '')}:</strong> <span className="text-zinc-600 font-serif not-italic normal-case font-medium">{f.summary}</span> <span className="text-[7px] text-zinc-400 not-italic normal-case font-black italic uppercase">[{cleanSourceText(f.source)}]</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
