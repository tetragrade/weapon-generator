import { pluralUnholyFoe, singularWildAnimal, singularUnholyFoe } from "../foes";
import {mkGen, type TGenerator, StringGenerator } from "../recursiveGenerator";
import { GLOBAL_UUID_ISSUER, type ProviderElement } from "./provider";
import type { WeaponRarityConfig, PassivePower, ActivePower, Theme, WeaponPowerCond, WeaponShape, WeaponRarity, MiscPower, ChargedPower } from "./weaponGeneratorTypes";
import objectAdjectives from './config/objectAdjectives.json';
import activePowers from './config/activePowers.json';
import passivePowers from './config/passivePowers.json';
import shapes from './config/shapes.json';
import type seedrandom from "seedrandom";

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
            sentienceChance: 0.1
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
            sentienceChance: 1/3
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
            sentienceChance: 1/2
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
/*
    an adjective that could describe a physical object
    the adjective should be simple and describe its physical state,
    no vibes/moral/metaphysical descriptors i.e. just, terrifying, gothic
*/
export const POSSIBLE_OBJECT_ADJECTIVES = toProviderSource(
    objectAdjectives as Record<Theme | string, (string | {name: string} & Omit<WeaponPowerCond, 'unique'>)[]>,
    (k,x) => {
        switch(typeof x) {
            case 'string':
                return ({
                    thing: mkGen(x), 
                    cond: {
                        themes: k ==='any' ? undefined : { all: [k as Theme]},
                        unique: true
                    }
                })
            case 'object':
                const y = x as {name: string} & WeaponPowerCond;
                if(y !== null) {
                    return({
                    thing: mkGen(x.name), 
                    cond: {
                        themes: y?.themes ?? (k ==='any' ? undefined : { all: [k as Theme]}),
                        activePowers: y?.activePowers,
                        rarity: y?.rarity,
                        shapeFamily: y?.shapeFamily,
                        unique: true
                    }
                })
                }
        }
        throw new Error('invalid shape config');
    }    
).map(x => GLOBAL_UUID_ISSUER.Issue(x));

// The text of these should not contain any references to charges
// this is because we want to reuse them for unlimited charged abilities
const mixinActivePowers = ([
    {
        thing: {
            desc: mkGen("Animal Transformation"),
            cost: 1,
            additionalNotes: [
                 new StringGenerator([
                    mkGen("The weapon transforms into"),
                    singularWildAnimal,
                    mkGen("until the end of the scene. You can command it to turn back into its regular form.")
                ]),
            ]
        },
        cond: {
            themes: {
                any: ['nature'],
            },
            unique: true
        }
    }
] satisfies ProviderElement<ChargedPower, WeaponPowerCond>[] as ProviderElement<ChargedPower, WeaponPowerCond>[]);
export const POSSIBLE_ACTIVE_POWERS = [...mixinActivePowers, ...toProviderSource(activePowers as Record<
    Theme | string,
    (ActivePower & Omit<WeaponPowerCond,'unique'>)[]
>, (k,x) => ({
    thing: x,
    cond: {
        unique: true,
        themes: { all: [k as Theme]},
        activePowers: { none: [x]},

        rarity: x?.rarity,
        shapeFamily: x?.shapeFamily,
    }
}))].map(x => GLOBAL_UUID_ISSUER.Issue(x));


// this isn't going to work, as the value of the generator can't be known at cond execution time, needs rethought.
const mixinPassivePowers = ([
    {
        thing: {
            miscPower: true,
            desc: new StringGenerator([
                mkGen("Glows like a torch when "), 
                pluralUnholyFoe,
                mkGen(" are near")
            ])
        },
        cond: {
            themes: {
                any: ['light'],
            },
            unique: true
        }
    }
] satisfies ProviderElement<(MiscPower), WeaponPowerCond>[] as ProviderElement<(MiscPower), WeaponPowerCond>[]);

export const POSSIBLE_PASSIVE_POWERS = [...mixinPassivePowers, ...toProviderSource(passivePowers as Record<
    Theme | string,
    (PassivePower & Omit<WeaponPowerCond, 'unique'>)[]
>, (k,x) => {
    const thing = ('miscPower' in x ? {
        miscPower: true,
        desc: typeof x.desc === 'string' ? mkGen(x.desc) : x.desc,
        bonus: x.bonus,
    } : {
        language: true,
        desc: x.desc
    }) satisfies PassivePower;
    return {
    thing: thing,
    cond: {
        themes: k==='any' ? undefined as never : { all: [k as Theme]},
        isSentient: 'language' in x ? true : x?.isSentient, // languages should always require the weapon to be sentient
        languages: x?.languages,
        rarity: x?.rarity,
        shapeFamily: x?.shapeFamily,
        passivePowers: x?.passivePowers,
        unique: true
    }}
})].map(x => GLOBAL_UUID_ISSUER.Issue(x));

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
    ],
    "wizard": [
        "curious",
        "traditionalist",
        "know-it-all",
        "overconfident"
    ],
    "steampunk": [
        "curious",
        "open-minded",
        "know-it-all",
        "impatient"
    ],
    "nature": [
        "traditionalist",
        "hard-working",
        "gullible",
        "patient"
    ]
} satisfies Record<Theme, [string, ...string[]]>, (k,x) => {
    const formatted = x.capFirst() + '.';
    return ({ thing: mkGen(formatted), cond: { themes: { all: [k as Theme]}, unique: true }})
}).map(x => GLOBAL_UUID_ISSUER.Issue(x));

