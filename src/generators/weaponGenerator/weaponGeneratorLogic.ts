import { mundaneNameGenerator } from "../nameGenerator.ts";
import { mkGen, RecursiveGenerator } from "../recursiveGenerator.ts";
import '../../string.ts';
import seedrandom from "seedrandom";
import { type Theme, weaponShapeGenerator, POSSIBLE_THEMES, POSSIBLE_ACTIVE_POWERS, POSSIBLE_PASSIVE_POWERS, POSSIBLE_RECHARGE_METHODS, POSSIBLE_PERSONALITIES, OBJECT_ADJECTIVES } from "./weaponGeneratorConfig.ts";
import type { Weapon, DamageDice } from "./weaponGeneratorTypes.ts";

const generateObjectAdjective = (themes: Theme[], rng: seedrandom.PRNG) => 
    themes.map(x => OBJECT_ADJECTIVES[x])
    .choice(rng)   //choose a category
    .choice(rng);  //choose an adjective

const mkNonSentientNameGenerator = (themes: Theme[], rng: seedrandom.PRNG) => mkGen(() => {
    const string = new RecursiveGenerator([
        mkGen(() => rng()>.9 ? mundaneNameGenerator.generate(rng) + ', the ' : ''),
        [mkGen(generateObjectAdjective(themes, rng)), weaponMaterialGenerator].choice(rng),
        mkGen(' '),
        weaponShapeGenerator
    ]).generate(rng);
    return string.split(/\s/).map(x => x.capFirst()).join(' ');
});
const mkSentientNameGenerator = (themes: Theme[], rng: seedrandom.PRNG) => mkGen(() => {
    const string = new RecursiveGenerator([
        mundaneNameGenerator,
        mkGen(', the '),
        [mkGen(generateObjectAdjective(themes, rng)), weaponMaterialGenerator].choice(rng),
        mkGen(' '),
        weaponShapeGenerator
    ]).generate(rng);
    return string.split(/\s/).map(x => x.capFirst()).join(' ');
});
        

const exoticWeaponMaterialsGenerator = mkGen((rng) => [
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
].choice(rng));

const normalWeaponMaterialsGenerator = mkGen((rng) => [
    "tin",
    "copper",
    "bronze",
    "iron",
    "steel",
    "silver",
    "gold"
].choice(rng));

const crummyWeaponMaterialsGenerator = mkGen((rng) => [
    "oak",
    "pine",
    "granite",
    "marble",
    "alabaster",
    "sandstone",
    "flint",
    "quartz"
].choice(rng));

const weaponMaterialGenerator = mkGen((rng) => {
    const n = rng();
    if(n>.75) {
        return exoticWeaponMaterialsGenerator.generate(rng);
    }
    else if(n>.05) {
        return normalWeaponMaterialsGenerator.generate(rng);
    }
    else {
        return crummyWeaponMaterialsGenerator.generate(rng);
    }
});

