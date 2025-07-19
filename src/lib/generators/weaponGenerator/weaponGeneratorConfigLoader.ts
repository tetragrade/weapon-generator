import seedrandom from "seedrandom";
import { pluralUnholyFoe, singularUnholyFoe, singularWildAnimal } from "../foes";
import { mkGen, StringGenerator, TGenerator } from "../recursiveGenerator";
import activePowers from './config/activePowers.json';
import objectAdjectives from './config/objectAdjectives.json';
import passivePowers from './config/passivePowers.json';
import shapes from './config/shapes.json';
import { GLOBAL_UUID_ISSUER, ProviderElement, WithUUID } from "./provider";
import { ActivePower, ChargedPower, MiscPower, PassivePower, Personality, RechargeMethod, Theme, WeaponPowerCond, WeaponRarity, WeaponRarityConfig, WeaponShape } from "./weaponGeneratorTypes";

function toProviderSource<T1, T2>(x: Record<string, T1[]>, map: (k: string, x: T1) => ProviderElement<T2, WeaponPowerCond>): ProviderElement<T2, WeaponPowerCond>[] {
    return Object.entries(x).map(([k, v]) => v.map(x => map(k, x))).flat();
}

export const defaultWeaponRarityConfigFactory = (): WeaponRarityConfig => ({
    common: {
        percentile: 1,
        paramsProvider: (rng) => ({
            damage: {},
            nPassive: 1,
            nCharges: 0,
            nActive: rng() > .9 ? 1 : 0,
            nUnlimitedActive: 0,
            sentienceChance: 0,
            chanceOfMakingDemands: ([10 as const, 12 as const]).choice(rng),
        })
    },
    uncommon: {
        percentile: 0.45,
        paramsProvider: (rng) => ({
            damage: {},
            nPassive: 1,
            nCharges: Math.ceil(rng() * 4),
            nActive: [0, 1].choice(rng),
            nUnlimitedActive: 0,
            sentienceChance: 0.1,
            chanceOfMakingDemands: ([8 as const, 10 as const]).choice(rng),
        })
    },
    rare: {
        percentile: 0.15,
        paramsProvider: (rng) => ({
            damage: {},
            nPassive: [1, 2].choice(rng),
            nCharges: Math.ceil(rng() * 4),
            nActive: [1, 2].choice(rng),
            nUnlimitedActive: 0,
            sentienceChance: 1 / 3,
            chanceOfMakingDemands: ([8 as const, 10 as const]).choice(rng),
        })
    },
    epic: {
        percentile: 0.05,
        paramsProvider: (rng) => ({
            damage: {},
            nPassive: [1, 2, 3].choice(rng),
            nCharges: Math.ceil(rng() * 8),
            nActive: [1, 2, 3].choice(rng),
            nUnlimitedActive: 0,
            sentienceChance: 1 / 2,
            chanceOfMakingDemands: ([6 as const, 8 as const, 10 as const]).choice(rng),
        })
    },
    legendary: {
        percentile: 0.01,
        paramsProvider: (rng) => ({
            damage: {},
            nPassive: 3,
            nCharges: Math.ceil(rng() * 10),
            nActive: [2, 3, 4].choice(rng),
            nUnlimitedActive: 1,
            sentienceChance: 1,
            chanceOfMakingDemands: ([4 as const, 6 as const, 8 as const]).choice(rng),
        })
    }
});

/*
    an adjective that could describe a physical object
    the adjective should be simple and describe its physical state,
    no vibes/moral/metaphysical descriptors i.e. just, terrifying, gothic
*/
export const POSSIBLE_OBJECT_ADJECTIVES = toProviderSource(
    objectAdjectives as Record<Theme | string, (string | { name: string } & Omit<WeaponPowerCond, 'unique'>)[]>,
    (k, x) => {
        switch (typeof x) {
            case 'string':
                return ({
                    thing: mkGen(x),
                    cond: {
                        themes: k === 'any' ? undefined : { all: [k as Theme] },
                        unique: true
                    }
                })
            case 'object':
                {
                    const y = x as { name: string } & WeaponPowerCond;
                    if (y !== null) {
                        return ({
                            thing: mkGen(x.name),
                            cond: {
                                themes: y?.themes ?? (k === 'any' ? undefined : { all: [k as Theme] }),
                                activePowers: y?.activePowers,
                                rarity: y?.rarity,
                                shapeFamily: y?.shapeFamily,
                                unique: true
                            }
                        })
                    }
                }
        }
        throw new Error('invalid shape config');
    }
).map(x => GLOBAL_UUID_ISSUER.Issue(x)) satisfies ProviderElement<string | TGenerator<string>, WeaponPowerCond>[];

