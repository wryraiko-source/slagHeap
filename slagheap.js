import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { 
  Dices, 
  User, 
  Shield, 
  Wand2, 
  Download, 
  AlertCircle,
  Loader2,
  Save, 
  History, 
  Trash2,
  Zap, 
  Flame,
  Check,
  BookOpen,
  Sword,
  Sparkles,
  ChevronRight,
  FileText,
  RefreshCw,
  ImageDown,
  ChevronLeft,
  Upload,
  FileJson,
  Lock,
  Coins,
  Package,
  Star,
  Settings2,
  Edit2,
  XCircle,
  RotateCcw
} from 'lucide-react';

/**
 * SLAGHEAP - v0.8.8 Alpha
 * Milestone: Resolved syntax truncation & ReferenceErrors.
 * Features: Dynamic Name Scaling, Art Weaver Feedback, Nickname variety, Hybrid Arsenal Logic.
 */

// --- Configuration ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "YOUR_FIREBASE_API_KEY",
      authDomain: "slagheap-7f791.firebaseapp.com",
      projectId: "slagheap-7f791",
      storageBucket: "slagheap-7f791.firebasestorage.app",
      messagingSenderId: "985062474894",
      appId: "YOUR_APP_ID"
    };

const apiKey = ""; 
const textModel = "gemini-2.5-flash-preview-09-2025";
const imageModel = "imagen-4.0-generate-001";

// Initialize Firebase
const fApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const fAuth = getAuth(fApp);
const fDb = getFirestore(fApp);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'slag-heap-gen';

// --- Constants & Data ---
const SETTINGS = ["Faerun", "Sword Coast", "Eberron", "Spelljammer", "Wildemount", "Other"];
const ART_STYLES = ["Classic D&D", "Realistic", "Water Color", "Anime", "Ink Drawing", "Pencil Sketch Line Art"];
const STAT_KEYS = ["str", "dex", "con", "int", "wis", "cha"];
const FEAT_LEVELS = [1, 4, 8, 12, 16, 19];

