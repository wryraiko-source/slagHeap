export const SETTINGS = ["Faerun", "Sword Coast", "Eberron", "Spelljammer", "Wildemount", "Planescape", "Dragonlance", "Strixhaven", "Other"];
export const ART_STYLES = ["Classic D&D", "Realistic", "Water Color", "Anime", "Ink Drawing", "Pencil Sketch Line Art", "Custom"];
export const STAT_KEYS = ["str", "dex", "con", "int", "wis", "cha"];
export const FEAT_LEVELS = [1, 4, 8, 12, 16, 19];

export const SPECIES_CATEGORIES: Record<string, string[]> = {
  "Common": ["Human", "Elf", "Dwarf", "Halfling", "Gnome", "Dragonborn", "Tiefling", "Orc", "Goliath"],
  "Eberron": ["Warforged", "Shifter", "Kalashtar", "Changeling"],
  "Wildemount": ["Pallid Elf", "Lotusden Halfling", "Ravenite Dragonborn", "Dragonblood Dragonborn"],
  "Faerun/Regional": ["Aasimar", "Genasi", "Firbolg", "Kenku", "Tabaxi", "Lizardfolk", "Triton", "Bugbear", "Goblin", "Hobgoblin", "Kobold", "Yuan-ti"],
  "Feywild": ["Owlin", "Harengon", "Satyr", "Fairy", "Leonin"],
  "Spelljammer": ["Giff", "Astral Elf", "Autognome", "Hadozee", "Plasmoid", "Thri-kreen"],
  "Other": ["Custom"]
};

export const ALL_SPECIES = Object.values(SPECIES_CATEGORIES).flat();
export const GENDERS = ["Male", "Female", "Non-binary", "Other", "Custom"];

export const BACKGROUND_CATEGORIES: Record<string, string[]> = {
  "PHB (2024)": ["Acolyte", "Charlatan", "Criminal", "Entertainer", "Farmer", "Guard", "Guide", "Hermit", "Merchant", "Noble", "Outlander", "Sage", "Sailor", "Soldier", "Wayfarer"],
  "Sword Coast": ["City Watch", "Clan Crafter", "Cloistered Scholar", "Courtier", "Far Traveler", "Inheritor", "Knight of the Order", "Mercenary Veteran", "Urban Bounty Hunter", "Uthgardt Tribe Member", "Waterdhavian Noble"],
  "Faerun": ["Harper Agent", "Order of the Gauntlet", "Emerald Enclave", "Lords' Alliance", "Zhentarim Agent", "Red Wizard", "Arcane Brotherhood", "Flaming Fist", "Smuggler", "Shipwright", "Fisher", "Marine"],
  "Eberron": ["Agent of Cannith", "Agent of Deneith", "Agent of Ghallanda", "Agent of Jorasco", "Agent of Kundarak", "Agent of Lyrandar", "Agent of Medani", "Agent of Orien", "Agent of Phiarlan", "Agent of Sivis", "Agent of Tharashk", "Agent of Thuranni", "Agent of Vadalis"],
  "Spelljammer": ["Astral Drifter", "Wildspacer"],
  "Planescape": ["Gate Warden", "Planar Philosopher"],
  "Dragonlance": ["Knight of Solamnia", "Mage of High Sorcery"],
  "Strixhaven": ["Silverquill Student", "Lorehold Student", "Prismari Student", "Quandrix Student", "Witherbloom Student"],
  "Wildemount": ["Cobalt Scholar", "Grinner", "Volstrucker Agent", "Myriad Operative", "Luxonborn"],
  "Other": ["Giant Foundling", "Rune Carver", "Feylost", "Witchlight Hand"]
};