// The text of these should not contain any references to charges
// this is because we want to reuse them for unlimited charged abilities
const mixinActivePowers = ([
    {
        thing: {
            desc: mkGen("Animal Transformation"),
            cost: 2,
            additionalNotes: [
                new StringGenerator([
                    mkGen("The weapon transforms into "),
                    singularWildAnimal,
                    mkGen(" until the end of the scene.")
                ]),
                "You can command it to turn back into its regular form early."
            ]
        },
        cond: {
            themes: {
                any: ['nature'],
            },
            unique: true
        }
    },
] satisfies ProviderElement<ChargedPower, WeaponPowerCond>[] as ProviderElement<ChargedPower, WeaponPowerCond>[]);
export const POSSIBLE_ACTIVE_POWERS = [...mixinActivePowers, ...toProviderSource(activePowers as Record<
    Theme | string,
    (ActivePower & Omit<WeaponPowerCond, 'unique'>)[]
>, (k, x) => ({
    thing: x,
    cond: {
        unique: true,
        themes: { all: [k as Theme] },
        activePowers: { none: [x] },

        rarity: x?.rarity,
        shapeFamily: x?.shapeFamily,
    }
}))].map(x => GLOBAL_UUID_ISSUER.Issue(x)) satisfies ProviderElement<ActivePower, WeaponPowerCond>[];


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
    },
    {
        thing: {
            "miscPower": true,
            "desc": "Cute animals follow the wielder's polite requests i.e. cats and forest birds."
        },
        cond: {
            unique: true,
            themes: {
                any: ["nature", "sweet"]
            }
        }
    },
    {
        thing:
        {
            miscPower: true,
            desc: "Weapon can telepathically control bees within 100-ft. They can only understand simple commands."
        },
        cond: {
            unique: true,
            themes: {
                any: ["nature", "sweet"]
            }
        }
    },
    {
        thing:
        {
            miscPower: true,
            "desc": new StringGenerator(["Can reflect and focus ", mkGen((rng) => ['sun', 'moon'].choice(rng)), "light as a damaging beam (2d6 damage)."])
        },
        cond: {
            unique: true,
            themes: { any: ['light'] }
        }
    }
] satisfies ProviderElement<(MiscPower), WeaponPowerCond>[] as ProviderElement<(MiscPower), WeaponPowerCond>[]);

export const POSSIBLE_PASSIVE_POWERS = [...mixinPassivePowers, ...toProviderSource(passivePowers as Record<
    Theme | string,
    (PassivePower & Omit<WeaponPowerCond, 'unique'>)[]
>, (k, x) => {
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
            themes: k === 'any' ? undefined as never : { all: [k as Theme] },
            isSentient: 'language' in x ? true : x?.isSentient, // languages should always require the weapon to be sentient
            languages: x?.languages,
            rarity: x?.rarity,
            shapeFamily: x?.shapeFamily,
            passivePowers: x?.passivePowers,
            unique: true
        }
    }
})].map(x => GLOBAL_UUID_ISSUER.Issue(x)) satisfies WithUUID<ProviderElement<PassivePower, WeaponPowerCond>>[];

const mixinPersonalities = [
    {
        thing: {
            desc: "Vengeful."
        },
        cond: {
            themes: {
                any: ["fire", "ice", "dark", "sweet"]
            },
            unique: true,
        }
    },
    {
        thing: {
            desc: "Cruel."
        },
        cond: {
            themes: {
                any: ["sour", "dark"]
            },
            unique: true,
        }
    },
    {
        thing: {
            desc: "Curious."
        },
        cond: {
            themes: {
                any: ["wizard", "steampunk", "cloud"]
            },
            unique: true,
        }
    },
    {
        thing: {
            desc: "Know-it-All."
        },
        cond: {
            themes: {
                any: ["wizard", "steampunk"]
            },
            unique: true,
        }
    },
    {
        thing: {
            desc: "Traditionalist."
        },
        cond: {
            themes: {
                any: ["wizard", "nature", "ice"]
            },
            unique: true,
        }
    },
] satisfies ProviderElement<Personality, WeaponPowerCond>[];
export const POSSIBLE_PERSONALITIES = [...mixinPersonalities, ...toProviderSource({
    // this will break if there are duplicates
    "fire": [
        "compassionate",
        "irritable",
        "flirty",
        "standoffish",
        "zealous",
        "wrathful",
        "kind",
        "honest",
    ],
    "ice": [
        "cold",
        "formal",
        "haughty",
        "idealistic",
        "pitiless",
        "reserved",
        "serious",
        "stubborn",
    ],
    "cloud": [
        "easy-going",
        "acquiescent",
    ],
    "sweet": [
        "kind",
        "excitable",
        "manic",
        "neurotic",
    ],
    "sour": [
        "antagonistic",
        "pitiless",
        "manic",
        "sassy"
    ],
    "dark": [
        "shy",
        "tries to act mysterious",
        "quiet",
        "depressive",
        "angry",
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
        "overconfident"
    ],
    "steampunk": [
        "open-minded",
        "impatient"
    ],
    "nature": [
        "hard-working",
        "gullible",
        "patient"
    ]
} satisfies Record<Theme, [string, ...string[]]>, (k, x) => {
    const formatted = x.capFirst() + '.';
    return ({
        thing: {
            desc: mkGen(formatted)
        },
        cond: {
            themes: { all: [k as Theme] },
            unique: true
        }
    })
})].map(x => GLOBAL_UUID_ISSUER.Issue(x)) satisfies WithUUID<ProviderElement<Personality, WeaponPowerCond>>[];

