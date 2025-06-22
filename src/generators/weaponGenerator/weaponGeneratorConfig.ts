import { pluralUnholyFoe, singularUnholyFoe } from "../foes";
import {mkGen, type StringGenerator, RecursiveGenerator } from "../recursiveGenerator";
import type { ChargedPower, UnlimitedChargedPower, Language, MiscPower } from "./weaponGeneratorTypes";

export const weaponShapeGenerator = mkGen((rng) => {
    const n = rng();
    if(n>.75) {
        return exoticWeaponShapeGenerator.generate(rng);
    }
    else if(n>.05) {
        return normalWeaponShapeGenerator.generate(rng);
    }
    else {
        return crummyWeaponShapeGenerator.generate(rng);
    }
});

export const exoticWeaponShapeGenerator = mkGen((rng) => [
    "ultra-greatsword",
    "scimitar",
    "macuahuitl",
    "katana",
    "lance",
].choice(rng));

const normalWeaponShapeGenerator = mkGen((rng) => [
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
].choice(rng));

const crummyWeaponShapeGenerator = mkGen((rng) => [
    "club",
    "rod"
].choice(rng));

// The text of these should not contain any references to charges
// this is because we want to reuse them for unlimited charged abilities
export const POSSIBLE_ACTIVE_POWERS = {
    "fire": [
        {
            desc: mkGen("Fire Ball"),
            cost: 3
        },
        {
            desc: "Wall of Fire",
            cost: 4,
        },
        {
            desc: "Control Weather",
            cost: 2,
            additionalNotes: ["Must move conditions towards heatwave."]
        },
        {
            desc: "Control Flames",
            cost: 1,
            additionalNotes: ["Flames larger than wielder submit only after a save."]
        }
    ],
    "ice": [
        {
            desc: "Wall of Ice",
            cost: 2,
        },
        {
            desc: "Control Weather",
            cost: 3,
            additionalNotes: ["Must move conditions towards blizzard."]
        },
        {
            desc: "Chilling Strike",
            cost: 2,
            additionalNotes: ["Struck foes save or be frozen solid next turn."]
        }
    ],
    "dark": [
        {
            desc: "Commune With Demon",
            cost: 2
        },
        {
            desc: "Turn Priests & Angels",
            cost: 1
        },
        {
            desc: "Darkness",
            cost: 1
        },
    ],
    "light": [
        {
            desc: "Commune With Divinity",
            cost: 2
        },
        {
            desc: "Turn Undead",
            cost: 1
        },
        {
            desc: "Light",
            cost: 1
        },
    ],
    "sweet": [
        {
            desc: "Charm Person",
            cost: 2,
        },
        {
            desc: "Sweetberry",
            cost: 1,
            additionalNotes: ["Create a small berry, stats as healing potion."]
        },
        {
            desc: "Sugar Spray",
            cost: 1,
            additionalNotes: ["Sprays a sweet and sticky syrup, enough to coat the floor of a small room. Makes movement difficult."]
        },
    ],
    "sour": [
        {
            desc: "Caustic Strike",
            cost: 2,
            additionalNotes: ["Melts objects, damages armor of struck characters."]
        },
        {
            desc: "Locate Lemon",
            cost: 1,
            additionalNotes: ["Wielder learns the exact location of the closest lemon."]
        },
        {
            desc: "Cause Nausea",
            cost: 1,
            additionalNotes: ["Target must save or waste their turn vomiting."]
        },
    ],
} satisfies Record<
    Theme | string,
    Iterable<
        Omit<ChargedPower, 'desc'> & {desc: string | StringGenerator} | 
        Omit<UnlimitedChargedPower, 'desc'> & {desc: string | StringGenerator}
    >    
>;

export const POSSIBLE_PASSIVE_POWERS = {
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
        },
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
                pluralUnholyFoe,
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
} satisfies Record<
    Theme | string,
    Iterable<
        Omit<Language, 'desc'> & {desc: string | StringGenerator} | 
        Omit<MiscPower, 'desc'> & {desc: string | StringGenerator}
    >
>;

export const POSSIBLE_PERSONALITIES = {
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
} satisfies Record<Theme | string, Iterable<string>>;

export const POSSIBLE_RECHARGE_METHODS = {
    fire: [
        mkGen("regains all charges after being superheated"),
        mkGen("regains a charge at the end of each scene where its wielder started a fire"),
        mkGen("regains all charges when its wielder wins an argument"),
    ],
    ice: [
        mkGen("regains all charges after being cooled to sub-zero"),
        mkGen("regains a changes whenever its wielder builds a snowman"),
        mkGen("regains a charge at the end of each scene where its wielder made an ice pun")
    ],
    dark: [
        mkGen("regains a charge upon absorbing a human soul"),
        mkGen("regains a charge at the end of each scene where its wielder destroyed an object unnecessarily"),
        mkGen("regains all charges each day at the witching hour")
    ],
    light: [
        mkGen("regains all charges after an hour in a sacred space"),
        mkGen("regains a charges each day at sunrise"),
        new RecursiveGenerator([
            mkGen("regains a charge after defeating a "), 
            singularUnholyFoe,
        ])
    ],
    sweet: [
        mkGen("regains a charge each time it eats an extravagant dessert"),
        mkGen("regains all charges each time its wielder hosts a feast"),
        mkGen("regains charge whenever its wielder compliments someone")
    ],
    sour: [
        mkGen("regains all charges after an hour immersed in acid"),
        mkGen("regains all charges when used to fell a citrus tree"),
        mkGen("regains a charge each time its wielder insults someone")
    ],
    // electric: [
    //     "regains all charges when struck by lightning",
    // ]
} satisfies Record<Theme | string, Iterable<StringGenerator>>;

export const POSSIBLE_THEMES = [
    "fire", "ice",
    "dark", "light",
    "sweet", "sour",
    // "poison", "water"
    // "earth", "cloud",
    // "psychic", "electric"
    // "wizard", "thief"
    // "jungle",
    // "space"
    // 
] as const;
export type Theme = (typeof POSSIBLE_THEMES)[number];