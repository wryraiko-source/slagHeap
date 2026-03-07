import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { collection, doc, setDoc, onSnapshot, addDoc, deleteDoc } from 'firebase/firestore';
import { 
  Dices, 
  AlertCircle,
  Loader2,
  History, 
  Flame,
  ChevronRight, 
  Upload,
  Lock,
  Check,
  Sparkles,
  Trash2,
  FileText
} from 'lucide-react';

import { fAuth, fDb, appId, hasFirebase } from './firebase';
import { callGemini, generateCharacterImage, callGeminiTTS } from './utils/api';
import { compressImage } from './utils/helpers';
import { 
  SETTINGS, ART_STYLES, STAT_KEYS, SPECIES_CATEGORIES, ALL_SPECIES, 
  GENDERS, BACKGROUND_CATEGORIES, BACKGROUND_DATA, CLASS_DATA, SUBCLASS_DATA, ALL_SKILLS 
} from './constants';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

import { ScreenWrapper } from './components/ScreenWrapper';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ArchiveScreen } from './components/ArchiveScreen';
import { CharacterSheet } from './components/CharacterSheet';

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Forging Hero...");
  const [error, setError] = useState<string | null>(null);
  const [character, setCharacter] = useState<any>(null);
  const [imageChoices, setImageChoices] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedRef, setUploadedRef] = useState<string | null>(null);
  const [savedCharacters, setSavedCharacters] = useState<any[]>([]);
  const [view, setView] = useState('welcome');
  const [slagLevel, setSlagLevel] = useState("Random");
  const [slagSetting, setSlagSetting] = useState("Random");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isForgingLoot, setIsForgingLoot] = useState(false);
  const [isRefreshingTrackers, setIsRefreshingTrackers] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [levelUpClass, setLevelUpClass] = useState("");
  const [levelUpSubclass, setLevelUpSubclass] = useState("");
   
  const recordRef = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const artUploadRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<any>({
    level: 1, setting: "Faerun", species: "Human", customSpecies: "", className: "Fighter", subclass: "", background: "Soldier",
    name: "", gender: "Male", customGender: "", statRules: "4d6 drop the lowest", manualStats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    hpRules: "Roll for HP", skillProficiencies: [], keyFeatures: "", artStyle: "Classic D&D", artTweaks: ""
  });

  useEffect(() => {
    if (!hasFirebase) {
      setUser({ uid: 'local-user' });
      return;
    }
    const initAuth = async () => {
      try {
        // @ts-ignore
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          // @ts-ignore
          await signInWithCustomToken(fAuth, __initial_auth_token);
        } else {
          await signInAnonymously(fAuth);
        }
      } catch (err) { console.error("Auth Error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(fAuth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    if (!hasFirebase) {
      const localChars = JSON.parse(localStorage.getItem('savedCharacters') || '[]');
      setSavedCharacters(localChars);
      return;
    }
    const q = collection(fDb, 'artifacts', appId, 'users', user.uid, 'characters');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSavedCharacters(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (err) => console.error("Firestore error:", err));
    return () => unsubscribe();
  }, [user]);

  const updateFormVal = (field: string, value: any) => setFormData((prev: any) => ({ ...prev, [field]: value }));
  const updateManualStat = (stat: string, val: string) => setFormData((p: any) => ({ ...p, manualStats: { ...p.manualStats, [stat]: parseInt(val) || 10 } }));
  const handleNameChange = (val: string) => {
    setFormData((prev: any) => ({ ...prev, name: val }));
    if (character) {
      setCharacter((prev: any) => ({
        ...prev,
        coreIdentity: { ...prev.coreIdentity, name: val }
      }));
    }
  };
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const resetForge = () => {
    setCharacter(null); setSelectedImage(null); setUploadedRef(null); setImageChoices([]); setStep(1); setView('generator');
    setFormData({
      level: 1, setting: "Faerun", species: "Human", customSpecies: "", className: "Fighter", subclass: "", background: "Soldier",
      name: "", gender: "Male", customGender: "", statRules: "4d6 drop the lowest", manualStats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      hpRules: "Roll for HP", skillProficiencies: [], keyFeatures: "", artStyle: "Classic D&D", artTweaks: ""
    });
  };

  const handleArtUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event: any) => {
      const compressed = await compressImage(event.target.result, 1024, 0.8);
      setUploadedRef(compressed);
    };
    reader.readAsDataURL(file);
  };

  const toggleSkillChoice = (skillName: string) => {
    const bgSkills = BACKGROUND_DATA[formData.background]?.skills || [];
    if (bgSkills.includes(skillName)) return;
    const limit = CLASS_DATA[formData.className]?.skillCount || 2;
    setFormData((prev: any) => {
      const isProf = prev.skillProficiencies.includes(skillName);
      if (isProf) return { ...prev, skillProficiencies: prev.skillProficiencies.filter((s: string) => s !== skillName) };
      if (prev.skillProficiencies.length < limit) return { ...prev, skillProficiencies: [...prev.skillProficiencies, skillName] };
      return prev;
    });
  };

  const generateCharacterData = async (overrideData: any = null) => {
    setLoadingMessage("Forging Hero...");
    setLoading(true); setError(null);
    const activeData = overrideData || formData;
    try {
      const sysPrompt = `You are a D&D 2024 Foundry Master. Generate character JSON.
      STRICT CONSTRAINTS:
      - NAME: If coreIdentity.name is empty, generate a random unique name with syllables/keywords typical for ${activeData.species} and ${activeData.gender}.
      - ABILITY SCORES: You MUST generate scores defaulting to 4d6-drop-lowest logic.
      - PROFICIENCIES: You MUST provide a "skillProficiencies" array based on 2024 Class and Background rules. If the character has Expertise in any skills, include them in an "expertise" array. Expertise means "apply the proficiency bonus an additional time" (do not say "Double the proficiency bonus").
      - NARRATIVE: 'backgroundStory' max 4 paragraphs, 'description' max 150 words. Draw from a wide variety of high fantasy themes, tropes, and aesthetics. DO NOT overuse "slag", "forge", or "foundry" themes unless explicitly requested in the User Detail.
      - SUBCLASS: If the character level qualifies for a subclass (usually level 3, sometimes 1 or 2 depending on class), integrate the provided subclass. If they do not qualify yet, store the intended subclass in the metadata or ignore it for now.
      - MILESTONES: Populate Level 1 Origin Feat and milestones [4, 8, 12, 16, 19] as reached.
      - SUMMARIES: EVERY feature, feat, trait, item, and spell MUST have a descriptive "summary".
      - CITATIONS: For structured data 'source' fields, use format "Book Page" (e.g. PHB 123) WITHOUT parentheses.
      - COMBAT/GEAR: Generate 'mainAttacks' and 'equipment' arrays with summaries. Provide a FULL inventory of starting equipment based on their Class and Background, plus appropriate adventuring gear, tools, and potentially magic items if they are higher level. Do not provide a minimal inventory.
      - SPELLCASTING: Calculate correct "spellDC" (8 + Prof + Mod) and "spellAttack" (Prof + Mod). Populate "spellsByLevel" with actual spell objects. Do NOT return empty arrays.
      - WARLOCK: If class is Warlock, populate 'invocations' array with chosen Eldritch Invocations.
      Structure: { 
        "coreIdentity": { "name": "...", "species": "...", "className": "...", "subclass": "...", "level": ${activeData.level}, "background": "...", "alignment": "...", "gender": "..." }, 
        "abilityScores": { "str": 10, "dex": 10, "con": 10, "int": 10, "wis": 10, "cha": 10 }, 
        "vitals": { "hp": 10, "ac": 15, "speed": "30ft", "initiative": 2, "bonusActions": [], "reactions": [] }, 
        "skillProficiencies": ["Athletics"], "expertise": [], "savingThrowProficiencies": [], 
        "mainAttacks": [ { "name": "...", "bonus": 5, "damage": "...", "type": "..." } ], 
        "classFeatures": [ { "name": "...", "summary": "...", "source": "PHB 123" } ], 
        "subclassFeatures": [], "speciesFeatures": [], "feats": [], "invocations": [ { "name": "...", "summary": "...", "source": "PHB 123" } ],
        "equipment": [ { "name": "...", "summary": "...", "source": "PHB 210" } ], "attunedItems": [],
        "currency": { "gp": 10 }, 
        "spellcasting": { "isCaster": true, "spellAttack": 5, "spellDC": 13, "slots": { "1": 4 }, "spellsByLevel": { "0": [{ "name": "Firebolt", "summary": "1d10 fire dmg", "source": "PHB 200" }], "1": [] } }, 
        "description": "...", "backgroundStory": "..." 
      }`;
      const queryText = `Forge Lvl ${activeData.level} ${activeData.species} ${activeData.className}${activeData.subclass ? ` (${activeData.subclass})` : ''}. Gender: ${activeData.gender}. World: ${activeData.setting}. Background: ${activeData.background}. User Detail: ${activeData.keyFeatures}`;
      const res = await callGemini(queryText, sysPrompt, true);
      const parsed = JSON.parse(res!.replace(/```json|```/g, '').trim());
      
      if (!parsed || !parsed.coreIdentity || !parsed.coreIdentity.name) {
        throw new Error("Invalid character data received from Forge.");
      }
      
      setCharacter(parsed); setStep(10);
    } catch (err: any) { 
      console.error(err);
      setError(`Foundry Failure: ${err.message}. Please try regenerating.`); 
    }
    finally { setLoading(false); }
  };

  const reRollName = async () => {
    if (!character) return;
    setLoadingMessage("Consulting Lineage..."); setLoading(true);
    try {
      const prompt = `Generate a unique thematic D&D name for a ${character.coreIdentity?.gender} ${character.coreIdentity?.species} ${character.coreIdentity?.className}. Synergy with ${formData.setting}. Syllabic accuracy required. Return ONLY name. Do not use "slag", "forge", or "foundry" themes.`;
      const res = await callGemini(prompt, "Naming Forge.");
      handleNameChange(res!.trim());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const reRollStory = async () => {
    if (!character) return;
    setLoadingMessage("Consulting the Weave..."); setLoading(true);
    try {
      const prompt = `Generate a 4-paragraph story for ${character.coreIdentity?.name}, Lvl ${character.coreIdentity?.level} ${character.coreIdentity?.species} ${character.coreIdentity?.className}. World: ${formData.setting}. Use citation format (Abbrv XX) for world references. Draw from a wide variety of high fantasy themes. Do not overuse "slag", "forge", or "foundry" themes.`;
      const res = await callGemini(prompt, "Narrative Weaver.");
      setCharacter({ ...character, backgroundStory: res!.trim() });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const reRollAppearance = async () => {
    if (!character) return;
    setLoadingMessage("Visualizing Hero..."); setLoading(true);
    try {
      const prompt = `Describe the appearance of ${character.coreIdentity?.name}, a ${character.coreIdentity?.species} ${character.coreIdentity?.className}. Max 150 words. Focus on gear and distinctive traits. Draw from a wide variety of high fantasy aesthetics. Do not overuse "slag", "forge", or "foundry" themes.`;
      const res = await callGemini(prompt, "Visual Weaver.");
      setCharacter({ ...character, description: res!.trim() });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const generateArt = async () => {
    if (!character) return;
    setLoadingMessage("Casting Vision..."); setLoading(true); setError(null);
    try {
      const identity = character.coreIdentity || {};
      const contextData = {
        name: identity.name || "Unknown",
        species: identity.species || formData.species,
        gender: identity.gender || formData.gender,
        class: identity.className || formData.className,
        background: identity.background || formData.background,
        setting: formData.setting,
        appearance: character.description || "No description available.",
        backstory: character.backgroundStory || "No backstory available.",
        style: formData.artStyle,
        tweaks: formData.artTweaks
      };

      const systemPrompt = `You are an expert Fantasy Art Director for D&D. 
      Generate 3 distinct, highly detailed image generation prompts based on this character profile.
      
      STRICT REQUIREMENTS:
      1. SUBJECT: ${contextData.gender} ${contextData.species} ${contextData.class}.
      2. SETTING: ${contextData.setting}. Ensure background elements reflect this world.
      3. APPEARANCE: Use specific details from: "${contextData.appearance}".
      4. STYLE: ${contextData.style}.
      5. DETAILS: Include specific class equipment, background hints (${contextData.background}), and atmospheric lighting.
      6. OUTPUT: Return ONLY a valid JSON array of 3 strings.
      
      Profile Context:
      ${JSON.stringify(contextData)}
      `;

      let prompts;
      if (uploadedRef) {
        const res = await callGemini(`Analyze the reference image and the character profile. Generate 3 prompts blending the reference composition with the character details. Output JSON array.`, systemPrompt, true, uploadedRef);
        prompts = JSON.parse(res!.replace(/```json|```/g, '').trim());
      } else {
        const res = await callGemini(`Generate 3 detailed prompts for this character. Output JSON array.`, systemPrompt, true);
        prompts = JSON.parse(res!.replace(/```json|```/g, '').trim());
      }
      
      const imgs = await Promise.all(prompts.slice(0, 3).map((p: string) => generateCharacterImage(p)));
      setImageChoices(imgs); setStep(9);
    } catch (err: any) { setError(`Vision failed: ${err.message}`); } finally { setLoading(false); }
  };

  const playVoice = async () => {
    if (!character || isSpeaking) return;
    setIsSpeaking(true);
    try {
      const prompt = `Write a short, punchy, 1-sentence in-character battle cry or introductory quote for ${character.coreIdentity.name}, a ${character.coreIdentity.gender} ${character.coreIdentity.species} ${character.coreIdentity.className}. Backstory: ${character.backgroundStory}. Return ONLY the spoken quote, no quotes around it.`;
      const quote = await callGemini(prompt, "You are a roleplay actor.");
      
      let voice = "Zephyr";
      if (character.coreIdentity.gender?.toLowerCase() === 'male') voice = "Fenrir";
      if (character.coreIdentity.gender?.toLowerCase() === 'female') voice = "Kore";
      
      const audioUrl = await callGeminiTTS(quote!, voice);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch(e) {
      console.error("TTS Error:", e);
      setIsSpeaking(false);
    }
  };

  const forgeCustomLoot = async () => {
    if (!character || isForgingLoot) return;
    setIsForgingLoot(true);
    try {
      const prompt = `Create a custom, unique magic item (Uncommon or Rare) perfectly suited for ${character.coreIdentity.name}, a ${character.coreIdentity.species} ${character.coreIdentity.className}. Focus on synergizing with their backstory: ${character.backgroundStory}. 
      Output valid JSON strictly in this format: { "name": "Item Name", "summary": "Brief mechanical effect (e.g., +1 to hit, 1/day cast shield)", "source": "Custom" }`;
      const res = await callGemini(prompt, "You are a D&D Magic Item creator.", true);
      const newItem = JSON.parse(res!.replace(/```json|```/g, '').trim());
      
      setCharacter((prev: any) => ({
          ...prev,
          equipment: [newItem, ...(prev.equipment || [])]
      }));
    } catch(e) {
      console.error("Loot Forge Error:", e);
    } finally {
      setIsForgingLoot(false);
    }
  };

  const levelUpCharacter = async (classNameToLevel: string, subclassNameToLevel?: string) => {
    if (!character) return;
    setLoadingMessage(`Leveling up ${classNameToLevel}...`);
    setLoading(true);
    setError(null);
    try {
      const sysPrompt = `You are a D&D 2024 Foundry Master. The user is leveling up their character from total level ${character.coreIdentity.level} to ${character.coreIdentity.level + 1}. They are adding 1 level in the class: ${classNameToLevel}${subclassNameToLevel ? ` (Subclass: ${subclassNameToLevel})` : ''}.
      Update the provided character JSON to reflect the new level.
      
      STRICT CONSTRAINTS:
      - If this is a new class for the character, apply the 1st-level multiclassing benefits as described in the PHB 2024.
      - If this is an existing class, add that class's next level of features.
      - Follow proper rules for spell slots when multiclassing (PHB 2024 rules). Calculate spell slots according to multi-classing rules in the PHB.
      - Update coreIdentity.className to reflect the new class levels (e.g. "Fighter 5 / Wizard 1").
      - ONLY update: coreIdentity.level, coreIdentity.className, vitals.hp (add average HP + CON mod), classFeatures, subclassFeatures, feats, spellcasting (slots, spells, DC, attack), invocations, and any bonuses that scale with Proficiency Bonus.
      - DO NOT change: name, species, gender, background, alignment, abilityScores, equipment, attunedItems, currency, description, backgroundStory.
      - Return ONLY the updated JSON matching the exact schema provided.`;
      
      const res = await callGemini(JSON.stringify(character), sysPrompt, true);
      const parsed = JSON.parse(res!.replace(/```json|```/g, '').trim());
      setCharacter(parsed);
      setStep(10);
      setLevelUpClass("");
      setLevelUpSubclass("");
    } catch (err: any) {
      setError(`Level-Up Failure: ${err.message}`);
      setStep(10);
    } finally {
      setLoading(false);
    }
  };

  const refreshTrackers = async () => {
    if (!character || isRefreshingTrackers) return;
    setIsRefreshingTrackers(true);
    try {
      const payload = `Analyze this D&D character. Extract all abilities, spells, and items that cost a "Bonus Action" or "Reaction" in 5e rules.
      Character data: ${JSON.stringify({
        class: character.classFeatures,
        species: character.speciesFeatures,
        feats: character.feats,
        equipment: character.equipment,
        spells: character.spellcasting?.spellsByLevel
      })}
      Output strictly as JSON matching this schema: { "bonusActions": ["Short Name 1", "Short Name 2"], "reactions": ["Short Name 1"] }`;
      const res = await callGemini(payload, "You are a D&D rules expert. Output only valid JSON.", true);
      const parsed = JSON.parse(res!.replace(/```json|```/g, '').trim());
      setCharacter((prev: any) => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          bonusActions: parsed.bonusActions || prev.vitals?.bonusActions || [],
          reactions: parsed.reactions || prev.vitals?.reactions || []
        }
      }));
    } catch (err) { console.error("Tracker refresh failed:", err); }
    finally { setIsRefreshingTrackers(false); }
  };

  const handleCheckTheSlag = () => {
    setCharacter(null); setSelectedImage(null); setUploadedRef(null);
    const finalLevel = slagLevel === "Random" ? Math.floor(Math.random() * 20) + 1 : parseInt(slagLevel);
    const finalSetting = slagSetting === "Random" ? SETTINGS[Math.floor(Math.random() * (SETTINGS.length - 1))] : slagSetting;
    let availableSpecies = [...SPECIES_CATEGORIES["Common"]];
    if (finalSetting === "Eberron") availableSpecies.push(...SPECIES_CATEGORIES["Eberron"]);
    else if (finalSetting === "Wildemount") availableSpecies.push(...SPECIES_CATEGORIES["Wildemount"]);
    else if (finalSetting === "Faerun" || finalSetting === "Sword Coast") availableSpecies.push(...SPECIES_CATEGORIES["Faerun/Regional"]);
    else if (finalSetting === "Spelljammer") availableSpecies.push(...SPECIES_CATEGORIES["Spelljammer"]);
    else { availableSpecies = ALL_SPECIES.filter(s => s !== "Custom"); }
    let availableBackgrounds = Object.values(BACKGROUND_CATEGORIES).flat();
    const randomClass = Object.keys(CLASS_DATA)[Math.floor(Math.random() * Object.keys(CLASS_DATA).length)];
    const randomSubclass = SUBCLASS_DATA[randomClass] ? SUBCLASS_DATA[randomClass][Math.floor(Math.random() * SUBCLASS_DATA[randomClass].length)] : "";
    const slagData = { ...formData, level: finalLevel, setting: finalSetting, species: availableSpecies[Math.floor(Math.random() * availableSpecies.length)], background: availableBackgrounds[Math.floor(Math.random() * availableBackgrounds.length)], gender: GENDERS[Math.floor(Math.random() * (GENDERS.length - 1))], className: randomClass, subclass: randomSubclass, keyFeatures: "" };
    setFormData(slagData); setView('generator'); generateCharacterData(slagData);
  };

  const saveToLibrary = async () => {
    if (!user || !character) return;
    setLoadingMessage("Archiving Hero..."); setLoading(true);
    try {
      let portrait = selectedImage;
      if (portrait && portrait.length > 500000) portrait = await compressImage(portrait);
      
      if (!hasFirebase) {
        const newChar = { ...character, portrait, createdAt: new Date().toISOString(), id: Date.now().toString() };
        const updated = [newChar, ...savedCharacters];
        setSavedCharacters(updated);
        localStorage.setItem('savedCharacters', JSON.stringify(updated));
        setView('library');
        setLoading(false);
        return;
      }

      const col = collection(fDb, 'artifacts', appId, 'users', user.uid, 'characters');
      await addDoc(col, { ...character, portrait, createdAt: new Date().toISOString() });
      setView('library');
    } catch (err) { setError("Archive failed."); } finally { setLoading(false); }
  };

  const deleteChar = async (id: string) => {
    if (!user) return;
    if (!hasFirebase) {
      const updated = savedCharacters.filter(c => c.id !== id);
      setSavedCharacters(updated);
      localStorage.setItem('savedCharacters', JSON.stringify(updated));
      return;
    }
    try { await deleteDoc(doc(fDb, 'artifacts', appId, 'users', user.uid, 'characters', id)); } catch (err) { console.error(err); }
  };

  const exportPDF = () => {
    if (!recordRef.current) return;
    
    setIsExportingPDF(true);
    
    setTimeout(async () => {
      try {
        const element = recordRef.current as HTMLElement;
        const pages = element.querySelectorAll('.page-section');
        
        if (!pages || pages.length === 0) {
          throw new Error("No pages found to export.");
        }
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const margin = 10;
        const printWidth = pdfWidth - (margin * 2);
        
        for (let i = 0; i < pages.length; i++) {
          const pageEl = pages[i] as HTMLElement;
          
          // Capture the page as PNG using html-to-image (supports modern CSS like oklch)
          const dataUrl = await toPng(pageEl, {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            style: {
              margin: '0',
              boxShadow: 'none',
              transform: 'none'
            }
          });
          
          const imgProps = pdf.getImageProperties(dataUrl);
          const printHeight = (imgProps.height * printWidth) / imgProps.width;
          
          if (i > 0) {
            pdf.addPage();
          }
          
          pdf.addImage(dataUrl, 'PNG', margin, margin, printWidth, printHeight);
        }
        
        pdf.save(`${character.coreIdentity?.name || 'hero'}.pdf`);
      } catch (err) {
        console.error("PDF Export failed:", err);
        setError("PDF Export failed. Please try again.");
      } finally {
        setIsExportingPDF(false);
      }
    }, 100);
  };

  const handleImport = (e: any) => { 
    const file = e.target.files[0]; if (!file || !user) return; const reader = new FileReader(); 
    reader.onload = async (event: any) => { 
      try { 
        const imported = JSON.parse(event.target.result); if (!Array.isArray(imported)) return; 
        setLoadingMessage("Checking Old Records..."); setLoading(true); 
        
        if (!hasFirebase) {
          const updated = [...imported.map(c => ({...c, id: c.id || Date.now().toString() + Math.random()})), ...savedCharacters];
          setSavedCharacters(updated);
          localStorage.setItem('savedCharacters', JSON.stringify(updated));
          setLoading(false);
          return;
        }

        const col = collection(fDb, 'artifacts', appId, 'users', user.uid, 'characters'); 
        for (const char of imported) { const { id, ...clean } = char; await addDoc(col, clean); } 
        setLoading(false); 
      } catch (err) { setError("Import failed."); setLoading(false); } 
    }; 
    reader.readAsText(file); 
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30">
      <header className="py-8 text-center no-print">
        <div className="inline-block px-12 py-4 border-4 border-zinc-900 bg-zinc-900 shadow-2xl rounded-sm">
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic text-orange-500 drop-shadow-[0_0_15px_rgba(255,165,0,0.5)]">SlagHeap</h1>
            <p className="text-xs font-bold tracking-[0.3em] uppercase mt-2 text-zinc-500 font-black">Salvaging legends from the foundry floor</p>
        </div>
      </header>

      <nav className="flex justify-center gap-4 mb-12 no-print text-white font-black italic uppercase">
        {['welcome', 'generator', 'library'].map(id => (
          <button key={id} onClick={() => setView(id)} className={`flex items-center gap-2 px-6 py-2 rounded-full font-black uppercase transition-all border-2 ${view === id ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>
            {id === 'welcome' ? <Flame size={16} /> : id === 'generator' ? <Dices size={16} /> : <History size={16} />} 
            {id === 'library' ? 'Archives' : id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        ))}
      </nav>

      <main className="container mx-auto pb-24 px-4 relative">
        {isExportingPDF && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-sm text-white font-black italic uppercase text-center animate-in fade-in duration-300">
            <Loader2 size={64} className="text-orange-500 animate-spin mb-6 mx-auto" />
            <h3 className="text-3xl tracking-widest mb-4">Scribing PDF...</h3>
            <p className="text-zinc-400 text-lg max-w-md normal-case not-italic font-medium">
              Capturing the essence of your hero into a permanent record.
            </p>
          </div>
        )}
        {error && <div className="max-w-md mx-auto mb-8 p-4 bg-red-900/20 border border-red-900 rounded-xl text-red-400 font-black uppercase italic"><AlertCircle size={20} /> {error}</div>}
        
        {loading && view !== 'welcome' ? (
          <div className="flex flex-col items-center justify-center py-20 text-white font-black italic uppercase text-center animate-pulse">
            <Loader2 size={64} className="text-orange-500 animate-spin mb-4 mx-auto" />
            <h3 className="text-2xl tracking-widest">{loadingMessage}</h3>
          </div>
        ) : (
          <>
            {view === 'welcome' && (
              <WelcomeScreen 
                resetForge={resetForge} 
                slagSetting={slagSetting} 
                setSlagSetting={setSlagSetting} 
                handleCheckTheSlag={handleCheckTheSlag} 
                slagLevel={slagLevel} 
                setSlagLevel={setSlagLevel} 
              />
            )}

            {view === 'library' && (
              <ArchiveScreen 
                savedCharacters={savedCharacters}
                setCharacter={setCharacter}
                setSelectedImage={setSelectedImage}
                setStep={setStep}
                setView={setView}
                deleteChar={deleteChar}
                fileInputRef={fileInputRef}
                onImport={handleImport}
                user={user}
                setError={setError}
                setLoading={setLoading}
              />
            )}

            {view === 'generator' && (
              <div className="max-w-4xl mx-auto">
                {step === 1 && (
                  <ScreenWrapper title="Power" subtitle="Set level">
                    <div className="relative w-full mb-12 mt-8 px-2"><input type="range" min="1" max="20" value={formData.level} onChange={e => updateFormVal('level', parseInt(e.target.value))} className="w-full accent-orange-500 h-2 bg-zinc-800 rounded-lg" /></div>
                    <div className="text-center text-9xl font-black mb-8 italic drop-shadow-2xl text-white">Lvl {formData.level}</div>
                    <button onClick={nextStep} className="w-full bg-orange-600 py-4 rounded-2xl font-black uppercase text-xl hover:bg-orange-700 transition-all italic text-white">Continue <ChevronRight className="inline" /></button>
                  </ScreenWrapper>
                )}
                {/* ... Steps 2 through 7 (Generator Logic kept in main for now as requested) ... */}
                {step === 2 && (
                    <ScreenWrapper title="World" subtitle="Select Setting">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-white font-black italic uppercase">
                      {SETTINGS.map(s => (
                        <button key={s} onClick={() => { updateFormVal('setting', s); nextStep(); }} className="aspect-square flex items-center justify-center p-8 rounded-3xl border-4 border-zinc-800 hover:border-orange-500 hover:bg-orange-500/5 transition-all text-xl italic tracking-tighter text-center">{s}</button>
                      ))}
                    </div>
                  </ScreenWrapper>
                )}
                {step === 3 && (
                  <ScreenWrapper title="Identity" subtitle="Define the Being">
                    <div className="space-y-4 text-white font-black italic uppercase text-left">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[10px] text-zinc-500 ml-1 italic uppercase">Name</label><input placeholder="..." value={formData.name} onChange={e => updateFormVal('name', e.target.value)} className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 rounded-xl focus:border-orange-500 outline-none text-white font-black uppercase italic" /></div>
                        <div className="space-y-1"><label className="text-[10px] text-zinc-500 ml-1 italic uppercase">Gender</label><select value={formData.gender} onChange={e => updateFormVal('gender', e.target.value)} className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 rounded-xl text-white font-black uppercase italic">{GENDERS.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[10px] text-zinc-500 ml-1 italic uppercase">Species</label><select value={formData.species} onChange={e => updateFormVal('species', e.target.value)} className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 rounded-xl text-white font-black uppercase italic">{Object.entries(SPECIES_CATEGORIES).map(([cat, list]) => (<optgroup key={cat} label={`${cat} Races`}>{list.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>))}</select></div>
                        <div className="space-y-1"><label className="text-[10px] text-zinc-500 ml-1 italic uppercase">Class</label><select value={formData.className} onChange={e => { updateFormVal('className', e.target.value); updateFormVal('subclass', ''); }} className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 rounded-xl text-white font-black uppercase italic">{Object.keys(CLASS_DATA).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[10px] text-zinc-500 ml-1 italic uppercase">Subclass</label><select value={formData.subclass} onChange={e => updateFormVal('subclass', e.target.value)} disabled={!formData.className} className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 rounded-xl text-white font-black uppercase italic disabled:opacity-50"><option value="">Select Subclass (Optional)</option>{formData.className && SUBCLASS_DATA[formData.className]?.map(sc => <option key={sc} value={sc}>{sc}</option>)}</select></div>
                        <div className="space-y-1"><label className="text-[10px] text-zinc-500 ml-1 italic uppercase">Background</label><select value={formData.background} onChange={e => updateFormVal('background', e.target.value)} className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 rounded-xl text-white font-black uppercase italic">{Object.entries(BACKGROUND_CATEGORIES).map(([cat, list]) => (<optgroup key={cat} label={`${cat} Backgrounds`}>{list.map(b => <option key={b} value={b}>{b}</option>)}</optgroup>))}</select></div>
                      </div>
                      <div className="flex gap-4 pt-4 font-black italic uppercase"><button onClick={prevStep} className="flex-1 bg-zinc-800 py-4 rounded-xl hover:bg-zinc-700 transition-all font-black">Back</button><button onClick={nextStep} className="flex-1 bg-orange-600 py-4 rounded-xl hover:bg-orange-700 transition-all text-xl font-black">Continue</button></div>
                    </div>
                  </ScreenWrapper>
                )}
                {/* Manual Steps 4-7 Preserved */}
                {step === 4 && (
                  <ScreenWrapper title="Abilities" subtitle="Methodology">
                    <div className="space-y-6 text-white font-black italic uppercase">
                      <div className="grid grid-cols-2 gap-4">{["4d6 drop low", "3d6", "Point Buy", "Manual"].map(m => (<button key={m} onClick={() => updateFormVal('statRules', m)} className={`p-4 rounded-xl border-2 transition-all ${formData.statRules === m ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}>{m}</button>))}</div>
                      {(formData.statRules === "Point Buy" || formData.statRules === "Manual") && (<div className="grid grid-cols-3 gap-4 bg-zinc-900 p-6 rounded-2xl border-2 border-zinc-800">{STAT_KEYS.map(s => (<div key={s} className="space-y-1 text-left"><label className="text-[10px] text-zinc-500 ml-1 uppercase font-black italic">{s}</label><input type="number" value={formData.manualStats[s]} onChange={e => updateManualStat(s, e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-center outline-none focus:border-orange-500 text-white font-black uppercase italic" /></div>))}</div>)}
                      <div className="flex gap-4 pt-4 font-black uppercase italic text-white"><button onClick={prevStep} className="flex-1 bg-zinc-800 py-4 rounded-xl hover:bg-zinc-700 transition-all">Back</button><button onClick={nextStep} className="flex-1 bg-orange-600 py-4 rounded-xl hover:bg-orange-700 transition-all text-xl font-black">Continue</button></div>
                    </div>
                  </ScreenWrapper>
                )}
                {step === 5 && (
                  <ScreenWrapper title="Resilience" subtitle="HP Strategy">
                    <div className="space-y-6 text-center text-white font-black italic uppercase">
                      <div className="grid grid-cols-2 gap-4">{["Roll for HP", "Take Average"].map(m => (<button key={m} onClick={() => updateFormVal('hpRules', m)} className={`p-6 rounded-2xl border-2 transition-all ${formData.hpRules === m ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}>{m}</button>))}</div>
                      <div className="flex gap-4"><button onClick={prevStep} className="flex-1 bg-zinc-800 py-4 rounded-xl transition-all hover:bg-zinc-700 font-black">Back</button><button onClick={nextStep} className="flex-1 bg-orange-600 py-4 rounded-xl hover:bg-orange-700 transition-all italic text-xl font-black">Continue</button></div>
                    </div>
                  </ScreenWrapper>
                )}
                {step === 6 && (
                  <ScreenWrapper title="Expertise" subtitle={`${formData.className} Skills`}>
                    <div className="space-y-8 text-white font-black italic uppercase text-left">
                        <div className="mb-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                          <label className="text-[10px] text-orange-500 mb-2 block tracking-widest font-black uppercase italic">Background Proficiencies</label>
                          <div className="flex flex-wrap gap-2 text-zinc-900 font-black italic uppercase">{(BACKGROUND_DATA[formData.background]?.skills || []).map(s => (<span key={s} className="px-3 py-1 bg-orange-500/10 border border-orange-500/40 rounded-lg text-[10px] text-orange-200 flex items-center gap-1.5 shadow-sm"><Lock size={10} /> {s}</span>))}</div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-3"><h4>Selection</h4><span className="text-[10px] text-orange-500 px-2 py-0.5 bg-orange-950/20 rounded border border-orange-900/50 italic font-black uppercase">Select {CLASS_DATA[formData.className]?.skillCount}</span></div>
                          <div className="grid grid-cols-2 gap-3 text-zinc-900">
                             {ALL_SKILLS.map(s => {
                               const isClassOption = CLASS_DATA[formData.className]?.skills?.includes(s.name);
                               const bgSkills = BACKGROUND_DATA[formData.background]?.skills || [];
                               const isBgSkill = bgSkills.includes(s.name);
                               const isSelected = formData.skillProficiencies.includes(s.name);
                               if (!isClassOption) return null;
                               return (<button key={s.name} onClick={() => toggleSkillChoice(s.name)} disabled={isBgSkill} className={`p-3 rounded-xl border-2 text-[10px] transition-all flex items-center justify-between shadow-sm font-black italic uppercase ${isBgSkill ? 'border-orange-500/20 bg-zinc-900/40 text-orange-950 cursor-not-allowed opacity-40' : isSelected ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}><span>{s.name}</span>{isBgSkill ? <Lock size={12} /> : isSelected && <Check size={12} strokeWidth={4}/>}</button>);
                             })}
                          </div>
                        </div>
                        <div className="flex gap-4 pt-4 text-white"><button onClick={prevStep} className="flex-1 bg-zinc-800 py-4 rounded-xl hover:bg-zinc-700 transition-all font-black italic uppercase">Back</button><button onClick={nextStep} className="flex-1 bg-orange-600 py-4 rounded-xl hover:bg-orange-700 transition-all italic text-xl text-white font-black italic uppercase">Continue</button></div>
                    </div>
                  </ScreenWrapper>
                )}
                {step === 7 && (
                  <ScreenWrapper title="Traits" subtitle="Define the Soul">
                    <textarea rows={6} value={formData.keyFeatures} onChange={e => updateFormVal('keyFeatures', e.target.value)} className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-orange-500 text-white resize-none font-black italic uppercase" placeholder="..." />
                    <div className="flex gap-4 mt-4 text-white font-black italic uppercase"><button onClick={prevStep} className="flex-1 bg-zinc-800 py-4 rounded-xl hover:bg-zinc-700 transition-all font-black">Back</button><button onClick={() => generateCharacterData()} className="flex-1 bg-orange-600 py-4 rounded-xl hover:bg-orange-700 transition-all text-xl font-black">Forge Hero</button></div>
                  </ScreenWrapper>
                )}
                {step === 8 && character && (
                  <div className="text-center py-20 animate-in zoom-in-95 duration-700 text-white font-black italic uppercase">
                    <div className="flex items-center justify-center gap-4 mb-2 font-black italic uppercase"><h1 className="text-7xl tracking-tighter drop-shadow-2xl">{character.coreIdentity?.name || "Unnamed"}</h1><button onClick={reRollName} className="p-2 bg-white/10 hover:bg-orange-500 rounded-full transition-colors group text-white"><Sparkles size={24} className="text-zinc-400 group-hover:text-white" /></button></div>
                    <p className="text-2xl text-orange-500 uppercase tracking-widest mb-12 font-black italic uppercase">Lvl {character.coreIdentity?.level} {character.coreIdentity?.species} {character.coreIdentity?.className}</p>
                    <div className="flex flex-col max-w-sm mx-auto gap-4"><button onClick={() => setStep(10)} className="p-6 bg-orange-600 rounded-3xl text-2xl shadow-xl hover:bg-orange-700 transition-all font-black italic uppercase">View Record</button><button onClick={() => setStep(9)} className="p-4 bg-zinc-800 rounded-2xl text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-all font-black italic uppercase">Art Weaver</button></div>
                  </div>
                )}
                {step === 9 && (
                    <ScreenWrapper title="Art Weaver" subtitle="Visual direction">
                    {imageChoices.length > 0 && (<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-white font-black italic uppercase">{imageChoices.map((img, idx) => (<div key={idx} className="relative group"><img src={img} className="w-full rounded-2xl border-2 border-zinc-800 hover:border-orange-500 cursor-pointer aspect-square object-cover shadow-2xl" onClick={() => { setSelectedImage(img); setStep(10); }} alt="" /></div>))}</div>)}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-zinc-900 p-6 rounded-3xl border-2 border-zinc-800 space-y-4 text-white text-left font-black italic uppercase">
                        <div className="space-y-1"><label className="text-[10px] text-zinc-500 ml-1 italic uppercase font-black">Style Selection</label><select value={formData.artStyle} onChange={e => updateFormVal('artStyle', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm outline-none focus:border-orange-500 text-white font-black uppercase italic">{ART_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                        <textarea value={formData.artTweaks} onChange={e => updateFormVal('artTweaks', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm h-20 outline-none focus:border-orange-500 text-white font-black not-italic" placeholder="Direct visual tweaks..." />
                        <div className="flex gap-4 font-black italic uppercase text-white"><button onClick={() => setStep(10)} className="flex-1 bg-zinc-800 py-3 rounded-xl hover:bg-zinc-700 transition-all font-black">Back</button><button onClick={generateArt} className="flex-1 bg-orange-600 py-3 rounded-xl text-white hover:bg-orange-700 flex items-center justify-center gap-2 shadow-lg transition-all font-black italic uppercase"><Sparkles size={18}/> Cast Vision</button></div>
                      </div>
                      <div className="bg-zinc-900 p-6 rounded-3xl border-2 border-zinc-800 flex flex-col items-center justify-center gap-4 text-center font-black italic uppercase">
                        <h4 className="text-[10px] text-zinc-500 uppercase font-black italic tracking-widest">Refiner's Eye</h4>
                        {uploadedRef ? (
                           <div className="relative w-full aspect-square group"><img src={uploadedRef} className="w-full h-full object-cover rounded-xl border border-zinc-700 shadow-xl" alt="" /><div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl"><button onClick={() => { setSelectedImage(uploadedRef); setStep(10); }} className="p-2 bg-orange-600 rounded-lg hover:bg-orange-500 text-[10px] font-black uppercase italic">Use Directly</button><button onClick={() => setUploadedRef(null)} className="p-2 bg-zinc-800 rounded-lg hover:bg-red-600"><Trash2 size={16}/></button></div></div>
                        ) : (
                          <button onClick={() => artUploadRef.current?.click()} className="w-full h-full min-h-[160px] border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-orange-500 transition-colors text-zinc-600 hover:text-orange-500"><Upload size={32} /><span>Upload Reference</span></button>
                        )}
                        <input type="file" ref={artUploadRef} onChange={handleArtUpload} className="hidden" accept="image/*" />
                      </div>
                    </div>
                  </ScreenWrapper>
                )}

                {step === 11 && character && (
                  <ScreenWrapper title="Level-Up" subtitle="Choose a path">
                    <div className="space-y-6 text-center text-white font-black italic uppercase">
                      <p className="text-zinc-400">Current Level: {character.coreIdentity?.level}</p>
                      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 ml-1 italic uppercase">Class to Level</label>
                          <select 
                            value={levelUpClass || character.coreIdentity?.className?.split(' ')[0] || "Fighter"} 
                            onChange={e => {
                              setLevelUpClass(e.target.value);
                              setLevelUpSubclass("");
                            }} 
                            className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 rounded-xl text-white font-black uppercase italic"
                          >
                            {Object.keys(CLASS_DATA).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        
                        {(levelUpClass || character.coreIdentity?.className?.split(' ')[0] || "Fighter") && !character.coreIdentity?.className?.includes(levelUpClass || character.coreIdentity?.className?.split(' ')[0] || "Fighter") && SUBCLASS_DATA[levelUpClass || character.coreIdentity?.className?.split(' ')[0] || "Fighter"] && (
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 ml-1 italic uppercase">Subclass (Optional)</label>
                            <select 
                              value={levelUpSubclass} 
                              onChange={e => setLevelUpSubclass(e.target.value)} 
                              className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 rounded-xl text-white font-black uppercase italic"
                            >
                              <option value="">Random Subclass</option>
                              {SUBCLASS_DATA[levelUpClass || character.coreIdentity?.className?.split(' ')[0] || "Fighter"].map(sc => <option key={sc} value={sc}>{sc}</option>)}
                            </select>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => levelUpCharacter(levelUpClass || character.coreIdentity?.className?.split(' ')[0] || "Fighter", levelUpSubclass)} 
                          className="p-6 mt-4 rounded-2xl border-2 border-orange-500 bg-orange-500/10 hover:bg-orange-500/20 transition-all text-xl text-center"
                        >
                          +1 Level in {levelUpClass || character.coreIdentity?.className?.split(' ')[0] || "Fighter"}
                        </button>
                      </div>
                      <div className="flex gap-4 pt-8">
                        <button onClick={() => { setStep(10); setLevelUpClass(""); setLevelUpSubclass(""); }} className="flex-1 bg-zinc-800 py-4 rounded-xl hover:bg-zinc-700 transition-all font-black">Cancel</button>
                      </div>
                    </div>
                  </ScreenWrapper>
                )}

                {step === 10 && character && (
                  <CharacterSheet 
                    ref={recordRef}
                    character={character}
                    setCharacter={setCharacter}
                    selectedImage={selectedImage}
                    isEditingName={isEditingName}
                    setIsEditingName={setIsEditingName}
                    handleNameChange={handleNameChange}
                    reRollName={reRollName}
                    reRollStory={reRollStory}
                    reRollAppearance={reRollAppearance}
                    exportPDF={exportPDF}
                    saveToLibrary={saveToLibrary}
                    setStep={setStep}
                    regenerateCharacter={() => generateCharacterData()}
                    playVoice={playVoice}
                    isSpeaking={isSpeaking}
                    forgeCustomLoot={forgeCustomLoot}
                    isForgingLoot={isForgingLoot}
                    refreshTrackers={refreshTrackers}
                    isRefreshingTrackers={isRefreshingTrackers}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      <style>{`
        @media print { 
          body { 
            background: white !important; 
            color: black !important;
          }
          .no-print { display: none !important; } 
          .printable-record { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Ensure the background colors and images print correctly */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        .page-break { page-break-before: always; }
        .printable-record { background-color: #fafaf9; }
        .spell-grid-container { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem; }
        .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
        .page-section { min-height: 290mm; background-color: white; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        @media print {
          .page-section { margin-bottom: 0; box-shadow: none; min-height: auto; padding: 0 !important; }
        }
        .combat-ruled-lines { background-image: linear-gradient(#e5e7eb 1px, transparent 1px); background-size: 100% 24px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; background: #f97316; border-radius: 50%; cursor: pointer; border: 4px solid #18181b; }
      `}</style>
    </div>
  );
};

export default App;