export const BACKGROUND_DATA: Record<string, { skills: string[] }> = {
  "Acolyte": { skills: ["Insight", "Religion"] }, "Charlatan": { skills: ["Deception", "Sleight of Hand"] },
  "Criminal": { skills: ["Deception", "Stealth"] }, "Entertainer": { skills: ["Acrobatics", "Performance"] },
  "Farmer": { skills: ["Animal Handling", "Nature"] }, "Guard": { skills: ["Athletics", "Perception"] },
  "Guide": { skills: ["Stealth", "Survival"] }, "Hermit": { skills: ["Medicine", "Religion"] },
  "Merchant": { skills: ["Animal Handling", "Persuasion"] }, "Noble": { skills: ["History", "Persuasion"] },
  "Outlander": { skills: ["Athletics", "Survival"] }, "Sage": { skills: ["Arcana", "History"] },
  "Sailor": { skills: ["Athletics", "Perception"] }, "Soldier": { skills: ["Athletics", "Intimidation"] },
  "Wayfarer": { skills: ["Insight", "Stealth"] },
  "City Watch": { skills: ["Athletics", "Insight"] }, "Clan Crafter": { skills: ["History", "Insight"] },
  "Cloistered Scholar": { skills: ["History", "Arcana"] }, "Courtier": { skills: ["Insight", "Persuasion"] },
  "Far Traveler": { skills: ["Insight", "Perception"] }, "Inheritor": { skills: ["Survival", "Arcana"] },
  "Knight of the Order": { skills: ["Persuasion", "Religion"] }, "Mercenary Veteran": { skills: ["Athletics", "Persuasion"] },
  "Urban Bounty Hunter": { skills: ["Deception", "Stealth"] }, "Uthgardt Tribe Member": { skills: ["Athletics", "Survival"] },
  "Waterdhavian Noble": { skills: ["History", "Persuasion"] },
  
  // Faerun Factions
  "Harper Agent": { skills: ["Insight", "Deception"] }, "Order of the Gauntlet": { skills: ["Insight", "Religion"] },
  "Emerald Enclave": { skills: ["Nature", "Survival"] }, "Lords' Alliance": { skills: ["History", "Persuasion"] },
  "Zhentarim Agent": { skills: ["Deception", "Intimidation"] }, "Red Wizard": { skills: ["Arcana", "Intimidation"] },
  "Arcane Brotherhood": { skills: ["Arcana", "History"] }, "Flaming Fist": { skills: ["Athletics", "Intimidation"] },
  "Smuggler": { skills: ["Deception", "Stealth"] }, "Shipwright": { skills: ["History", "Perception"] },
  "Fisher": { skills: ["History", "Survival"] }, "Marine": { skills: ["Athletics", "Survival"] },

  // Eberron Houses
  "Agent of Cannith": { skills: ["Investigation", "Persuasion"] }, "Agent of Deneith": { skills: ["Intimidation", "Persuasion"] },
  "Agent of Ghallanda": { skills: ["Insight", "Persuasion"] }, "Agent of Jorasco": { skills: ["Medicine", "Persuasion"] },
  "Agent of Kundarak": { skills: ["Investigation", "Persuasion"] }, "Agent of Lyrandar": { skills: ["Nature", "Persuasion"] },
  "Agent of Medani": { skills: ["Insight", "Investigation"] }, "Agent of Orien": { skills: ["Survival", "Persuasion"] },
  "Agent of Phiarlan": { skills: ["Performance", "Stealth"] }, "Agent of Sivis": { skills: ["Investigation", "Persuasion"] },
  "Agent of Tharashk": { skills: ["Perception", "Survival"] }, "Agent of Thuranni": { skills: ["Performance", "Stealth"] },
  "Agent of Vadalis": { skills: ["Animal Handling", "Nature"] },

  // Settings
  "Astral Drifter": { skills: ["Insight", "Religion"] }, "Wildspacer": { skills: ["Athletics", "Survival"] },
  "Gate Warden": { skills: ["Persuasion", "Survival"] }, "Planar Philosopher": { skills: ["Arcana", "Persuasion"] },
  "Knight of Solamnia": { skills: ["Athletics", "Survival"] }, "Mage of High Sorcery": { skills: ["Arcana", "History"] },
  "Silverquill Student": { skills: ["Deception", "Intimidation"] }, "Lorehold Student": { skills: ["History", "Religion"] },
  "Prismari Student": { skills: ["Acrobatics", "Performance"] }, "Quandrix Student": { skills: ["Arcana", "Nature"] },
  "Witherbloom Student": { skills: ["Animal Handling", "Nature"] },
  
  // Wildemount
  "Cobalt Scholar": { skills: ["Arcana", "History"] }, "Grinner": { skills: ["Deception", "Performance"] },
  "Volstrucker Agent": { skills: ["Deception", "Stealth"] }, "Myriad Operative": { skills: ["Deception", "Sleight of Hand"] },
  "Luxonborn": { skills: ["Insight", "Religion"] },

  // Other
  "Giant Foundling": { skills: ["Intimidation", "Survival"] }, "Rune Carver": { skills: ["History", "Perception"] },
  "Feylost": { skills: ["Deception", "Survival"] }, "Witchlight Hand": { skills: ["Performance", "Sleight of Hand"] }
};

