import { pluralUnholyFoe, singularUnholyFoe } from "../foes";
import {mkGen, type TGenerator, StringGenerator } from "../recursiveGenerator";
import type { ProviderElement } from "./provider";
import type { WeaponRarityConfig, PassivePower, ActivePower, Theme, WeaponPowerCond, WeaponShape, WeaponRarity, Language, MiscPower } from "./weaponGeneratorTypes";
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
export const POSSIBLE_OBJECT_ADJECTIVES = toProviderSource<(string | {name: string} & WeaponPowerCond), TGenerator<string>>(
    objectAdjectives as Record<Theme | string, (string | {name: string} & WeaponPowerCond)[]>,
    (k,x) => {
        switch(typeof x) {
            case 'string':
                return ({
                    thing: mkGen(x), 
                    cond: {
                        themes: k ==='any' ? undefined : { all: [k as Theme]}
                    }
                })
            case 'object':
                const y = x as {name: string} & WeaponPowerCond;
                if(y !== null) {
                    return({
                    thing: mkGen(x.name), 
                    cond: {
                        themes: y?.themes ??  (k ==='any' ? undefined : { all: [k as Theme]}),
                        activePowers: y?.activePowers,
                        rarity: y?.rarity,
                        shapeFamily: y?.shapeFamily
                    }
                })
                }
        }
        throw new Error('invalid shape config');
    }    
);

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

        rarity: x?.rarity,
        shapeFamily: x?.shapeFamily
    }
}));


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
                any: ['light']
            },
        }
    }
] satisfies ProviderElement<(MiscPower), WeaponPowerCond>[] as ProviderElement<(MiscPower), WeaponPowerCond>[]).map(x => {
    x.cond.passivePowers = { none: [x.thing] };
    return x;
});

export const POSSIBLE_PASSIVE_POWERS = [...mixinPassivePowers, ...toProviderSource(passivePowers as Record<
    Theme | string,
    (PassivePower & WeaponPowerCond)[]
>, (k,x) => ({
    thing: {
        miscPower: 'miscPower' in x ? true as true : undefined as never,
        language: 'miscPower' in x ? undefined as never : true as true,
        desc: typeof x.desc === 'string' ? mkGen(x.desc) : x.desc,
    } satisfies MiscPower | Language as MiscPower | Language,
    cond: {
        themes: k==='any' ? undefined as never : { all: [k as Theme]},
        passivePowers: 'miscPower' in x ? { none: [
            {
                miscPower: 'miscPower' in x ? true as true : undefined as never,
                language: 'miscPower' in x ? undefined as never : true as true,
                desc: typeof x.desc === 'string' ? mkGen(x.desc) : x.desc,
            } satisfies MiscPower | Language
        ]} : x?.passivePowers,
        isSentient: 'language' in x ? true : x?.isSentient, // languages should always require the weapon to be sentient
        languages: 
            'languages' in x 
                ? x.languages 
            : 'language' in x && x.desc!==null ? 
                {
                    none: [x.desc]
                } 
            : 
                undefined,
        rarity: x?.rarity,
        shapeFamily: x?.shapeFamily
    }}))];

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
        mkGen("regains all charges each day at sunrise"),
        new StringGenerator([
            mkGen("regains a charge after defeating a "), 
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
    ]
} satisfies Record<Theme | string, Iterable<TGenerator<string>>>, (k,x) => ({ thing: x, cond: { themes: { all: [k as Theme]}}}));

export const POSSIBLE_SHAPES = toProviderSource<unknown,TGenerator<WeaponShape>>(
    shapes as Record<string, (string | ({name: string} & WeaponPowerCond))[]>,
    (k,x) => {
        switch(typeof x) {
            case 'string':
                return ({
                    thing: mkGen({ particular: x, group: k as WeaponShape['group']}), 
                    cond: {}
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
                        shapeFamily: y?.shapeFamily
                    }
                })
                }
        }
        throw new Error('invalid shape config');
    }
);

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