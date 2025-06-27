import { singularUnholyFoe } from "../foes";
import {mkGen, type TGenerator, StringGenerator } from "../recursiveGenerator";
import type { ProviderElement } from "./provider";
import type { WeaponRarityConfig, PassivePower, ActivePower, Theme, WeaponPowerCond } from "./weaponGeneratorTypes";
import objectAdjectives from './config/objectAdjectives.json';
import activePowers from './config/activePowers.json';
import passivePowers from './config/passivePowers.json';

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
export const OBJECT_ADJECTIVES = objectAdjectives satisfies Record<Theme | string, string[]>;

// The text of these should not contain any references to charges
// this is because we want to reuse them for unlimited charged abilities
export const POSSIBLE_ACTIVE_POWERS = toProviderSource(activePowers as Record<
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


// this isn't going to work, as the value of the generator can't be known at cond execution time, needs rethought.
// desc: new StringGenerator([
//     mkGen("Glows like a torch when "), 
//     pluralUnholyFoe,
//     mkGen(" are near")
// ]),
export const POSSIBLE_PASSIVE_POWERS = toProviderSource(passivePowers as Record<
    Theme | string,
    (PassivePower & WeaponPowerCond)[]
>, (k,x) => ({ 
    thing: mkGen(x), 
    cond: {
        themes: { all: [k as Theme]}, 
        passivePowers: { none: [x]}, 
        rarity: x?.rarity,
        isSentient: 'language' in x ? true : x.isSentient, // languages should always require the weapon to be sentient
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
    "cloud": [
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
    cloud: [
        mkGen("regains all charges when struck by lightning"),
        mkGen('regains all charges when you survive a significant fall'),
        mkGen('regains a charge when you kill a winged creature, or all charges if it was also a powerful foe'),
    ],
    wizard: [
        mkGen('regains a charge when you cast one of your own spells'),
        mkGen('regains all charges when you learn a new spell'),
        mkGen('regains all charges when you win a wizard duel'),
        mkGen('regains a charges when you finish reading a new book'),
    ],
    steampunk: [
        mkGen('regains all charges when you invent something'),
        mkGen('regains all charge when you throw a tea party'),
        mkGen("regains a charge when you fulfil someone's desire to know the time"),
    ],
    earth: [
        mkGen('regains a charge when you throw a rock at something important'),
        mkGen('regains all charge when you meditate atop a mountain'),
        mkGen('regains all charges when driven into the ground while something important is happening')
    ]
} satisfies Record<Theme | string, Iterable<TGenerator<string>>>, (k,x) => ({ thing: x, cond: { themes: { all: [k as Theme]}}}));