export const CLASS_DATA: Record<string, { saves: string[], skillCount: number, skills: string[] }> = {
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

export const SUBCLASS_DATA: Record<string, string[]> = {
  "Artificer": ["Alchemist", "Armorer", "Artillerist", "Battle Smith"],
  "Barbarian": ["Path of the Berserker", "Path of the Wild Heart", "Path of the World Tree", "Path of the Zealot", "Path of the Ancestral Guardian", "Path of the Storm Herald", "Path of the Beast", "Path of Wild Magic"],
  "Bard": ["College of Dance", "College of Glamour", "College of Lore", "College of Valor", "College of Swords", "College of Whispers", "College of Creation", "College of Eloquence", "College of Spirits"],
  "Cleric": ["Life Domain", "Light Domain", "Trickery Domain", "War Domain", "Knowledge Domain", "Nature Domain", "Tempest Domain", "Death Domain", "Forge Domain", "Grave Domain", "Order Domain", "Peace Domain", "Twilight Domain"],
  "Druid": ["Circle of the Land", "Circle of the Moon", "Circle of the Sea", "Circle of the Stars", "Circle of Dreams", "Circle of the Shepherd", "Circle of Spores", "Circle of Wildfire"],
  "Fighter": ["Battle Master", "Champion", "Eldritch Knight", "Psi Warrior", "Arcane Archer", "Cavalier", "Samurai", "Rune Knight", "Echo Knight", "Brawler"],
  "Monk": ["Warrior of Mercy", "Warrior of Shadow", "Warrior of the Elements", "Warrior of the Open Hand", "Way of the Long Death", "Way of the Sun Soul", "Way of the Drunken Master", "Way of the Kensei", "Way of the Ascendant Dragon"],
  "Paladin": ["Oath of Devotion", "Oath of Glory", "Oath of the Ancients", "Oath of Vengeance", "Oath of the Crown", "Oath of Conquest", "Oath of Redemption", "Oath of the Watchers"],
  "Ranger": ["Beast Master", "Fey Wanderer", "Gloom Stalker", "Hunter", "Horizon Walker", "Monster Slayer", "Swarmkeeper", "Drakewarden"],
  "Rogue": ["Arcane Trickster", "Assassin", "Soulknife", "Thief", "Mastermind", "Swashbuckler", "Inquisitive", "Scout", "Phantom"],
  "Sorcerer": ["Aberrant Sorcery", "Clockwork Sorcery", "Draconic Sorcery", "Wild Magic Sorcery", "Divine Soul", "Shadow Magic", "Storm Sorcery", "Lunar Sorcery"],
  "Warlock": ["Archfey Patron", "Celestial Patron", "Fiend Patron", "Great Old One Patron", "Hexblade", "Fathomless", "Genie", "Undead"],
  "Wizard": ["Abjurer", "Diviner", "Evoker", "Illusionist", "School of Conjuration", "School of Enchantment", "School of Necromancy", "School of Transmutation", "Bladesinging", "Order of Scribes", "War Magic"]
};

export const ABILITY_SKILLS: Record<string, string[]> = {
  str: ["Athletics"], dex: ["Acrobatics", "Sleight of Hand", "Stealth"], con: [],
  int: ["Arcana", "History", "Investigation", "Nature", "Religion"],
  wis: ["Animal Handling", "Insight", "Medicine", "Perception", "Survival"],
  cha: ["Deception", "Intimidation", "Performance", "Persuasion"]
};

export const ALL_SKILLS = Object.entries(ABILITY_SKILLS).flatMap(([ability, skills]) => skills.map(name => ({ name, ability })));