const CLASS_DATA = {
  "Artificer": { saves: ["con", "int"], skillCount: 2, skills: ["Arcana", "History", "Investigation", "Medicine", "Nature", "Perception", "Sleight of Hand"] },
  "Barbarian": { saves: ["str", "con"], skillCount: 2, skills: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"] },
  "Bard": { saves: ["dex", "cha"], skillCount: 3, skills: ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"] },
  "Cleric": { saves: ["wis", "cha"], skillCount: 2, skills: ["History", "Insight", "Medicine", "Persuasion", "Religion"] },
  "Druid": { saves: ["int", "wis"], skillCount: 2, skills: ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"] },
  "Fighter": { saves: ["str", "con"], skillCount: 2, skills: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"] },
  "Monk": { saves: ["str", "dex"], skillCount: 2, skills: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"] },
  "Paladin": { saves: ["wis", "cha"], skillCount: 2, skills: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"] },
  "Ranger": { saves: ["str", "dex"], skillCount: 3, skills: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"] },
  "Rogue": { saves: ["dex", "int"], skillCount: 4, skills: ["Acrobatics", "Animal Handling", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"] },
  "Sorcerer": { saves: ["con", "cha"], skillCount: 2, skills: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"] },
  "Warlock": { saves: ["wis", "cha"], skillCount: 2, skills: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"] },
  "Wizard": { saves: ["int", "wis"], skillCount: 2, skills: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"] }
};

const BACKGROUND_CATEGORIES = {
  "PHB": ["Acolyte", "Criminal", "Sage", "Soldier", "Wayfarer", "Hermit", "Noble", "Outlander"],
  "SCA": ["City Watch", "Clan Crafter", "Cloistered Scholar", "Courtier", "Far Traveler", "Inheritor", "Knight of the Order", "Mercenary Veteran", "Urban Bounty Hunter", "Uthgardt Tribe Member", "Waterdhavian Noble"],
  "FAE": ["Chondathan Freebooter", "Dead Magic Dweller", "Dragon Cult cultist", "Emerald Enclave Caretaker", "Flaming Fist Mercenary", "Genie Touched", "Harper", "Ice Fisher", "Knight of the Gauntlet", "Lords' Alliance Vassal", "Moonwell Pilgrim", "Mulhorandi Tomb Raider", "Mythalkeeper", "Purple Dragon Squire", "Rashemi Wanderer", "Shadowmasters Exile", "Spellfire Initiate", "Zhentarim Mercenary"],
  "EBR": ["House Cannith", "House Deneith", "House Ghallanda", "House Jorasco", "House Kundarak", "House Lyrandar", "House Medani", "House Orien", "House Phiarlan", "House Sivis", "House Tharashk", "House Thuranni", "House Vadalis"],
  "WLM": ["Luxonborn", "Myriad Operative", "Cobalt Scholar", "Revelry Pirate", "Augen Trust", "Volstrucker Agent"]
};

const BACKGROUND_DATA = {
  "Acolyte": { skills: ["Insight", "Religion"] }, "Criminal": { skills: ["Deception", "Stealth"] },
  "Sage": { skills: ["Arcana", "History"] }, "Soldier": { skills: ["Athletics", "Intimidation"] },
  "Wayfarer": { skills: ["Insight", "Stealth"] }, "Hermit": { skills: ["Medicine", "Religion"] },
  "Noble": { skills: ["History", "Persuasion"] }, "Outlander": { skills: ["Athletics", "Survival"] },
  "City Watch": { skills: ["Athletics", "Insight"] }, "Clan Crafter": { skills: ["History", "Insight"] },
  "Cloistered Scholar": { skills: ["History", "Arcana"] }, "Courtier": { skills: ["Insight", "Persuasion"] },
  "Far Traveler": { skills: ["Insight", "Perception"] }, "Inheritor": { skills: ["Survival", "Arcana"] },
  "Knight of the Order": { skills: ["Persuasion", "Religion"] }, "Mercenary Veteran": { skills: ["Athletics", "Persuasion"] },
  "Urban Bounty Hunter": { skills: ["Stealth", "Deception"] }, "Uthgardt Tribe Member": { skills: ["Athletics", "Survival"] },
  "Waterdhavian Noble": { skills: ["History", "Persuasion"] },
  "Chondathan Freebooter": { skills: ["Athletics", "Sleight of Hand"] }, "Dead Magic Dweller": { skills: ["Medicine", "Survival"] },
  "Dragon Cult cultist": { skills: ["Deception", "Stealth"] }, "Emerald Enclave Caretaker": { skills: ["Nature", "Survival"] },
  "Flaming Fist Mercenary": { skills: ["Intimidation", "Perception"] }, "Genie Touched": { skills: ["Perception", "Persuasion"] },
  "Harper": { skills: ["Performance", "Sleight of Hand"] }, "Ice Fisher": { skills: ["Animal Handling", "Athletics"] },
  "Knight of the Gauntlet": { skills: ["Athletics", "Medicine"] }, "Lords' Alliance Vassal": { skills: ["Insight", "Persuasion"] },
  "Moonwell Pilgrim": { skills: ["Nature", "Performance"] }, "Mulhorandi Tomb Raider": { skills: ["Investigation", "Religion"] },
  "Mythalkeeper": { skills: ["Arcana", "History"] }, "Purple Dragon Squire": { skills: ["Animal Handling", "Insight"] },
  "Rashemi Wanderer": { skills: ["Intimidation", "Perception"] }, "Shadowmasters Exile": { skills: ["Acrobatics", "Stealth"] },
  "Spellfire Initiate": { skills: ["Arcana", "Perception"] }, "Zhentarim Mercenary": { skills: ["Intimidation", "Perception"] },
  "House Cannith": { skills: ["Arcana", "Investigation"] }, "House Deneith": { skills: ["Athletics", "Perception"] },
  "House Ghallanda": { skills: ["Insight", "Persuasion"] }, "House Jorasco": { skills: ["Insight", "Medicine"] },
  "House Kundarak": { skills: ["History", "Investigation"] }, "House Lyrandar": { skills: ["Perception", "Persuasion"] },
  "House Medani": { skills: ["Insight", "Investigation"] }, "House Orien": { skills: ["Insight", "Persuasion"] },
  "House Phiarlan": { skills: ["Performance", "Stealth"] }, "House Sivis": { skills: ["History", "Investigation"] },
  "House Tharashk": { skills: ["Insight", "Survival"] }, "House Thuranni": { skills: ["Performance", "Stealth"] },
  "House Vadalis": { skills: ["Animal Handling", "Insight"] },
  "Luxonborn": { skills: ["Insight", "Religion"] }, "Myriad Operative": { skills: ["Deception", "Stealth"] },
  "Cobalt Scholar": { skills: ["Arcana", "History"] }, "Revelry Pirate": { skills: ["Athletics", "Perception"] },
  "Augen Trust": { skills: ["Athletics", "Intimidation"] }, "Volstrucker Agent": { skills: ["Arcana", "Stealth"] }
};

const STARTING_LOOT = {
  1: { gp: 0, magic: "Standard Starting Equipment" },
  2: { gp: 150, magic: "Standard Starting Equipment" },
  3: { gp: 400, magic: "Standard Starting Equipment" },
  4: { gp: 1200, magic: "Starting Equipment (Savings for Level 5 Gear)" },
  5: { gp: 650, magic: "1 Common, 1 Uncommon Magic Item + Starting Equipment" },
  6: { gp: 1500, magic: "1 Common, 1 Uncommon Magic Item" },
  7: { gp: 2800, magic: "1 Common, 1 Uncommon Magic Item" },
  8: { gp: 4500, magic: "1 Common, 2 Uncommon Magic Items" },
  9: { gp: 7500, magic: "Peak Savings for Level 10 milestones" },
  10: { gp: 4950, magic: "2 Common, 3 Uncommon Magic Items + Starting Equipment" },
  11: { gp: 7000, magic: "2 Common, 3 Uncommon Magic Items" },
  12: { gp: 10000, magic: "2 Common, 3 Uncommon Magic Items" },
  13: { gp: 15000, magic: "2 Common, 3 Uncommon, 1 Rare Magic Item" },
  14: { gp: 25000, magic: "Peak Savings for Level 15 milestones" },
  15: { gp: 15500, magic: "2 Common, 4 Uncommon, 2 Rare Magic Items + Starting Equipment" },
  16: { gp: 22000, magic: "2 Common, 4 Uncommon, 2 Rare Magic Items" },
  17: { gp: 30000, magic: "2 Common, 4 Uncommon, 2 Rare, 1 Very Rare Magic Item" },
  18: { gp: 42000, magic: "2 Common, 4 Uncommon, 3 Rare, 1 Very Rare Magic Item" },
  19: { gp: 60000, magic: "Peak Savings for Level 20 milestones" },
  20: { gp: 32500, magic: "2 Common, 4 Uncommon, 3 Rare, 2 Very Rare, 1 Legendary Item + Starting Equipment" }
};

const ABILITY_SKILLS = {
  str: ["Athletics"], dex: ["Acrobatics", "Sleight of Hand", "Stealth"], con: [],
  int: ["Arcana", "History", "Investigation", "Nature", "Religion"],
  wis: ["Animal Handling", "Insight", "Medicine", "Perception", "Survival"],
  cha: ["Deception", "Intimidation", "Performance", "Persuasion"]
};

const ALL_SKILLS = Object.entries(ABILITY_SKILLS).flatMap(([ability, skills]) => skills.map(name => ({ name, ability })));

// --- Helper Functions ---
const getModifier = (score) => Math.floor((parseInt(score || 10) - 10) / 2);
const formatBonus = (val) => (val === undefined || isNaN(val)) ? "-" : `${val >= 0 ? '+' : ''}${val}`;
const getProficiencyBonus = (level) => {
  const lvl = parseInt(level) || 1;
  if (lvl >= 17) return 6;
  if (lvl >= 13) return 5;
  if (lvl >= 9) return 4;
  if (lvl >= 5) return 3;
  return 2;
};

// --- API Logic ---
async function callGemini(payload, systemInstruction, structured = false) {
  const maxRetries = 5;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const body = {
        contents: [{ parts: [{ text: payload }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      };
      if (structured) body.generationConfig = { responseMimeType: "application/json" };
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${textModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error('Gemini API Error');
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err) {
      if (i === maxRetries) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}

async function generateCharacterImage(promptText) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:predict?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: { prompt: promptText },
      parameters: { sampleCount: 1 }
    })
  });
  const result = await response.json();
  if (result.predictions && result.predictions[0]) {
    return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
  }
  throw new Error("Imagen failure");
}

const compressImage = async (base64Str, maxWidth = 512, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width, height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64Str);
  });
};

// --- UI Framework Components ---
const ScreenWrapper = ({ children, title, subtitle }) => (
  <div className="max-w-2xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-zinc-100">
    <div className="text-center mb-10">
      <h2 className="text-4xl font-black text-orange-500 uppercase tracking-tighter italic">{title}</h2>
      {subtitle && <p className="text-zinc-500 font-serif italic">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [character, setCharacter] = useState(null);
  const [imageChoices, setImageChoices] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [savedCharacters, setSavedCharacters] = useState([]);
  const [view, setView] = useState('welcome');
  const [slagLevel, setSlagLevel] = useState("Random");
  const [isEditingName, setIsEditingName] = useState(false);
  const recordRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    level: 1, setting: "Faerun", species: "", className: "Fighter", background: "Soldier",
    name: "", gender: "", statRules: "4d6 drop the lowest", manualStats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    hpRules: "Roll for HP", skillProficiencies: [], keyFeatures: "", artStyle: "Classic D&D", artTweaks: ""
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(fAuth, __initial_auth_token);
        } else {
          await signInAnonymously(fAuth);
        }
      } catch (err) { console.error("Firebase Auth Error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(fAuth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = collection(fDb, 'artifacts', appId, 'users', user.uid, 'characters');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSavedCharacters(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (err) => console.error("Firestore error:", err));
    return () => unsubscribe();
  }, [user]);

  // --- Scoped Logic Helpers ---
  const updateFormVal = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const updateManualStat = (stat, val) => setFormData(p => ({ ...p, manualStats: { ...p.manualStats, [stat]: parseInt(val) || 10 } }));
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  const resetForge = () => {
    setCharacter(null); setSelectedImage(null); setImageChoices([]); setStep(1); setView('generator');
    setFormData({
      level: 1, setting: "Faerun", species: "", className: "Fighter", background: "Soldier",
      name: "", gender: "", statRules: "4d6 drop the lowest", manualStats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      hpRules: "Roll for HP", skillProficiencies: [], keyFeatures: "", artStyle: "Classic D&D", artTweaks: ""
    });
  };

  const exportPDF = () => {
    if (!recordRef.current) return;
    const opt = {
      margin: 0, 
      filename: `${character.coreIdentity.name}_Record.pdf`, 
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    // @ts-ignore
    window.html2pdf().set(opt).from(recordRef.current).save();
  };

  const syncIdentityInText = (newName, oldName) => {
    if (!character || !oldName || oldName.trim() === "" || newName.trim() === "" || oldName === newName) {
      return { name: newName, story: character?.backgroundStory || "", desc: character?.description || "" };
    }
    const escapedOldName = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedOldName, 'g');
    return {
      name: newName,
      story: character.backgroundStory.replace(regex, newName),
      desc: character.description.replace(regex, newName)
    };
  };

  const handleNameChange = (newName) => {
    const oldName = character?.coreIdentity?.name || "";
    const { name, story, desc } = syncIdentityInText(newName, oldName);
    setCharacter({
      ...character,
      coreIdentity: { ...character.coreIdentity, name: name },
      backgroundStory: story,
      description: desc
    });
  };

  const generateCharacterData = async (overrideData = null) => {
    setLoading(true); setError(null);
    const activeData = overrideData || formData;
    const loot = STARTING_LOOT[activeData.level] || STARTING_LOOT[1];
    
    try {
      const sysPrompt = `You are a D&D 2024 revision expert. Generate character JSON. 
      STRICT IDENTITY MANDATE:
      - If a name is explicitly provided (NAME: ${activeData.name}) or mentioned in description, you MUST use that name. Do NOT generate a new one.
      - Sources MUST follow format: [Abbrev XX] using standard book abbreviations (PHB, DMG, MM, TCE, XGE). 
      - Character Level: ${activeData.level}. 
      - Gains feat for levels 1, 4, 8, 12, 16, and 19 reached. 
      - ACTION ANALYSIS: List Bonus Actions and Reactions from build in "bonusActions" and "reactions".
      - SPELLS: If a caster, populate "spellsByLevel". EVERY spell object MUST have a descriptive "summary" string and a "source" string.
      - ITEMS: Equipment and attunedItems MUST be objects: { "name": "...", "summary": "...", "source": "Abbrev XX" }.
      JSON structure: { 
        "coreIdentity": { "name": "...", "species": "...", "className": "...", "level": ${activeData.level}, "background": "...", "alignment": "...", "gender": "..." }, 
        "abilityScores": { "str": 10, "dex": 10, "con": 10, "int": 10, "wis": 10, "cha": 10 }, 
        "vitals": { "hp": 10, "ac": 15, "speed": "30ft", "initiative": 2, "bonusActions": ["Shield Bash"], "reactions": ["Shield"] }, 
        "skillProficiencies": ["Athletics"], 
        "savingThrowProficiencies": ["str", "con"], 
        "mainAttacks": [ { "name": "...", "bonus": 5, "damage": "...", "type": "..." } ], 
        "classFeatures": [ { "name": "...", "summary": "...", "source": "PHB 123" } ], 
        "subclassFeatures": [], "speciesFeatures": [], "feats": [],
        "equipment": [ { "name": "Armor", "summary": "AC modifier...", "source": "PHB 123" } ], "attunedItems": [],
        "currency": { "gp": ${loot.gp} }, 
        "spellcasting": { "isCaster": true, "spellAttack": 5, "spellDC": 13, "slots": { "1": 4 }, "spellsByLevel": { "0": [], "1": [] } }, 
        "description": "...", "backgroundStory": "..." 
      }`;
      const queryText = `Create Lvl ${activeData.level} ${activeData.species} ${activeData.className}. Setting: ${activeData.setting}. ${activeData.name ? `STRICT NAME: ${activeData.name}.` : ''} Background: ${activeData.background}. User Details: ${activeData.keyFeatures}`;
      const res = await callGemini(queryText, sysPrompt, true);
      const parsed = JSON.parse(res.replace(/```json|```/g, '').trim());
      setCharacter(parsed); setStep(8);
    } catch (err) { setError(`Forge failure: ${err.message}`); }
    finally { setLoading(false); }
  };

  const reRollName = async () => {
    if (!character) return;
    setLoading(true);
    try {
      const prompt = `Generate one thematic D&D name for a Lvl ${character.coreIdentity.level} ${character.coreIdentity.species} ${character.coreIdentity.className} in ${formData.setting}. 
      CRITICAL: Generate variety, from standard First/Last name pairings to unique monikers. 
      NICKNAME RULE: 50% weighted chance you MUST integrate a descriptive nickname in quotes, e.g. Elara "Silver-Tongue" Vance. 
      Return ONLY the final name string.`;
      const newName = await callGemini(prompt, "Name Generator.");
      handleNameChange(newName.trim());
    } catch (err) { console.error("Name re-roll failed", err); }
    finally { setLoading(false); }
  };

  const generateArt = async () => {
    if (!character) return;
    setLoading(true); setError(null);
    try {
      const visualDossier = `
        STRICT PHYSICAL PROFILE DOSSIER FOR PORTRAIT:
        - Name: ${character.coreIdentity.name}
        - Species: ${character.coreIdentity.species}
        - Gender: ${character.coreIdentity.gender || "unspecified"}
        - Role: ${character.coreIdentity.className}
        - Setting: ${formData.setting}
        - Origin: ${character.coreIdentity.background}
        - Visual Traits: ${character.description}
        ${formData.artTweaks ? `- USER FEEDBACK/TWEAKS: ${formData.artTweaks}` : ''}
      `;
      const pSys = `D&D Concept artist. Create 3 detailed cinematic AI portrait prompts as a JSON array strings based on character dossier. Style: ${formData.artStyle}. Dossier: ${visualDossier}`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${textModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: visualDossier }] }],
          systemInstruction: { parts: [{ text: pSys }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      const prompts = JSON.parse(data.candidates[0].content.parts[0].text);
      const imgs = await Promise.all(prompts.slice(0, 3).map(p => generateCharacterImage(`${formData.artStyle} style, ${p}`)));
      setImageChoices(imgs); setStep(9);
    } catch (err) { setError(`Vision failed: ${err.message}`); }
    finally { setLoading(false); }
  };

  const handleCheckTheSlag = () => {
    setCharacter(null); setSelectedImage(null); setImageChoices([]); setIsEditingName(false);
    const finalLevel = slagLevel === "Random" ? Math.floor(Math.random() * 20) + 1 : parseInt(slagLevel);
    const races = ["Human", "Elf", "Dwarf", "Tiefling", "Orc", "Gnome", "Warforged", "Tabaxi", "Changeling", "Shifter", "Dragonborn", "Goliath", "Firbolg"];
    const classes = Object.keys(CLASS_DATA);
    const slagData = { 
      ...formData, level: finalLevel, name: "", species: races[Math.floor(Math.random() * races.length)], 
      className: classes[Math.floor(Math.random() * classes.length)], background: "Soldier", 
      setting: SETTINGS[0], keyFeatures: "Surprise me with unconventional traits.", skillProficiencies: []
    };
    setFormData(slagData); setView('generator'); generateCharacterData(slagData);
  };

  const saveToLibrary = async () => {
    if (!user || !character) return;
    setLoading(true);
    try {
      const col = collection(fDb, 'artifacts', appId, 'users', user.uid, 'characters');
      let portrait = selectedImage || null;
      if (portrait && portrait.length > 500000) portrait = await compressImage(portrait);
      await addDoc(col, { ...character, portrait, createdAt: new Date().toISOString() });
      setView('library');
    } catch (err) { setError("Archive failed."); }
    finally { setLoading(false); }
  };

  const deleteChar = async (id) => {
    if (!user) return;
    try { await deleteDoc(doc(fDb, 'artifacts', appId, 'users', user.uid, 'characters', id)); } 
    catch (err) { console.error("Delete failed:", err); }
  };

  const toggleSkillChoice = (skillName) => {
    const limit = CLASS_DATA[formData.className]?.skillCount || 2;
    setFormData(prev => {
      const isProf = prev.skillProficiencies.includes(skillName);
      if (isProf) return { ...prev, skillProficiencies: prev.skillProficiencies.filter(s => s !== skillName) };
      if (prev.skillProficiencies.length < limit) return { ...prev, skillProficiencies: [...prev.skillProficiencies, skillName] };
      return prev;
    });
  };

  const dlImg = (b64, fn) => { const l = document.createElement('a'); l.href = b64; l.download = fn; l.click(); };

  // Navigation icons
  const HomeIcon = Flame;
  const ForgeIcon = Dices;
  const LibraryIcon = History;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30">
      <header className="py-8 text-center no-print">
        <div className="inline-block px-12 py-4 border-4 border-zinc-900 bg-zinc-900 shadow-2xl rounded-sm">
           <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic text-orange-500 drop-shadow-[0_0_15px_rgba(255,165,0,0.5)]">SlagHeap</h1>
           <p className="text-xs font-bold tracking-[0.3em] uppercase mt-2 text-zinc-500">Salvaging legends from the foundry floor</p>
        </div>
      </header>

      <nav className="flex justify-center gap-4 mb-12 no-print text-white">
        <button onClick={() => setView('welcome')} className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all border-2 ${view === 'welcome' ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}><HomeIcon size={16} /> Home</button>
        <button onClick={() => setView('generator')} className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all border-2 ${view === 'generator' ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}><ForgeIcon size={16} /> Forge</button>
        <button onClick={() => setView('library')} className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all border-2 ${view === 'library' ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}><LibraryIcon size={16} /> Library</button>
      </nav>

      <main className="container mx-auto pb-24 px-4 text-zinc-100">
        {error && <div className="max-w-md mx-auto mb-8 p-4 bg-red-900/20 border border-red-900 rounded-xl text-red-400 flex items-center gap-3"><AlertCircle size={20} /> {error}</div>}
        
        {loading && view !== 'welcome' ? (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
            <Loader2 size={64} className="text-orange-500 animate-spin mb-4" />
            <h3 className="text-2xl font-black uppercase tracking-widest animate-pulse">Forging Hero</h3>
          </div>
        ) : (
          <>
            {view === 'welcome' && (
              <div className="max-w-2xl mx-auto space-y-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                <div className="mb-10 text-white"><h2 className="text-4xl font-black uppercase tracking-tighter italic">the foundry is hot</h2><p className="text-zinc-500 font-serif italic">Ready the iron.</p></div>
                <button onClick={resetForge} className="w-full group relative overflow-hidden p-8 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border-2 border-zinc-700 hover:border-blue-500 rounded-3xl transition-all shadow-2xl flex flex-col items-center justify-center text-white">
                  <div className="flex items-center gap-4 mb-2"><ForgeIcon size={48} className="text-zinc-400 group-hover:text-blue-400" /><h3 className="text-4xl font-black uppercase tracking-tight">Fresh Ore</h3></div>
                  <p className="text-sm text-zinc-500 italic">Start a character from scratch.</p>
                </button>
                <div className="relative group overflow-hidden bg-gradient-to-br from-orange-600 via-orange-700 to-red-900 border-2 border-orange-500 rounded-3xl transition-all shadow-2xl flex flex-col text-white">
                   <div className="flex items-stretch text-white">
                      <button onClick={handleCheckTheSlag} className="flex-1 p-8 flex flex-col items-center justify-center gap-1 hover:bg-black/10 transition-all border-r border-white/10 text-center">
                        <div className="flex items-center gap-4 mb-2">
                           <Zap size={48} fill="currentColor" />
                           <h3 className="text-4xl font-black uppercase tracking-tight">Check the Slag</h3>
                        </div>
                        <p className="text-sm text-orange-100 italic">Roll for a random character.</p>
                      </button>
                      <div className="w-24 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 cursor-pointer">
                        <label className="text-[9px] font-black text-orange-200 uppercase tracking-widest mb-1 opacity-60 text-white">Level</label>
                        <select value={slagLevel} onChange={(e) => setSlagLevel(e.target.value)} className="bg-transparent text-white font-black text-xl outline-none cursor-pointer appearance-none px-2 text-center">
                          <option value="Random" className="bg-zinc-900 text-sm text-white">Random</option>
                          {Array.from({ length: 20 }).map((_, i) => (<option key={i+1} value={i+1} className="bg-zinc-900 text-white">Lvl {i+1}</option>))}
                        </select>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {view === 'library' && (
              <ScreenWrapper title="Archives">
                <div className="flex gap-4 mb-8 justify-center">
                   <button onClick={() => { const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedCharacters)); const dlAnchor = document.createElement('a'); dlAnchor.setAttribute("href", dataStr); dlAnchor.setAttribute("download", `Archive_Export.json`); dlAnchor.click(); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-orange-500 transition-all text-zinc-400 hover:text-white"><Download size={16} /> Export JSON</button>
                   <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-orange-500 transition-all text-zinc-400 hover:text-white"><Upload size={16} /> Import JSON</button>
                   <input type="file" ref={fileInputRef} onChange={(e) => { const file = e.target.files[0]; if (!file || !user) return; const reader = new FileReader(); reader.onload = async (event) => { try { const imported = JSON.parse(event.target.result); if (!Array.isArray(imported)) return; setLoading(true); const col = collection(fDb, 'artifacts', appId, 'users', user.uid, 'characters'); for (const char of imported) { const { id, ...clean } = char; await addDoc(col, clean); } setLoading(false); } catch (err) { setError("Import failed."); setLoading(false); } }; reader.readAsText(file); }} accept=".json" className="hidden" />
                </div>
                <div className="grid gap-4">{savedCharacters.map(char => (<div key={char.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex items-center justify-between hover:border-orange-500/50 transition-all group text-white"><div className="flex items-center gap-6">{char.portrait ? <img src={char.portrait} className="w-16 h-16 rounded-xl object-cover border border-zinc-800" alt="hero" /> : <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center text-xs text-zinc-600">N/A</div>}<div><h3 className="text-xl font-black uppercase text-zinc-100">{char.coreIdentity.name}</h3><p className="text-orange-500 text-sm">Lvl {char.coreIdentity.level} {char.coreIdentity.species} {char.coreIdentity.className}</p></div></div><div className="flex gap-2 text-white"><button onClick={() => { setCharacter(char); setSelectedImage(char.portrait); setStep(10); setView('generator'); }} className="p-2 bg-zinc-800 hover:bg-orange-600 rounded-lg transition-colors"><ChevronRight size={18} /></button><button onClick={() => deleteChar(char.id)} className="p-2 bg-zinc-800 hover:bg-red-600 rounded-lg transition-colors text-white"><Trash2 size={18} /></button></div></div>))}</div>
              </ScreenWrapper>
            )}

            {view === 'generator' && (
              <div className="max-w-4xl mx-auto px-4 text-white">
                {step === 1 && (
                  <ScreenWrapper title="Power" subtitle="Select Level">
                    <div className="relative w-full mb-12 mt-8 px-2 text-white">
                       <div className="absolute top-[-1.5rem] left-0 w-full flex justify-between px-1 pointer-events-none">
                          {Array.from({ length: 20 }).map((_, i) => { const lvl = i + 1; const isMarker = [5, 10, 15].includes(lvl); return ( <div key={lvl} className="flex flex-col items-center">{isMarker ? (<span className="text-[10px] font-black text-orange-500 mb-1">{lvl}</span>) : (<div className="h-4 w-px bg-transparent" />)}<div className={`h-2 w-px ${isMarker ? 'bg-orange-500/50 h-3' : 'bg-zinc-800'}`} /></div> ); })}
                       </div>
                       <input type="range" min="1" max="20" value={formData.level} onChange={e => updateFormVal('level', e.target.value)} className="w-full accent-orange-500 h-2 bg-zinc-800 rounded-lg relative z-10" />
                    </div>
                    <div className="text-center text-8xl font-black mb-8 italic drop-shadow-2xl">Lvl {formData.level}</div>
                    <button onClick={nextStep} className="w-full bg-orange-600 py-4 rounded-2xl font-black uppercase text-xl hover:bg-orange-700 flex items-center justify-center gap-2 transition-all text-white">Continue <ChevronRight /></button>
                  </ScreenWrapper>
                )}
                {step === 2 && (<ScreenWrapper title="World" subtitle="Select Setting"><div className="grid grid-cols-2 grid-rows-3 gap-6 max-md:grid-cols-1 max-w-md mx-auto text-white">{SETTINGS.map(s => (<button key={s} onClick={() => { updateFormVal('setting', s); nextStep(); }} className="aspect-square flex items-center justify-center p-8 rounded-3xl border-4 font-black uppercase border-zinc-800 hover:border-orange-500 hover:bg-orange-500/5 transition-all text-xl tracking-tighter text-center">{s}</button>))}</div></ScreenWrapper>)}
                {step === 3 && (
                  <ScreenWrapper title="Identity" subtitle="Define the Being">
                    <div className="space-y-4">
                      <input placeholder="Name" value={formData.name} onChange={e => updateFormVal('name', e.target.value)} className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 rounded-xl focus:border-orange-500 outline-none text-white text-white" />
                      <input placeholder="Species" value={formData.species} onChange={e => updateFormVal('species', e.target.value)} className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 rounded-xl focus:border-orange-500 outline-none text-white text-white" />
                      <select value={formData.className} onChange={e => updateFormVal('className', e.target.value)} className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 rounded-xl focus:border-orange-500 text-white">
                        {Object.keys(CLASS_DATA).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={formData.background} onChange={e => updateFormVal('background', e.target.value)} className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 rounded-xl focus:border-orange-500 text-white text-white">
                        {Object.entries(BACKGROUND_CATEGORIES).map(([cat, list]) => (<optgroup key={cat} label={`${cat} Backgrounds`}>{list.map(b => <option key={b} value={b}>{b}</option>)}</optgroup>))}
                      </select>
                      <div className="flex gap-4 pt-4 text-white"><button onClick={prevStep} className="flex-1 bg-zinc-800 py-4 rounded-xl font-bold uppercase hover:bg-zinc-700 transition-colors">Back</button><button onClick={nextStep} className="flex-1 bg-orange-600 py-4 rounded-xl font-black uppercase hover:bg-orange-700 transition-all text-white">Continue</button></div>
                    </div>
                  </ScreenWrapper>
                )}
                {step === 4 && (
                  <ScreenWrapper title="Abilities" subtitle="Methodology">
                    <div className="space-y-6 text-white text-white">
                      <div className="grid grid-cols-2 gap-4 text-white">
                        {["4d6 drop the lowest", "3d6", "Point Buy", "Manual"].map(m => (
                          <button key={m} onClick={() => updateFormVal('statRules', m)} className={`p-4 rounded-xl border-2 font-bold uppercase transition-all ${formData.statRules === m ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-zinc-800 hover:border-zinc-700'}`}>{m}</button>
                        ))}
                      </div>
                      {(formData.statRules === "Point Buy" || formData.statRules === "Manual") && (
                        <div className="grid grid-cols-3 gap-4 bg-zinc-900 p-6 rounded-2xl border-2 border-zinc-800 text-white">
                          {STAT_KEYS.map(s => (<div key={s} className="space-y-1"><label className="text-[10px] font-black uppercase text-zinc-500 ml-1">{s}</label><input type="number" value={formData.manualStats[s]} onChange={e => updateManualStat(s, e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-center outline-none focus:border-orange-500 text-white" /></div>))}
                        </div>
                      )}
                      <div className="flex gap-4 text-white"><button onClick={prevStep} className="flex-1 bg-zinc-800 py-4 rounded-xl font-bold uppercase hover:bg-zinc-700 transition-colors">Back</button><button onClick={nextStep} className="flex-1 bg-orange-600 py-4 rounded-xl font-black uppercase hover:bg-orange-700 transition-all text-white">Continue</button></div>
                    </div>
                  </ScreenWrapper>
                )}
                {step === 5 && (<ScreenWrapper title="Resilience" subtitle="HP Strategy"><div className="space-y-6 text-white text-center text-white"><div className="grid grid-cols-2 gap-4">{["Roll for HP", "Take Average"].map(m => (<button key={m} onClick={() => updateFormVal('hpRules', m)} className={`p-6 rounded-2xl border-2 font-bold uppercase transition-all ${formData.hpRules === m ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}>{m}</button>))}</div><div className="flex gap-4"><button onClick={prevStep} className="flex-1 bg-zinc-800 py-4 rounded-xl font-bold transition-colors hover:bg-zinc-700 uppercase">Back</button><button onClick={nextStep} className="flex-1 bg-orange-600 py-4 rounded-xl font-black uppercase hover:bg-orange-700 transition-all text-white">Continue</button></div></div></ScreenWrapper>)}
                {step === 6 && (<ScreenWrapper title="Expertise" subtitle={`${formData.className} Skill Selection`}><div className="space-y-8 text-white"><div><h4 className="text-[10px] font-black uppercase text-zinc-500 mb-3 tracking-widest flex items-center gap-2 text-white">Saving Throws <Lock size={10} /></h4><div className="grid grid-cols-3 gap-3 text-white text-white">{STAT_KEYS.map(key => { const isAuto = CLASS_DATA[formData.className]?.saves?.includes(key); return ( <div key={key} className={`p-3 rounded-xl border-2 text-xs font-black uppercase flex items-center justify-between ${isAuto ? 'border-red-700 bg-red-900/10 text-white' : 'border-zinc-900 opacity-40 text-zinc-600'}`}>{key} {isAuto && <Check size={14} className="text-red-700" strokeWidth={3} />}</div> ); })}</div></div><div><div className="flex justify-between items-center mb-3 text-white text-white"><h4 className="text-[10px] font-black uppercase tracking-widest">Skill Proficiencies</h4><span className="text-[10px] font-bold text-orange-500 px-2 py-0.5 bg-orange-950/20 rounded border border-orange-900/50">Select {CLASS_DATA[formData.className]?.skillCount} from Class</span></div><div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-white">{ALL_SKILLS.map(s => { const isClassOption = CLASS_DATA[formData.className]?.skills?.includes(s.name); const isSelected = formData.skillProficiencies.includes(s.name); if (!isClassOption) return null; return (<button key={s.name} onClick={() => toggleSkillChoice(s.name)} className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all flex items-center justify-between ${isSelected ? 'border-orange-500 bg-orange-500/10 text-white shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}><span>{s.name}</span>{isSelected && <Check size={12} className="text-orange-500" />}</button>); })}</div></div><div className="flex gap-4 text-white text-white"><button onClick={prevStep} className="flex-1 bg-zinc-800 py-4 rounded-xl font-bold transition-colors hover:bg-zinc-700 uppercase">Back</button><button onClick={nextStep} className="flex-1 bg-orange-600 py-4 rounded-xl font-black uppercase hover:bg-orange-700 transition-all text-white">Continue</button></div></div></ScreenWrapper>)}
                {step === 7 && (<ScreenWrapper title="Traits" subtitle="Define the Soul"><textarea rows={6} value={formData.keyFeatures} onChange={e => updateFormVal('keyFeatures', e.target.value)} className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-orange-500 text-white resize-none text-white" placeholder="Key traits..." /><button onClick={() => generateCharacterData()} className="w-full bg-orange-600 py-4 rounded-xl font-black uppercase mt-4 hover:bg-orange-700 transition-all text-white">Forge Hero</button></ScreenWrapper>)}
                
                {step === 8 && character && (
                  <div className="text-center py-20 animate-in zoom-in-95 duration-700 text-white text-white">
                    <div className="flex items-center justify-center gap-4 mb-2 text-white">
                       <h1 className="text-7xl font-black uppercase tracking-tighter italic drop-shadow-2xl">{character.coreIdentity.name}</h1>
                       <button onClick={reRollName} className="p-2 bg-white/10 hover:bg-orange-500 rounded-full transition-colors group" title="Re-roll Name"><Sparkles size={24} className="text-zinc-400 group-hover:text-white" /></button>
                    </div>
                    <p className="text-2xl font-bold text-orange-500 uppercase tracking-widest mb-12">Lvl {character.coreIdentity.level} {character.coreIdentity.species} {character.coreIdentity.className}</p>
                    <div className="flex flex-col max-w-sm mx-auto gap-4 text-white"><button onClick={() => setStep(10)} className="p-6 bg-orange-600 rounded-3xl font-black text-2xl shadow-xl uppercase hover:bg-orange-700 transition-all">View Record</button><button onClick={() => { setStep(9); generateArt(); }} className="p-4 bg-zinc-800 rounded-2xl font-bold text-zinc-300 border border-zinc-700 uppercase hover:bg-zinc-700 transition-all text-white">Art Weaver</button></div>
                  </div>
                )}

                {/* STEP 9: Art Weaver FeedBack Studio */}
                {step === 9 && (
                   <ScreenWrapper title="Art Weaver" subtitle="Select Vision or Refine Casting">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-white">
                         {imageChoices.map((img, idx) => (
                            <div key={idx} className="relative group text-white text-white"><img src={img} className="w-full rounded-2xl border-2 border-zinc-800 hover:border-orange-500 cursor-pointer aspect-square object-cover" onClick={() => { setSelectedImage(img); setStep(10); }} alt="choice" /><button onClick={(e) => { e.stopPropagation(); dlImg(img, `hero_${idx}.png`); }} className="absolute bottom-2 right-2 p-2 bg-zinc-900/80 rounded-lg hover:bg-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"><ImageDown size={16} /></button></div>
                         ))}
                      </div>
                      <div className="bg-zinc-900 p-6 rounded-3xl border-2 border-zinc-800 space-y-4 text-white text-white">
                         <div className="flex gap-4">
                            <div className="flex-1">
                               <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block tracking-widest text-zinc-500">Feedback / Tweaks</label>
                               <textarea value={formData.artTweaks} onChange={e => updateFormVal('artTweaks', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm text-zinc-100 outline-none focus:border-orange-500 resize-none h-20" placeholder="e.g. Add glowing runes, change cloak to blue..." />
                            </div>
                            <div className="w-48">
                               <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block tracking-widest text-zinc-500">Art Style</label>
                               <select value={formData.artStyle} onChange={e => updateFormVal('artStyle', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm text-white focus:border-orange-500">
                                  {ART_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                               </select>
                            </div>
                         </div>
                         <div className="flex gap-4 pt-2 text-white">
                            <button onClick={() => setStep(10)} className="flex-1 bg-zinc-800 py-3 rounded-xl font-bold uppercase text-zinc-400 hover:bg-zinc-700 flex items-center justify-center gap-2 transition-all"><XCircle size={18}/> Reject</button>
                            <button onClick={generateArt} className="flex-1 bg-orange-600 py-3 rounded-xl font-black uppercase text-white hover:bg-orange-700 flex items-center justify-center gap-2 transition-all shadow-lg"><RotateCcw size={18}/> Redo</button>
                         </div>
                      </div>
                   </ScreenWrapper>
                )}

                {step === 10 && character && (
                  <div className="py-10 animate-in fade-in duration-1000 text-zinc-900 text-zinc-900">
                    <div className="flex flex-wrap justify-center gap-4 mb-12 no-print text-white text-white">
                      <button onClick={exportPDF} className="bg-orange-600 px-8 py-3 rounded-full font-black uppercase flex items-center gap-2 shadow-lg hover:bg-orange-700 transition-all text-white"><FileText size={18} /> Export PDF</button>
                      <button onClick={() => setStep(9)} className="bg-orange-950/50 text-orange-400 px-8 py-3 rounded-full font-black uppercase flex items-center gap-2 shadow-lg border border-orange-900/50 hover:bg-orange-900/40 transition-all text-orange-400 text-orange-400"><Sparkles size={18} /> Art Weaver</button>
                      <button onClick={saveToLibrary} className="bg-zinc-100 text-zinc-950 px-8 py-3 rounded-full font-black uppercase flex items-center gap-2 shadow-lg hover:bg-zinc-200 transition-all text-zinc-950 text-zinc-950 text-zinc-950"><Save size={18} /> Archive Hero</button>
                      <button onClick={resetForge} className="bg-zinc-900 text-zinc-400 px-8 py-3 rounded-full font-black border border-zinc-800 hover:text-white transition-all text-zinc-400 text-zinc-400">Reset Forge</button>
                    </div>
                    <div ref={recordRef} className="bg-stone-50 text-zinc-900 shadow-2xl rounded-sm font-serif printable-record border border-stone-200 box-border overflow-hidden max-w-5xl mx-auto">
                      
                      {/* PAGE 1: CORE IDENTITY */}
                      <div className="page-section p-8 relative flex flex-col text-zinc-900 text-zinc-900">
                        <div className="flex flex-col md:flex-row gap-6 border-b-4 border-zinc-900 pb-4 mb-4 text-zinc-900 text-zinc-900">
                          {selectedImage ? <img src={selectedImage} className="w-48 h-48 object-cover border-4 border-zinc-900 shadow-lg grayscale" alt="portrait" /> : <div className="w-48 h-48 bg-stone-200 border-4 border-dashed border-stone-400 flex items-center justify-center text-stone-400 uppercase font-black px-4 text-sm text-center">No Portrait</div>}
                          <div className="flex-1 space-y-2 overflow-hidden text-zinc-900 text-zinc-900">
                            <div className="flex items-center gap-3 w-full h-16 relative text-zinc-900 text-zinc-900">
                              {isEditingName ? (
                                <input autoFocus value={character.coreIdentity.name} onChange={(e) => handleNameChange(e.target.value)} onBlur={() => setIsEditingName(false)} className="text-4xl font-black uppercase tracking-tighter text-zinc-950 leading-tight w-full bg-stone-200 p-1 border-2 border-orange-500 outline-none text-zinc-950 text-zinc-950" />
                              ) : (
                                <div onClick={() => setIsEditingName(true)} className="flex-1 h-full cursor-pointer hover:bg-stone-200 transition-colors px-1 flex items-center overflow-hidden">
                                  <svg viewBox="0 0 400 60" preserveAspectRatio="xMinYMid meet" className="w-full h-full pointer-events-none text-zinc-950">
                                    <text x="0" y="45" className={`uppercase font-black tracking-tighter ${!character.coreIdentity.name?.trim() ? 'fill-stone-300 italic font-medium' : 'fill-zinc-950'}`} style={{ fontSize: '48px' }} textLength={character.coreIdentity.name?.length > 15 ? "100%" : undefined} lengthAdjust="spacingAndGlyphs">{character.coreIdentity.name?.trim() || "Type name, or click the button to roll one"}</text>
                                  </svg>
                                </div>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); reRollName(); }} className="p-2 bg-stone-200 hover:bg-orange-500 hover:text-white rounded-lg transition-all text-stone-400 shadow-sm" title="Re-roll Name"><Dices size={18} /></button>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase text-orange-800 text-orange-800 text-orange-800">
                              <span className="bg-stone-200 px-2 py-0.5 border border-stone-300 text-orange-800">Lvl {character.coreIdentity.level}</span>
                              <span className="bg-stone-200 px-2 py-0.5 border border-stone-300 text-orange-800">{character.coreIdentity.species}</span>
                              <span className="bg-stone-200 px-2 py-0.5 border border-stone-300 text-orange-800">{character.coreIdentity.className}</span>
                              <span className="bg-stone-200 px-2 py-0.5 border border-stone-300 text-orange-800">{character.coreIdentity.background}</span>
                              <span className="bg-stone-200 px-2 py-0.5 border border-stone-300 text-orange-800">{character.coreIdentity.alignment}</span>
                            </div>
                            <div className="grid grid-cols-5 gap-2 bg-white border-2 border-zinc-900 p-2 shadow-sm mt-4 text-center text-zinc-900 text-zinc-900">
                              <div className="border-r border-stone-200 text-zinc-950 text-zinc-950 text-zinc-950"><span className="block text-[6px] font-black uppercase text-stone-400">AC</span><span className="text-xl font-black">{character.vitals.ac}</span></div>
                              <div className="border-r border-stone-200 text-zinc-950 text-zinc-950 text-zinc-950"><span className="block text-[6px] font-black uppercase text-stone-400">HP</span><span className="text-xl font-black">{character.vitals.hp}</span></div>
                              <div className="border-r border-stone-200 text-zinc-950 text-zinc-950 text-zinc-950"><span className="block text-[6px] font-black uppercase text-stone-400">Current</span><div className="text-xs text-stone-300 mt-1">_____</div></div>
                              <div className="border-r border-stone-200 text-zinc-950 text-zinc-950 text-zinc-950"><span className="block text-[6px] font-black uppercase text-stone-400">Init</span><span className="text-xl font-black">{formatBonus(character.vitals.initiative)}</span></div>
                              <div className="text-zinc-950"><span className="block text-[6px] font-black uppercase text-stone-400">Prof</span><span className="text-xl font-black text-orange-800">+{getProficiencyBonus(character.coreIdentity.level)}</span></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6 flex-1 text-zinc-900">
                          <div className="w-full md:w-48 shrink-0 space-y-1.5 text-zinc-950 text-zinc-950">
                            {STAT_KEYS.map(key => {
                              const val = character.abilityScores[key];
                              const mod = getModifier(val);
                              const characterLevel = parseInt(character.coreIdentity.level) || 1;
                              const isSaveProf = (character.savingThrowProficiencies || []).map(s => s.toLowerCase()).includes(key.toLowerCase());
                              const saveValue = mod + (isSaveProf ? getProficiencyBonus(characterLevel) : 0);
                              return (
                                <div key={key} className="border-2 border-zinc-900 p-1.5 bg-white shadow-sm relative flex flex-col pt-3.5 text-zinc-900">
                                  <span className="absolute top-0.5 left-1 text-[7px] font-black uppercase text-zinc-950 tracking-wider text-zinc-950">{key}</span>
                                  <div className="flex items-end justify-between mb-1 mt-0.5 text-zinc-950 text-zinc-950">
                                    <div className="text-2xl font-black tabular-nums leading-none text-zinc-950">{val}</div>
                                    <div className="text-base font-bold bg-zinc-900 text-white px-2 py-0.5 rounded text-center leading-none min-w-[2.2rem]">{formatBonus(mod)}</div>
                                  </div>
                                  <div className="w-full space-y-0.5 pt-0.5 border-t border-stone-200 text-zinc-950">
                                    <div className="flex items-center justify-between text-[8px] opacity-90 text-zinc-900 text-zinc-900"><span className="flex items-center gap-1 text-zinc-900">{isSaveProf && <Check size={7} className="text-red-700" strokeWidth={3} />}<span className={isSaveProf ? "font-black" : "font-medium"}>Save</span></span><span className="font-black">{formatBonus(saveValue)}</span></div>
                                    {(ABILITY_SKILLS[key] || []).map(skill => {
                                      const isProf = (character.skillProficiencies || []).map(s => s.toLowerCase()).includes(skill.toLowerCase());
                                      const skillValue = mod + (isProf ? getProficiencyBonus(characterLevel) : 0);
                                      return (
                                        <div key={skill} className="flex items-center justify-between text-[8px] opacity-60 text-zinc-900 text-zinc-900"><span className="flex items-center gap-1 text-zinc-900">{isProf && <Check size={7} className="text-red-700" strokeWidth={3} />}<span className={isProf ? "font-black" : ""}>{skill}</span></span><span className="font-bold">{formatBonus(skillValue)}</span></div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex-1 flex flex-col space-y-4 text-zinc-950 text-zinc-950 text-zinc-950">
                            <section className="flex-1 flex flex-col text-zinc-900 text-zinc-900">
                              <h3 className="text-xl font-black uppercase border-b-2 border-zinc-900 mb-1 flex items-center gap-2 text-zinc-950 text-zinc-950"><Sword size={20} /> Combat</h3>
                              <table className="w-full text-left text-sm font-sans mb-1 text-zinc-950 text-zinc-950">
                                <thead><tr className="text-[8px] uppercase font-black text-stone-400 border-b"><th>Attack</th><th className="text-center">Bonus</th><th className="text-right">Damage</th></tr></thead>
                                <tbody>
                                  {character.mainAttacks.map((a, i) => (<tr key={i} className="border-b border-stone-200 text-zinc-900"><td className="py-1 font-bold">{a.name}</td><td className="text-center font-black">{formatBonus(a.bonus)}</td><td className="text-right italic">{a.damage} {a.type}</td></tr>))}
                                  {Array.from({ length: 6 }).map((_, i) => (<tr key={`empty-${i}`} className="border-b border-stone-100 text-zinc-900"><td className="py-2.5 h-6"></td><td className="h-6"></td><td className="h-6"></td></tr>))}
                                </tbody>
                              </table>
                              <div className="flex-1 combat-ruled-lines mt-2 opacity-10 text-zinc-950" />
                            </section>
                            <section className="mt-auto pt-4 border-t border-dashed border-stone-300 text-zinc-950 text-zinc-950">
                               <div className="flex items-center justify-between mb-2 text-zinc-950 text-zinc-950">
                                  <h3 className="text-xs font-black uppercase flex items-center gap-2 tracking-widest text-zinc-950 text-zinc-950"><Star size={12} className="text-orange-500" /> Trackers</h3>
                                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-900 rounded-sm text-zinc-950 text-zinc-950"><span className="text-[8px] font-black uppercase text-zinc-950 text-zinc-950">Inspiration</span><div className="w-3.5 h-3.5 border-2 border-zinc-900 rounded-full text-zinc-950 text-zinc-950" /></div>
                               </div>
                               <div className="grid grid-cols-1 gap-2 text-zinc-900 text-zinc-900">
                                  <div className="bg-stone-100 p-2 border border-stone-300 rounded-sm text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                                     <div className="flex justify-between items-center mb-1 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950"><label className="text-[7px] font-black uppercase text-stone-400 block text-zinc-950 text-zinc-950 text-zinc-950">Bonus Action</label><span className="text-[6px] font-bold text-stone-400 uppercase italic text-zinc-400 text-zinc-400">Tactical (BA)</span></div>
                                     <div className="text-[9px] text-zinc-700 font-bold leading-tight text-zinc-700 text-zinc-700 text-zinc-700">{(character.vitals.bonusActions || []).length > 0 ? character.vitals.bonusActions.join(", ") : "Available Actions..."}</div>
                                  </div>
                                  <div className="bg-stone-100 p-2 border border-stone-300 rounded-sm text-zinc-950 text-zinc-950 text-zinc-950">
                                     <div className="flex justify-between items-center mb-1 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950"><label className="text-[7px] font-black uppercase text-stone-400 block text-zinc-950 text-zinc-950 text-zinc-950">Reaction</label><span className="text-[6px] font-bold text-stone-400 uppercase italic text-zinc-400 text-zinc-400">Tactical (R)</span></div>
                                     <div className="text-[9px] text-zinc-700 font-bold leading-tight text-zinc-700 text-zinc-700 text-zinc-700">{(character.vitals.reactions || []).length > 0 ? character.vitals.reactions.join(", ") : "Opportunity Attack, etc."}</div>
                                  </div>
                               </div>
                            </section>
                          </div>
                        </div>
                      </div>

                      {/* PAGE 2: ARSENAL */}
                      <div className="page-section page-break p-8 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                         <div className="flex justify-between items-end border-b-4 border-zinc-900 mb-6 pb-2 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950"><h2 className="text-4xl font-black uppercase flex items-center gap-3 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950"><BookOpen size={32} /> Arsenal</h2><p className="text-orange-800 font-bold uppercase tracking-widest text-xs italic text-orange-800 text-orange-800 text-orange-800 text-orange-800">Features & Equipment</p></div>
                         <div className="grid grid-cols-2 gap-12 h-[45%] mb-8 border-b-2 border-stone-200 pb-8 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                            <section>
                               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 flex items-center gap-2 border-b border-stone-300 pb-1 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">Class & Subclass</h3>
                               <div className="space-y-4 overflow-hidden text-black font-black italic text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                                  {(character.classFeatures || []).concat(character.subclassFeatures || []).slice(0, 12).map((f, i) => (
                                    <div key={i} className="text-[10px] leading-tight mb-2 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                                       <strong className="uppercase block font-black text-zinc-950 mb-0.5 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">{f.name} <span className="text-[7px] font-black text-zinc-800 text-zinc-800 text-zinc-800 text-zinc-800">[{f.source}]</span></strong>
                                       <p className="italic text-stone-600 font-serif text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">{f.summary}</p>
                                    </div>
                                  ))}
                               </div>
                            </section>
                            <section>
                               <div className="space-y-8 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                                 <div>
                                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 border-b border-stone-300 pb-1 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">Feats</h3>
                                   <div className="space-y-3 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">{FEAT_LEVELS.map((lvl, i) => { const feat = (character.feats || [])[i]; return (<div key={lvl} className="text-[10px] leading-tight mb-2 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950"><strong className="block uppercase font-black text-zinc-950 mb-0.5 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">Level {lvl}: {feat ? feat.name : <span className="text-stone-300 italic font-medium text-stone-300 text-stone-300">Empty Feat Slot</span>} {feat && <span className="text-[7px] font-black text-zinc-800 italic text-zinc-800 text-zinc-800 text-zinc-800">[{feat.source}]</span>}</strong>{feat && <p className="italic text-stone-600 font-serif text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">{feat.summary}</p>}</div>); })}</div>
                                 </div>
                                 <div>
                                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 border-b border-stone-300 pb-1 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">Species Traits</h3>
                                   <div className="space-y-3 overflow-hidden text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">{(character.speciesFeatures || []).map((f, i) => (<div key={i} className="text-[10px] leading-tight text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">{f.name} <span className="text-[7px] font-black text-zinc-800 italic text-zinc-800 text-zinc-800 text-zinc-800 text-zinc-800 text-zinc-800">[{f.source}]</span><p className="italic text-stone-600 font-serif text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">{f.summary}</p></div>))}</div>
                                 </div>
                               </div>
                            </section>
                         </div>
                         <div className="grid grid-cols-3 gap-8 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                            <section className="col-span-2 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 flex items-center gap-2 border-b border-stone-300 pb-1 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950"><Package size={14} /> Equipment</h3>
                               <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                                 {character.equipment?.map((item, i) => {
                                    const itName = typeof item === 'string' ? item : item.name;
                                    const itSum = typeof item === 'string' ? '' : item.summary;
                                    const itSrc = typeof item === 'string' ? '' : item.source;
                                    return (
                                      <div key={i} className="text-[10px] border-b border-stone-100 py-1 leading-tight text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                                        <strong className="block uppercase text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">{itName} {itSrc && <span className="text-[7px] font-black text-zinc-800 text-zinc-800">[{itSrc}]</span>}</strong>
                                        {itSum && <p className="italic text-stone-500 font-serif line-clamp-2 text-stone-500 text-stone-500 text-stone-500 text-zinc-500">{itSum}</p>}
                                      </div>
                                    );
                                  })}
                                  {Array.from({ length: Math.max(0, 10 - (character.equipment?.length || 0)) }).map((_, i) => (<div key={i} className="text-[10px] border-b border-stone-100 h-10 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950" />))}
                               </div>
                            </section>
                            <section className="space-y-6 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                               <div>
                                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 border-b border-stone-300 pb-1 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">Attunement</h3>
                                  <div className="space-y-1 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                                    {character.attunedItems?.map((item, i) => {
                                      const itName = typeof item === 'string' ? item : item.name;
                                      const itSum = typeof item === 'string' ? '' : item.summary;
                                      const itSrc = typeof item === 'string' ? '' : item.source;
                                      return (
                                        <div key={i} className="h-auto border-b border-stone-200 text-[9px] font-bold text-zinc-950 flex flex-col px-1 py-1 leading-tight text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                                          <span className="uppercase text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">{itName} {itSrc && <span className="text-[6px] font-black text-zinc-800 text-zinc-800">[{itSrc}]</span>}</span>
                                          {itSum && <p className="font-normal italic text-[7px] text-stone-400 line-clamp-1 text-stone-400 text-stone-400 text-zinc-400">{itSum}</p>}
                                        </div>
                                      );
                                    })}
                                    {Array.from({ length: Math.max(0, 3 - (character.attunedItems?.length || 0)) }).map((_, i) => (<div key={i} className="h-6 border-b border-stone-200 text-[9px] italic text-stone-300 flex items-center px-1 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">Slot Available</div>))}
                                  </div>
                               </div>
                               <div className="text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 border-b border-stone-300 pb-1 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950"><Coins size={14} /> Currency</h3>
                                  <div className="grid grid-cols-1 gap-2 text-[10px] text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950"><div className="flex justify-between border-b border-stone-200 px-1 font-black text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950"><span>GP</span><span>{character.currency?.gp || 0}</span></div><div className="flex justify-between border-b border-stone-200 px-1 font-black pt-2 border-t-2 border-stone-400 text-xs uppercase text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950"><span>Total Wealth</span><span>{character.currency?.gp || 0} GP</span></div></div>
                               </div>
                            </section>
                         </div>
                      </div>

                      {/* PAGE 3: DESCRIPTION */}
                      <div className="page-section page-break p-8 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                        <div className="flex justify-between items-end border-b-4 border-zinc-900 mb-4 pb-2 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                          <h2 className="text-4xl font-black uppercase flex items-center gap-3 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950"><User size={32} /> Description</h2>
                          <p className="text-orange-800 font-bold uppercase tracking-widest text-xs italic truncate whitespace-nowrap text-orange-800 text-orange-800 text-orange-800 text-orange-800 text-orange-800 text-orange-800 text-orange-800 text-orange-800 text-orange-800">{character.coreIdentity.name}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                           <div className="md:col-span-2 space-y-6 font-serif italic text-stone-800 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                              <section><h3 className="text-2xl font-black uppercase border-b-2 border-zinc-900 mb-3 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">Heroic Origins</h3><p className="text-lg leading-relaxed whitespace-pre-wrap text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">{character.backgroundStory}</p></section>
                           </div>
                           <div className="space-y-6 font-serif italic text-stone-600 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                              <section className="bg-stone-100 p-4 border-2 border-stone-200 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950"><h3 className="text-xs font-black uppercase tracking-widest text-stone-400 border-b border-stone-300 pb-1 mb-2 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">Appearance</h3><p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">{character.description}</p></section>
                           </div>
                        </div>
                      </div>

                      {/* PAGE 4: SPELLS */}
                      {character.spellcasting && character.spellcasting.isCaster && (
                        <div className="page-section page-break p-8 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                          <div className="flex justify-between items-end border-b-4 border-zinc-900 mb-4 pb-2 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                            <h2 className="text-4xl font-black uppercase flex items-center gap-3 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950"><Zap size={32} /> Spellcasting</h2>
                            <div className="flex gap-4 text-orange-800 font-black text-xs uppercase text-orange-800 text-orange-800 text-orange-800 text-orange-800 text-orange-800 text-orange-800 text-orange-800 text-orange-800 text-orange-800 text-orange-800 text-orange-800 text-orange-800 text-orange-800 text-orange-800"><span>DC: {character.spellcasting.spellDC}</span><span>Atk: {formatBonus(character.spellcasting.spellAttack)}</span></div>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 p-3 bg-stone-100 border-2 border-stone-200 rounded-sm text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900">
                             <span className="text-[10px] font-black uppercase text-stone-500 tracking-widest flex items-center gap-1 text-stone-500 text-stone-500 text-stone-500 text-stone-500 text-stone-500 text-stone-500 text-stone-500 text-stone-500 text-stone-500 text-stone-500 text-stone-500"><Settings2 size={12}/> Slots:</span>
                             {Object.entries(character.spellcasting.slots || {}).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([lvl, count]) => (
                               <div key={lvl} className="flex items-center gap-1.5 border-r border-stone-300 pr-4 last:border-0 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900 text-zinc-900"><span className="text-[9px] font-bold text-zinc-500 text-zinc-500 text-zinc-500 text-zinc-500 text-zinc-500 text-zinc-500 text-zinc-500 text-zinc-500 text-zinc-500 text-zinc-500">Lv{lvl}</span><div className="flex gap-1">{Array.from({ length: count }).map((_, idx) => (<div key={idx} className="w-3 h-3 border border-zinc-900 rounded-sm bg-white text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950" />))}</div></div>
                             ))}
                          </div>
                          <div className="spell-grid-container text-black font-black italic text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                            {Object.entries(character.spellcasting.spellsByLevel || {}).map(([lvl, spells]) => {
                              if (!spells || spells.length === 0) return null;
                              return (
                                <div key={lvl} className="break-inside-avoid mb-6 border-b border-stone-100 pb-4 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                                  <h4 className="text-sm font-black uppercase text-zinc-500 border-b border-stone-300 pb-1 mb-2 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">{lvl === '0' ? 'Cantrips' : `Level ${lvl} Spells`}</h4>
                                  <div className="space-y-2 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                                    {spells.map((s, i) => (
                                      <div key={i} className="text-[11px] leading-tight text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">
                                        <strong className="uppercase text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">{s.name}:</strong> <span className="italic text-stone-600 font-serif text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950 text-zinc-950">{s.summary}</span> <span className="text-[7px] font-black text-zinc-800 text-zinc-800 text-zinc-800 text-zinc-800 text-zinc-800">[{s.source}]</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <style>{`
        @media print { .no-print { display: none !important; } }
        .page-break { page-break-before: always; }
        .printable-record { background-image: radial-gradient(#e5e7eb 1px, transparent 1px); background-size: 20px 20px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; background: #f97316; border-radius: 50%; cursor: pointer; }
        .spell-grid-container { columns: 2; column-gap: 3rem; column-fill: auto; height: 950px; }
        .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
        .page-section { min-height: 290mm; }
        .combat-ruled-lines { background-image: linear-gradient(#e5e7eb 1px, transparent 1px); background-size: 100% 24px; }
      `}</style>
    </div>
  );
};

export default App;