const mixinRechargeMethods = [
    {
        thing: {
            desc: mkGen("all charges at noon on the winter solstice")
        },
        cond: {
            unique: true,
            themes: {
                any: ["ice", "nature"]
            }
        }
    },
    {
        thing: {
            desc: mkGen("all charges at noon on the summer solstice")
        },
        cond: {
            unique: true,
            themes: {
                any: ["fire", "nature"]
            }
        }
    }
] satisfies ProviderElement<RechargeMethod, WeaponPowerCond>[];

export const POSSIBLE_RECHARGE_METHODS = [...mixinRechargeMethods, ...toProviderSource({
    fire: [
        mkGen("all charges after being superheated"),
    ],
    ice: [
        mkGen("all charges after being cooled to sub-zero"),
        mkGen("one charge whenever its wielder builds a snowman"),
        mkGen("one charge at the end of each scene where its wielder made an ice pun")
    ],
    dark: [
        mkGen("one charge upon absorbing a human soul"),
        mkGen("one charge at the end of each scene where its wielder destroyed an object unnecessarily"),
        mkGen("all charges each day at the witching hour"),
        mkGen("one charge when its wielder defenestrates a priest, or all charges if it was a high ranking priest")
    ],
    light: [
        mkGen("all charges after an hour in a sacred space"),
        mkGen("all charges each day at sunrise"),
        new StringGenerator([
            mkGen("one charge after defeating "),
            singularUnholyFoe,
        ])
    ],
    sweet: [
        mkGen("one charge each time it eats an extravagant dessert"),
        mkGen("all charges each time its wielder hosts a feast"),
        mkGen("one charge whenever its wielder compliments someone")
    ],
    sour: [
        mkGen("all charges after an hour immersed in acid"),
        mkGen("all charges when used to fell a citrus tree"),
        mkGen("one charge each time its wielder insults someone")
    ],
    cloud: [
        mkGen("all charges when struck by lightning"),
        mkGen('all charges when its wielder survives a significant fall'),
        mkGen('one charge when you kill a winged creature, or all charges if it was also a powerful foe'),
    ],
    wizard: [
        mkGen('one charge when you cast one of your own spells'),
        mkGen('all charges when its wielder learns a new spell'),
        mkGen('all charges when its wielder wins a wizard duel'),
        mkGen('one charge when its wielder finishes reading a new book'),
        mkGen('all charges when its wielder views the night sky'),
    ],
    steampunk: [
        mkGen('all charges when its wielder invents something'),
        mkGen('all charges when its wielder throws a tea party'),
        mkGen("one charge when its wielder breaks news"),
    ],
    earth: [
        mkGen('one charge when its wielder throws a rock at something important'),
        mkGen('all charges when its wielder meditates atop a mountain'),
        mkGen('all charges when driven into the ground while something important is happening')
    ],
    nature: [
        mkGen("all charges")
    ]
} satisfies Record<
    Theme | string,
    [TGenerator<string>, ...(TGenerator<string>[]) // we need at least one method or it'll crash.
    ]>, (k, x) => ({
        thing: {
            desc: x
        },
        cond: {
            themes: { all: [k as Theme] },
            unique: true,
        },
    }))].map(x => GLOBAL_UUID_ISSUER.Issue(x)) satisfies ProviderElement<RechargeMethod, WeaponPowerCond>[];

export const POSSIBLE_SHAPES = toProviderSource<unknown, TGenerator<WeaponShape>>(
    shapes as Record<string, (string | ({ name: string } & Omit<WeaponPowerCond, 'unique'>))[]>,
    (k, x) => {
        switch (typeof x) {
            case 'string':
                return ({
                    thing: mkGen({ particular: x, group: k as WeaponShape['group'] }),
                    cond: {
                        unique: true,
                    }
                })
            case 'object':
                {
                    const y = x as { name: string } & WeaponPowerCond;
                    if (y !== null) {
                        return ({
                            thing: mkGen({ particular: y.name, group: k as WeaponShape['group'] }),
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