const mixinRechargeMethods = [
    {
        thing: mkGen("regains all charges at noon on the winter solstice"),
        cond: {
            unique: true,
            themes: {
                any: ["ice", "nature"]
            }
        }
    },
    {
        thing: mkGen("regains all charges at noon on the summer solstice"),
        cond: {
            unique: true,
            themes: {
                any: ["fire", "nature"]
            }
        }
    }
] satisfies ProviderElement<TGenerator<string>, WeaponPowerCond>[];

export const POSSIBLE_RECHARGE_METHODS = [ ...mixinRechargeMethods, ...toProviderSource({
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
        mkGen("regains all charges each day at the witching hour"),
        mkGen("regains a charge when its wielder defenestrates a priest, or all charges if it was a high ranking priest")
    ],
    light: [
        mkGen("regains all charges after an hour in a sacred space"),
        mkGen("regains all charges each day at sunrise"),
        new StringGenerator([
            mkGen("regains a charge after defeating "), 
            singularUnholyFoe,
        ])
    ],
    sweet: [
        mkGen("regains a charge each time it eats an extravagant dessert"),
        mkGen("regains all charges each time its wielder hosts a feast"),
        mkGen("regains a charge whenever its wielder compliments someone")
    ],
    sour: [
        mkGen("regains all charges after an hour immersed in acid"),
        mkGen("regains all charges when used to fell a citrus tree"),
        mkGen("regains a charge each time its wielder insults someone")
    ],
    cloud: [
        mkGen("regains all charges when struck by lightning"),
        mkGen('regains all charges when its wielder survives a significant fall'),
        mkGen('regains a charge when you kill a winged creature, or all charges if it was also a powerful foe'),
    ],
    wizard: [
        mkGen('regains a charge when you cast one of your own spells'),
        mkGen('regains all charges when its wielder learns a new spell'),
        mkGen('regains all charges when its wielder wins a wizard duel'),
        mkGen('regains a charge when its wielder finishes reading a new book'),
    ],
    steampunk: [
        mkGen('regains all charges when its wielder invents something'),
        mkGen('regains all charges when its wielder throws a tea party'),
        mkGen("regains a charge when its wielder breaks news"),
    ],
    earth: [
        mkGen('regains a charge when its wielder throws a rock at something important'),
        mkGen('regains all charges when its wielder meditates atop a mountain'),
        mkGen('regains all charges when driven into the ground while something important is happening')
    ],
    nature: [
        mkGen("regains all charges")
    ]
} satisfies Record<
    Theme | string, 
    [TGenerator<string>, ...(TGenerator<string>[]) // we need at least one method or it'll crash.
]>, (k,x) => ({ 
    thing: x, 
    cond: { 
        themes: { all: [k as Theme]},
        unique: true,
    },
}))].map(x => GLOBAL_UUID_ISSUER.Issue(x));

export const POSSIBLE_SHAPES = toProviderSource<unknown,TGenerator<WeaponShape>>(
    shapes as Record<string, (string | ({name: string} & Omit<WeaponPowerCond, 'unique'>))[]>,
    (k,x) => {
        switch(typeof x) {
            case 'string':
                return ({
                    thing: mkGen({ particular: x, group: k as WeaponShape['group']}), 
                    cond: {
                        unique: true,
                    }
                })
            case 'object':
                const y = x as {name: string} & WeaponPowerCond;
                if(y !== null) {
                    return({
                    thing: mkGen({ particular: y.name, group: k as WeaponShape['group']}), 
                    cond: {
                        themes: y?.themes,
                        activePowers: y?.activePowers,
                        rarity: y?.rarity,
                        shapeFamily: y?.shapeFamily,
                        unique: true,
                    }
                })
                }
        }
        throw new Error('invalid shape config');
    }
).map(x => GLOBAL_UUID_ISSUER.Issue(x));

export const WEAPON_TO_HIT: Record<WeaponRarity, TGenerator<number>> = {
    common: mkGen((rng: seedrandom.PRNG) => {
        return (
            rng() > .75 ? 
                1 
            : 
                0
        );
    }),
    uncommon: mkGen((rng: seedrandom.PRNG) => {
        const n = rng();
        return (
            n > .75 ?
                2
            : n > .25 ?
                1
            : 
                0
        );
    }),
    rare: mkGen((rng: seedrandom.PRNG) => {
        const n = rng();
        return (
            n > .75 ?
                4
            : n > .25 ?
                3
            : 
                2
        );
    }),
    epic: mkGen((rng: seedrandom.PRNG) => {
        const n = rng();
        return (
            n > .5 ?
                4
            : n > .5 ?
                3
            : 
                2
        );
    }),
    legendary: mkGen((rng: seedrandom.PRNG) => {
        const n = rng();
        return (
            n > .75 ?
                5
            : n > .25 ?
                4
            : 
                3
        );
    })
};