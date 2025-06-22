import { foeType } from "./foes";
import { mundaneNameGenerator } from "./nameGenerator";
import { mkGen, RecursiveGenerator, type LeafGenerator } from "./recursiveGenerator";

const capFirst = (s: string) => s.slice(0,1).toUpperCase() + s.slice(1);

const MAX_THEMES = 3;
type ThemeOptionList<T> = [T,T,T, ...T[]];

export type WeaponViewModel = {
    themes: Theme[],
    
    name: string;

    damage: DamageDice;
    activePowers: (ChargedPower | UnlimitedChargedPower)[];
    passivePowers: PassivePower[];
} & (
    { isSentient: false; } | {
        isSentient: true;
        personalityTraits: string[];
        languages: string[];
    }
)

const OBJECT_ADJECTIVES = {
    metal: [
        "adamant",
        "unbreakable",
        "razor-sharp",
    ],
    fire: [
        "fiery",
        "blazing",
        "blazed",
        "roaring",
        "crackling",
    ],
    ice: [
        "icy",
        "frigid",
        "silent",
        "glassy",
        "polar",
    ],
    dark: [
        "shadow-wreathed",
        "stygian",
        "abyssal"
    ],
    light: [
        "rainbow",
        "translucent",
        "moonlit",
        "glittery",
        "lucent",
        "prismatic"
    ],
    sweet: ["saccharine", "candied", "glazed"], 
    sour: ["corroded", "corrosive"]
} satisfies Record<Theme | string, [string, ...string[]]>;

const generateObjectAdjective = (themes: Theme[]) => 
    themes.map(x => OBJECT_ADJECTIVES[x])
    .choice()   //choose a category
    .choice();  //choose an adjective

const mkNonSentientNameGenerator = (themes: Theme[]) => mkGen(() => {
    const string = new RecursiveGenerator([
        mkGen(() => Math.random()>.9 ? mundaneNameGenerator.generate() + ', the ' : ''),
        [mkGen(generateObjectAdjective(themes)), weaponMaterialGenerator].choice(),
        mkGen(' '),
        weaponShapeGenerator
    ]).generate();
    return string.split(/\s/).map(capFirst).join(' ');
});
const mkSentientNameGenerator = (themes: Theme[]) => mkGen(() => {
    const string = new RecursiveGenerator([
        mundaneNameGenerator,
        mkGen(', the '),
        [mkGen(generateObjectAdjective(themes)), weaponMaterialGenerator].choice(),
        mkGen(' '),
        weaponShapeGenerator
    ]).generate();
    return string.split(/\s/).map(capFirst).join(' ');
});
        

const exoticWeaponMaterialsGenerator = mkGen(() => [
    "silver",
    "gold",
    "black iron",
    "lumensteel",
    "mithrel",
    "adamantium",
    "cobalt",
    "radium",
    "diamond",
    "ruby",
    "sapphire",
].choice());

const normalWeaponMaterialsGenerator = mkGen(() => [
    "tin",
    "copper",
    "bronze",
    "iron",
    "steel",
    "silver",
    "gold"
].choice());

const crummyWeaponMaterialsGenerator = mkGen(() => [
    "oak",
    "pine",
    "granite",
    "marble",
    "alabaster",
    "sandstone",
    "flint",
    "quartz"
].choice());

const weaponMaterialGenerator = mkGen(() => {
    const n = Math.random();
    if(n>.75) {
        return exoticWeaponMaterialsGenerator.generate();
    }
    else if(n>.5) {
        return normalWeaponMaterialsGenerator.generate();
    }
    else {
        return crummyWeaponMaterialsGenerator.generate();
    }
});



const weaponShapeGenerator = mkGen(() => {
    const n = Math.random();
    console.log('weapon shape');
    if(n>.75) {
        console.log(1);
        return exoticWeaponShapeGenerator.generate();
    }
    else if(n>.5) {
        console.log(2);
        return normalWeaponShapeGenerator.generate();
    }
    else {
        console.log(3);
        return crummyWeaponShapeGenerator.generate();
    }
});

const exoticWeaponShapeGenerator = mkGen(() => [
    "ultra-greatsword",
    "scimitar",
    "macuahuitl",
    "katana",
    "lance",
].choice());

const normalWeaponShapeGenerator = mkGen(() => [
    "greataxe",
    "axe",
    "handaxe",
    "greatsword",
    "longsword",
    "sword",
    "shortsword",
    "sabre",
    "mace",
    "spear",
    "pike",
    "staff"
].choice());

const crummyWeaponShapeGenerator = mkGen(() => [
    "club",
    "rod"
].choice());

interface Power {
    desc: string | LeafGenerator | RecursiveGenerator;
    additionalNotes?: string[];
}

