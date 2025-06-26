import { singularUnholyFoe } from "../foes";
import {mkGen, type TGenerator, StringGenerator } from "../recursiveGenerator";
import type { ProviderElement } from "./provider";
import type { WeaponRarityConfig, PassivePower, ActivePower, Theme, WeaponPowerCond, WeaponRarity } from "./weaponGeneratorTypes";

function toProviderSource<T1, T2>(x: Record<string, T1[]>, map: (k: string, x: T1) =>  ProviderElement<T2,WeaponPowerCond>): ProviderElement<T2,WeaponPowerCond>[] {
    return Object.entries(x).map(([k,v]) => v.map(x => map(k,x))).flat();
}

export const weaponRarityConfig: WeaponRarityConfig = {
    common: {
        percentile: 1,
        paramsProvider: (rng) => ({
            damage: {},
            nPassive: 1,
            nCharges: 0,
            nActive: rng() > .9 ? 1 : 0,
            nUnlimitedActive: 0,
            sentienceChance: 0
        })
    },
    uncommon: {
        percentile: 0.45,
        paramsProvider: (rng) => ({
            damage: {},
            nPassive: 1,
            nCharges: Math.ceil(rng() * 4),
            nActive: [0,1].choice(rng),
            nUnlimitedActive: 0,
            sentienceChance: 0
        })
    },
    rare: {
        percentile: 0.15,
        paramsProvider: (rng) => ({
            damage: {},
            nPassive: [1,2].choice(rng),
            nCharges: Math.ceil(rng() * 4),
            nActive: [1,2].choice(rng),
            nUnlimitedActive: 0,
            sentienceChance: 0.25
        })
    },
    epic: {
        percentile: 0.05,
        paramsProvider: (rng) => ({
            damage: {},
            nPassive: [1,2,3].choice(rng),
            nCharges: Math.ceil(rng() * 8),
            nActive: [1,2,3].choice(rng),
            nUnlimitedActive: 0,
            sentienceChance: 0.5
        })
    },
    legendary: {
        percentile: 0.01,
        paramsProvider: (rng) => ({
            damage: {},
            nPassive: 3,
            nCharges: Math.ceil(rng() * 10),
            nActive: [2,3,4].choice(rng),
            nUnlimitedActive: 1,
            sentienceChance: 1
        })
    }
}

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
    "chain whip",
    "pair of clawed gauntlets"
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
    "staff",
    "rapier",
].choice(rng));

const crummyWeaponShapeGenerator = mkGen((rng) => [
    "club",
    "rod"
].choice(rng));


/*
    an adjective that could describe a physical object
    the adjective should be simple and describe its physical state,
    no vibes/moral/metaphysical descriptors i.e. just, terrifying, gothic
*/
export const OBJECT_ADJECTIVES = {
    /**
     * can be chosen by any theme. not implemented. how does this affect the probs?
     */
    any: [
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
        "Shadow-Wreathed",
        "stygian",
        "abyssal",
        "spiked",
        "Blood-Stained",
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
    sour: ["corroded", "corrosive"],
    jungle: [
        'gold-banded',
        'silver-strapped',
        "spiked"
    ],
} satisfies Record<Theme | string, [string, ...string[]]>;

// The text of these should not contain any references to charges
// this is because we want to reuse them for unlimited charged abilities
export const POSSIBLE_ACTIVE_POWERS = toProviderSource({
    "fire": [
        {
            desc: "Fire Ball",
            cost: 3,
            rarity: {
                gte: 'rare'
            }
        },
        {
            desc: "Wall of Fire",
            cost: 4,
            rarity: {
                gte: 'rare'
            }
        },
        {
            desc: "Control Weather",
            cost: 2,
            additionalNotes: ["Must move conditions towards heatwave."],
            rarity: {
                lte: 'uncommon'
            }
        },
        {
            desc: "Control Flames",
            cost: 1,
            additionalNotes: ["Flames larger than wielder submit only after a save."],
            rarity: {
                lte: 'uncommon'
            }
        }
    ],
    "ice": [
        {
            desc: "Wall of Ice",
            cost: 2,
            rarity: {
                lte: 'uncommon'
            }
        },
        {
            desc: "Control Weather",
            cost: 3,
            additionalNotes: ["Must move conditions towards blizzard."],
            rarity: {
                lte: 'uncommon'
            }
        },
        {
            desc: "Chilling Strike",
            cost: 2,
            additionalNotes: ["Struck foes save or be frozen solid next turn."],
            rarity: {
                lte: 'uncommon'
            }
        }
    ],
    "dark": [
        {
            desc: "Commune With Demon",
            cost: 2,
            rarity: {
                lte: 'uncommon'
            }
        },
        {
            desc: "Turn Priests & Angels",
            cost: 1,
            rarity: {
                lte: 'uncommon'
            }
        },
        {
            desc: "Darkness",
            cost: 1,
            rarity: {
                lte: 'uncommon'
            }
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
} as Record<
    Theme | string,
    (ActivePower & WeaponPowerCond)[]
>, (k,x) => ({
    thing: mkGen(x),
    cond: {
        themes: { all: [k as Theme]},
        activePowers: { none: [x]},
        rarity: 'rarity' in x ? x.rarity : undefined
    }
}));

export const POSSIBLE_PASSIVE_POWERS = Array(100).map((_,i) => (i%2===0 ? { language: true as true, desc: 'Test 1'} : { language: true as true, desc: 'Test 2'})).map((x) => ({ 
    thing: mkGen(x), 
    cond: {
        passivePowers: { none: [x]}, 
        rarity: { gte: 'common' as WeaponRarity},
        isSentient: 'language' in x ? true : false, // languages should always require the weapon to be sentient
        languages: {
            none: [x.desc]
        }
    }}));
    
export const POSSIBLE_PERSONALITIES = toProviderSource({
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
} satisfies Record<Theme | string, string[]>, (k,x) => {
    const formatted = x.capFirst() + '.';
    return ({ thing: mkGen(formatted), cond: { themes: { all: [k as Theme]}, personality: { none: [formatted] } }})
});

export const POSSIBLE_RECHARGE_METHODS = toProviderSource({
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
        new StringGenerator([
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
} satisfies Record<Theme | string, Iterable<TGenerator<string>>>, (k,x) => ({ thing: x, cond: { themes: { all: [k as Theme]}}}));