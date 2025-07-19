import seedrandom from "seedrandom";
import { GLOBAL_UUID_ISSUER, ProviderElement, WithUUID } from "./weaponGenerator/provider";
import { WeaponFeatureProvider } from "./weaponGenerator/weaponGeneratorLogic";
import { Theme, Weapon, WeaponPowerCond } from "./weaponGenerator/weaponGeneratorTypes";
import { mkGen, StringGenerator, TGenerator } from "./recursiveGenerator";

interface Demand {
    desc: TGenerator<string>;
}

const demands = [
    {
        thing: {
            desc: mkGen("New Adornments (1 charge/100 GP spent).")
        },
        cond: {}
    },
    {
        thing: {
            desc: mkGen("Perform an Interesting Attack (d4 charges).")
        },
        cond: {} satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: new StringGenerator([
                "To be Polished With ",
                mkGen(rng => [
                    "a White Whale's Wax (all charges)",
                    "Giant Bees' Wax (d10 charges)",
                    'Clove Oil (d8 charges)',
                    "Frankincense Oil (d8 charges)",
                    "Myrrh Oil (d8 charges)",
                    'Oud Oil (d8 charges)',
                    'Sandalwood Oil (d6 charges)',
                    'Rose Oil (d6 charges)',
                    'Shellac Wax (d6 charges)',
                    'Palm Wax (d6 charges)',
                    'Oil (d4 charges)',
                    'Wax (d4 charges)'
                ].choice(rng)),
                '.'
            ])
        },
        cond: {} satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("New Reading Material (d4 charges).")
        },
        cond: {
            themes: {
                any: ["wizard", "steampunk"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Acquire New Spell (all charges).")
        },
        cond: {
            themes: {
                any: ["wizard"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Acquire New Technology (all charges).")
        },
        cond: {
            themes: {
                any: ["steampunk"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Acquire Rare Material (all charges).")
        },
        cond: {
            themes: {
                any: ["fire"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Destroy Specific Object (d4 charges).")
        },
        cond: {
            themes: {
                any: ["dark", "fire", "sour"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Immediately Start a Fire (d4 charges).")
        },
        cond: {
            themes: {
                any: ["fire"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Cool Down Current Location (d4 charges).")
        },
        cond: {
            themes: {
                any: ["ice"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Defeat Specific Foe (d6 charges).")
        },
        cond: {
            themes: {
                none: ["sweet"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Protect Specific NPC This Scene (d4 charges).")
        },
        cond: {
            themes: {
                any: ["light"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Incite Conflict With Specific NPC (d6 charges).")
        },
        cond: {
            themes: {
                any: ["dark"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Interact With Specific Dungeon Object (d6 charges).")
        },
        cond: {} satisfies WeaponPowerCond 
    },
    
    {
        thing: {
            desc: mkGen("Release Specific Animal From Captivity (d4 charges).")
        },
        cond: {
            themes: {
                any: ["nature"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Pet Specific Animal (charges based on danger).")
        },
        cond: {
            themes: {
                any: ["nature"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Hug Specific Tree (d4 charges).")
        },
        cond: {
            themes: {
                any: ["nature"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Plant Tree (d4 charges).")
        },
        cond: {
            themes: {
                any: ["nature"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },

    {
        thing: {
            desc: mkGen("Make Haste to Closest Temple (all charges).")
        },
        cond: {
            themes: {
                any: ["light"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Make Offering to God (all charges).")
        },
        cond: {
            themes: {
                any: ["light"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Insult Religion of Infidel (all charges).")
        },
        cond: {
            themes: {
                all: ["light", "fire"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Insult Religion of Infidel (all charges).")
        },
        cond: {
            themes: {
                all: ["light", "sour"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },

    {
        thing: {
            desc: mkGen("Food, Something Cold (d4 charges).")
        },
        cond: {
            themes: {
                any: ["ice", "sweet"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Food, Something Spicy (d4 charges).")
        },
        cond: {
            themes: {
                any: ["fire", "sweet"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Food, Something Sour (d4 charges).")
        },
        cond: {
            themes: {
                any: ["sour", "sweet"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Food, Something Sweet (d4 charges).")
        },
        cond: {
            themes: {
                any: ["sweet"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Food, Something Still Wriggling (d4 charges).")
        },
        cond: {
            themes: {
                any: ["dark"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        thing: {
            desc: mkGen("Beverage Worth At Least 100 GP (d4 charges).")
        },
        cond: {} satisfies WeaponPowerCond
    },
    {
        
        thing: {
            desc: mkGen("Dissolve Someone in Acid (1 charge per victim HD).")
        },
        cond: {
            themes: {
                all: ["sour", "dark"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        
        thing: {
            desc: mkGen("Burn Someone Alive (1 charge per victim HD).")
        },
        cond: {
            themes: {
                all: ["fire", "dark"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        
        thing: {
            desc: mkGen("Drown Someone (1 charge per victim HD).")
        },
        cond: {
            themes: {
                all: ["cloud", "dark"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        
        thing: {
            desc: mkGen("Drop Someone to Their Death (1 charge per victim HD).")
        },
        cond: {
            themes: {
                all: ["cloud", "dark"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    {
        
        thing: {
            desc: mkGen("Freeze Someone to Death (1 charge per victim HD).")
        },
        cond: {
            themes: {
                all: ["ice", "dark"] satisfies Theme[]
            }
        } satisfies WeaponPowerCond
    },
    // {
    //     thing: {
    //         desc: mkGen("TODO")
    //     },
    //     cond: {} satisfies WeaponPowerCond
    // }
].map(x => GLOBAL_UUID_ISSUER.Issue(x)) satisfies WithUUID<ProviderElement<Demand, WeaponPowerCond>>[];

const demandsProvider = new WeaponFeatureProvider<Demand>(demands);

export default function mkDemand(weapon: Weapon): string {
    const rng = seedrandom();
    return demandsProvider.draw(rng, weapon).desc.generate(rng);
}