interface DamageDice {
    d4?: number;
    d6?: number;
    d8?: number;
    d10?: number;
    d12?: number;
    d20?: number;
}
interface PassiveBonus {
    addDamageDie?: DamageDice;
} // TODO

interface ChargedPower extends Power {
    chargeCost: number;
}
interface UnlimitedChargedPower extends Power {
    charges: "at";
}

interface MiscPower extends Power {
    miscPower: true;
    bonus?: PassiveBonus;
}
interface Language extends Power {
    language: true;
}

type PassivePower = Language | MiscPower;

// The text of these should not contain any references to charges
// this is because we want to reuse them for unlimited charged abilities
const POSSIBLE_ACTIVE_POWERS = {
    "fire": [
        {
            desc: "Fire Ball",
            chargeCost: 3
        },
        {
            desc: "Wall of Fire",
            chargeCost: 4,
        },
        {
            desc: "Control Weather (hot)",
            chargeCost: 2,
            additionalNotes: ["must move conditions towards heatwave"]
        },
        {
            desc: "Control Flames",
            chargeCost: 1,
            additionalNotes: ["flames larger than wielder submit only after a save"]
        }
    ],
    "ice": [
        {
            desc: "Wall of Ice",
            chargeCost: 2,
        },
        {
            desc: "Control Weather (cold)",
            chargeCost: 3,
            additionalNotes: ["must move conditions towards blizzard"]
        },
        {
            desc: "Chilling Strike",
            chargeCost: 2,
            additionalNotes: ["struck foes save or be frozen solid next turn"]
        }
    ],
    "dark": [
        {
            desc: "Commune With Demon",
            chargeCost: 2
        },
        {
            desc: "Turn Priests & Angels",
            chargeCost: 1
        },
        {
            desc: "Darkness",
            chargeCost: 1
        },
    ],
    "light": [
        {
            desc: "Commune With Divinity",
            chargeCost: 2
        },
        {
            desc: "Turn Undead",
            chargeCost: 1
        },
        {
            desc: "Light",
            chargeCost: 1
        },
    ],
    "sweet": [
        {
            desc: "Charm Person",
            chargeCost: 2,
        },
        {
            desc: "Sweetberry",
            chargeCost: 1,
            additionalNotes: ["Create a small berry, stats as healing potion."]
        },
        {
            desc: "Sugar Spray",
            chargeCost: 1,
            additionalNotes: ["Sprays a sweet and sticky syrup, enough to coat the floor of a small room. Makes movement difficult."]
        },
    ],
    "sour": [
        {
            desc: "Caustic Strike",
            chargeCost: 2,
            additionalNotes: ["Melts objects, damages armor of struck characters"]
        },
        {
            desc: "Locate Lemon",
            chargeCost: 1,
            additionalNotes: ["Locates the closest lemon."]
        },
        {
            desc: "Cause Nausea",
            chargeCost: 1,
            additionalNotes: ["Target must save or waste their turn vomiting."]
        },
    ],
} satisfies Record<Theme | string, ThemeOptionList<ChargedPower>>;

const POSSIBLE_PASSIVE_POWERS = {
    "fire": [
        {
            language: true,
            desc: "The language of Fire"
        },
        {
            miscPower: true,
            desc: "Wielder takes half damage from fire"
        },
        {
            miscPower: true,
            desc: "Wielder cannot be harmed by fire"
        },
        {
            miscPower: true,
            desc: "Wreathed in flames, glows like a torch",
            bonus: {
                addDamageDie: {
                    d6: 1,
                }
            }
        },
        {
            miscPower: true,
            desc: "Weapon is a master blacksmith."
        }
    ],
    "ice": [
        {
            language: true,
            desc: "The language of Ice & Snow"
        },
        {
            miscPower: true,
            desc: "Wielder takes half damage from ice & cold"
        },
        {
            miscPower: true,
            desc: "Wielder cannot be harmed by ice & cold"
        },
        {
            miscPower: true,
            desc: "Wreathed in ice, always frozen into its sheath. Requires a strength save to draw.",
            bonus: {
                addDamageDie: {
                    d8: 1,
                }
            }
        },
        {
            miscPower: true,
            desc: "1-in-2 chance to sense icy weather before it hits, giving just enough time to escape"
        }
    ],
    "dark": [
        {
            miscPower: true,
            desc: "Menacing aura. Bonus to saves to frighten & intimate."
        },
        {
            miscPower: true,
            desc: "Traps the souls of its victims. They haunt the weapon, and obey the wielder's commands"
        },
        {
            miscPower: true,
            desc: "Wreathed in lightless black flames.",
            bonus: {
                addDamageDie: {
                    d6: 1,
                }
            }
        }
    ],
    "light": [
        {
            language: true,
            desc: "Angelic"
        },
        {
            miscPower: true,
            desc:"Wielder takes half damage from rays & beams"
        },
        {
            miscPower: true,
            desc: "Wielder is immune to the effects of rays & beams"
        },
        {
            miscPower: true,
            desc: new RecursiveGenerator([
                mkGen("Glows like a torch when "), 
                foeType,
                mkGen(" are near")
            ]),
        },
        {
            miscPower: true,
            desc: "Can reflect and focus light as a damaging beam (2d6 damage)",
        },
        {
            miscPower: true,
            desc: "Wielder has a wholesome aura. Bonus to saves to spread cheer and/or appear nonthreatening.",
        }
    ],
    "sweet": [
        {
            miscPower: true,
            desc: "Weapon is a master chef.",
        },
        {
            miscPower: true,
            desc: "The wielder magically knows the recipe of any dessert they taste.",
        },
        {
            miscPower: true,
            desc: "Cute animals follow the wielder's polite requests i.e. cats and forest birds.",
        },
        {
            miscPower: true,
            desc: "Eat business end to heal HP equal to damage roll. Renders weapon unusable until it reforms, 24 hours later."
        }
    ],
    "sour": [
        {
            miscPower: true,
            desc: "Weapon is a master alchemist."
        },
        {
            miscPower: true,
            desc: "Wielder takes half damage from corrosive chemicals."
        },
        {
            miscPower: true,
            desc: "Wielder is immune to the harmful effects of corrosive chemicals."
        },
        {
            miscPower: true,
            desc: "Licking the weapon cures scurvy. It tastes sour."
        }
    ],
} satisfies Record<Theme | string,ThemeOptionList<PassivePower>>;