export const WEAPON_GENERATOR: (rngSeed: string) => Weapon = (rngSeed) => {
    interface WeaponGenerationParams {
        damage: DamageDice;
        nPassivePowers: number;
        nChargesProvider: () => number;
        active: number;
        nUnlimitedChargedPowers: number;
        sentienceChance: number;
    }
    function mkUnusedFromPossible<T>(possible: Record<Theme, T[]>): Record<Theme,Set<T>> {  
        return Object.entries(possible).reduce((acc, [k,vs]) => {
            acc[k as Theme] = new Set<T>();
            vs.forEach(v => acc[k as Theme].add(v));
            return acc;
        }, {} as Record<Theme, Set<T>>);
    }
    function drawFrom<T>(keys: Theme[], from: Record<Theme,Set<T>>, rng: seedrandom.PRNG): T {
        // choose a theme that still has powers left
        const chosenTheme = keys.filter(x => from[x].size>0).choice(rng);
        // choose a power for that theme
        const chosenT  = from[chosenTheme].choice(rng);
        from[chosenTheme].delete(chosenT);
        return chosenT;
    }
    const paramsFor: (gpValue: number) => WeaponGenerationParams = (gpValue) => {
        if(gpValue < 500) {
            return {
                damage: { d6: 1 }, nPassivePowers: 0, nChargesProvider: () => Math.ceil(rng() * 4), active: 1, nUnlimitedChargedPowers: 0, sentienceChance: 0.1
            }
        }
        else if (gpValue < 750) {
            return {
                damage: { d6: 1 },  nPassivePowers: 1, nChargesProvider: () => Math.ceil(rng() * 6), active: 1, nUnlimitedChargedPowers: 0, sentienceChance: 0.5
            }
        }
        else if (gpValue < 950) {
            return {
                damage: { d6: 1 }, nPassivePowers: 1, nChargesProvider: () => Math.ceil(rng() * 8), active: 2, nUnlimitedChargedPowers: 0, sentienceChance: 0.1
            }
        }
        else if(gpValue < 1000) {
            return {
                damage: { d6: 1 }, nPassivePowers: 1, nChargesProvider: () => Math.ceil(rng() * 10), active: 3, nUnlimitedChargedPowers: 0, sentienceChance: 1
            }
        }
        else {
            return {
                damage: { d6: 1 }, nPassivePowers: 1, nChargesProvider: () => Math.ceil(rng() * 12), active: 2, nUnlimitedChargedPowers: 1, sentienceChance: 1
            }
        }
    };

    const rng = seedrandom(rngSeed);
    const gpValue = rng();
    const unusedThemes = new Set<Theme>(POSSIBLE_THEMES);
    
    // copy over all the powers to the structure we'll draw from
    const unusedActivePowers = mkUnusedFromPossible(POSSIBLE_ACTIVE_POWERS);
    const unusedPassivePowers = mkUnusedFromPossible(POSSIBLE_PASSIVE_POWERS);
    const unusedRechargeMethods = mkUnusedFromPossible(POSSIBLE_RECHARGE_METHODS);
    
    // decide power level
    const params = paramsFor(gpValue);
    
    // draw themes until we have enough to cover our number of powers
    const themes = [] as Theme[];
    while(
        themes.length <= 0 ||
        themes.reduce((acc,x) => acc+unusedPassivePowers[x].size, 0) < params.nPassivePowers || //not enough passive powers
        themes.reduce((acc,x) => acc+unusedActivePowers[x].size, 0) < (params.nPassivePowers + params.nUnlimitedChargedPowers) //not enough active powers 
    ) {
        const chosen = unusedThemes.choice(rng);
        unusedThemes.delete(chosen);
        themes.push(chosen);
    }
    
    // determine sentience
    const isSentient = rng() < params.sentienceChance;
    
    // determine name
    const name = (isSentient ? mkSentientNameGenerator(themes, rng) : mkNonSentientNameGenerator(themes, rng)).generate(rng);
    
    // determine description

    // determine personality
    const weapon: Weapon = isSentient ? {
        id: rngSeed,
        themes,
        name,
        damage: params.damage,
        active: {
            maxCharges: params.nChargesProvider(),
            rechargeMethod: drawFrom(themes, unusedRechargeMethods, rng).generate(rng),
            powers: []
        },
        passivePowers: [],
        isSentient: true,
        personalityTraits: [],
        languages: ['Common']
    } : {
        id: rngSeed,
        themes,
        name,
        damage: params.damage,
        active: {
            maxCharges: params.nChargesProvider(),
            rechargeMethod: drawFrom(themes, unusedRechargeMethods, rng).generate(rng),
            powers: []
        },
        passivePowers: [],
        isSentient: false
    };

    if(weapon.isSentient) {
        // copy over all the charged powers
        const unusedPersonalities = mkUnusedFromPossible(POSSIBLE_PERSONALITIES)

        // choose one personality for each theme
        themes.forEach(theme => {
            const chosen  = unusedPersonalities[theme].choice(rng);
            if(chosen !== undefined) {
                unusedThemes.delete(theme);
                weapon.personalityTraits.push(chosen.capFirst() + '.');
            }
        })
    }

    while(params.nPassivePowers-->0) {
        const x = drawFrom(themes, unusedPassivePowers, rng);
        weapon.passivePowers.push({
            ...x,
            desc: typeof(x.desc) === 'string' ? x.desc : x.desc.generate(rng)
        });
    }

    while(params.active-->0) {
        const x = drawFrom(themes, unusedActivePowers, rng);
        weapon.active.powers.push({
            ...x,
            desc: typeof(x.desc) === 'string' ? x.desc : x.desc.generate(rng)
        });
    }

    while(params.nUnlimitedChargedPowers-->0) {
        const x = drawFrom(themes, unusedActivePowers, rng);
        weapon.active.powers.push({
            ...x,
            cost: 'at will',
            desc: typeof(x.desc) === 'string' ? x.desc : x.desc.generate(rng)
        });
    }
    
    return weapon;
}