const POSSIBLE_PERSONALITIES = {
    "fire": [
            "compassionate",
            "irritable",
            "flirty",
            "standoffish",
            "zealous",
            "wrathful",
            "warm",
            "honest",
        ],
    "ice": [
            "cold",
            "formal",
            "haughty",
            "idealistic",
            "impersonal",
            "pitiless",
            "reserved",
            "serious",
            "stubborn",
            "vengeful",
        ],
    "water": [
            "easy-going",
            "easy-going",
            "easy-going"
        ],
    "sweet": [
        "kind",
        "excitable",
        "manic",
        "neurotic",
        "vengeful",
    ],
    "sour": [
            "antagonistic",
            "cruel",
            "pitiless",
            "manic",
            "sassy"
        ],
    "poison": [
            "antagonistic",
            "cruel",
            "pitiless",
            "violent",
            "standoffish",
            "sadistic",
            "enjoys provoking others"
        ],
    "dark": [
            "shy",
            "tries to act mysterious",
            "quiet",
            "depressive",
            "cruel",
            "angry",
            "vengeful",
            "sadistic",
            "enjoys provoking others"
        ],
    "light": [
            "logical",
            "honest",
            "pious",
            "zealous",
        ]
} satisfies Record<Theme | string, ThemeOptionList<string>>;

// const POSSIBLE_RECHARGE_METHODS = {
//     fire: [
//         mkGen("regains all charges after being superheated"),
//         mkGen("regains a charge at the end of each scene where its wielder started a fire"),
//         mkGen("regains all charges when its wielder wins an argument"),
//     ],
//     ice: [
//         mkGen("regains all charges after being cooled to sub-zero"),
//         mkGen("regains a changes whenever its wielder builds a snowman"),
//         mkGen("regains a charge at the end of each scene where its wielder made an ice pun")
//     ],
//     dark: [
//         mkGen("regains a charge upon absorbing a human soul"),
//         mkGen("regains a charge at the end of each scene where its wielder destroyed an object unnecessarily"),
//         mkGen("regains all charges each day at the witching hour")
//     ],
//     light: [
//         mkGen("regains all charges after an hour in a sacred space"),
//         mkGen("regains a charges each day at sunrise"),
//         new RecursiveGenerator([
//             mkGen("regains a charges after defeating a"), 
//             foeType,
//             mkGen(".")
//         ])
//     ],
//     sweet: [
//         mkGen("regains a charge each time it eats an extravagant dessert"),
//         mkGen("regains all charges each time its wielder hosts a feast"),
//         mkGen("regains charge whenever its wielder complements someone")
//     ],
//     sour: [
//         mkGen("regains all charges after an hour immersed in acid"),
//         mkGen("regains all charges when used to fell a citrus tree"),
//         mkGen("regains a charge each time its wielder insults someone")
//     ],
//     // electric: [
//     //     "regains all charges when struck by lightning",
//     // ]
// } satisfies Record<Theme | string,ThemeOptionList<LeafGenerator | RecursiveGenerator>>;

const POSSIBLE_THEMES = [
    "fire", "ice",
    "dark", "light",
    "sweet", "sour",
    // "poison", "water"
    // "earth", "cloud",
    // "truth", "deceit",
    // "love", "domination",
    // "telekinesis", "divination"
] as const;
type Theme = (typeof POSSIBLE_THEMES)[number];

export const WEAPON_GENERATOR: (gpValue: number) => WeaponViewModel = (gpValue) => {
    interface WeaponGenerationParams {
        damage: DamageDice;
        passive: number;
        nChargesProvider: () => number;
        active: number;
        unlimitedCharged: number;
        sentienceChance: number;
    }
    function mkUnusedFromPossible<T>(possible: Record<Theme, T[]>): Record<Theme,Set<T>> {  
        return Object.entries(possible).reduce((acc, [k,vs]) => {
            acc[k as Theme] = new Set<T>();
            vs.forEach(v => acc[k as Theme].add(v));
            return acc;
        }, {} as Record<Theme, Set<T>>);
    }
    function drawFrom<T>(keys: Theme[], from: Record<Theme,Set<T>>): T {
        // choose a theme that still has powers left
        const chosenTheme = keys.filter(x => from[x].size>0).choice();
        // choose a power for that theme
        const chosenT  = from[chosenTheme].choice();
        from[chosenTheme].delete(chosenT);
        return chosenT;
    }
    const paramsFor: (gpValue: number) => WeaponGenerationParams = (gpValue) => {
        if(gpValue < 500) {
            return {
                damage: { d6: 1 }, passive: 0, nChargesProvider: () => Math.ceil(Math.random() * 4), active: 1, unlimitedCharged: 0, sentienceChance: 0.1
            }
        }
        else if (gpValue < 750) {
            return {
                damage: { d6: 1 },  passive: 1, nChargesProvider: () => Math.ceil(Math.random() * 6), active: 1, unlimitedCharged: 0, sentienceChance: 0.5
            }
        }
        else if (gpValue < 950) {
            return {
                damage: { d6: 1 }, passive: 1, nChargesProvider: () => Math.ceil(Math.random() * 8), active: 2, unlimitedCharged: 0, sentienceChance: 0.1
            }
        }
        else if(gpValue < 1000) {
            return {
                damage: { d6: 1 }, passive: 1, nChargesProvider: () => Math.ceil(Math.random() * 10), active: 3, unlimitedCharged: 0, sentienceChance: 1
            }
        }
        else {
            return {
                damage: { d6: 1 }, passive: 1, nChargesProvider: () => Math.ceil(Math.random() * 12), active: 2, unlimitedCharged: 1, sentienceChance: 1
            }
        }
    };

    const unusedThemes = new Set<Theme>(POSSIBLE_THEMES);
    
    // copy over all the powers to the structure we'll draw from
    const unusedActivePowers = mkUnusedFromPossible(POSSIBLE_ACTIVE_POWERS);
    const unusedPassivePowers = mkUnusedFromPossible(POSSIBLE_PASSIVE_POWERS)
    
    // decide power level
    const params = paramsFor(gpValue);
    
    // determine themes
    let nThemes = Math.ceil(Math.random() * MAX_THEMES);
    const themes: Theme[] = [];
    while(nThemes-->0) {
        const chosen = unusedThemes.choice();
        unusedThemes.delete(chosen);
        themes.push(chosen);
    }
    
    // determine sentience
    const isSentient = Math.random() < params.sentienceChance;
    
    // determine name
    const name = (isSentient ? mkSentientNameGenerator(themes) : mkNonSentientNameGenerator(themes)).generate();
    
    // determine description

    // determine personality
    const viewModel: WeaponViewModel = isSentient ? {
        themes,
        name,
        damage: params.damage,
        activePowers: [],
        passivePowers: [],
        isSentient: true,
        personalityTraits: [],
        languages: ['Common']
    } : {
        themes,
        name,
        damage: params.damage,
        activePowers: [],
        passivePowers: [],
        isSentient: false
    };

    if(viewModel.isSentient) {
        // copy over all the charged powers
        const unusedPersonalities = mkUnusedFromPossible(POSSIBLE_PERSONALITIES)

        // choose one personality for each theme
        themes.forEach(theme => {
            const chosen  = unusedPersonalities[theme].choice();
            if(chosen !== undefined) {
                unusedThemes.delete(theme);
                viewModel.personalityTraits.push(capFirst(chosen) + '.');
            }
        })
    }

    while(params.passive-->0) {
        viewModel.passivePowers.push(drawFrom(themes, unusedPassivePowers));
    }

    while(params.active-->0) {
        viewModel.activePowers.push(drawFrom(themes, unusedActivePowers));
    }

    while(params.unlimitedCharged-->0) {
        viewModel.activePowers.push(drawFrom(themes, unusedActivePowers));
    }
    
    return viewModel;
}
