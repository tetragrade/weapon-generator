import { mundaneNameGenerator } from "../nameGenerator.ts";
import { mkGen, RecursiveGenerator } from "../recursiveGenerator.ts";
import '../../string.ts';
import seedrandom from "seedrandom";
import { type Theme, weaponShapeGenerator, POSSIBLE_THEMES, POSSIBLE_ACTIVE_POWERS, POSSIBLE_PASSIVE_POWERS, POSSIBLE_RECHARGE_METHODS, POSSIBLE_PERSONALITIES, OBJECT_ADJECTIVES, weaponRarityConfig } from "./weaponGeneratorConfig.ts";
import { type Weapon, type WeaponRarity, isRarity } from "./weaponGeneratorTypes.ts";

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

    const generateRarity: (rng: seedrandom.PRNG) => WeaponRarity = (rng) => {
        const n = rng();
        // sort in ascending order of draw chance
        const xs = Object.entries(weaponRarityConfig).sort(([_,v1],[__,v2]) => v1.percentile - v2.percentile);
        for(const [k,v] of xs) {
            if(isRarity(k)) {
                if(n < v.percentile) {
                    return k;
                }
            }
        }
        throw new Error('failed to generate rarity');
    }

    const rng = seedrandom(rngSeed);
    const unusedThemes = new Set<Theme>(POSSIBLE_THEMES);
    
    // copy over all the powers to the structure we'll draw from
    const unusedActivePowers = mkUnusedFromPossible(POSSIBLE_ACTIVE_POWERS);
    const unusedPassivePowers = mkUnusedFromPossible(POSSIBLE_PASSIVE_POWERS);
    const unusedRechargeMethods = mkUnusedFromPossible(POSSIBLE_RECHARGE_METHODS);
    
    // decide power level
    const rarity = generateRarity(rng);
    const params = weaponRarityConfig[rarity].paramsProvider(rng);

    // TODO remove me
    params.damage = { d6: 1}
    
    // draw themes until we have enough to cover our number of powers
    const minThemes = [1,2,3].choice(rng);
    const themes = [] as Theme[];
    while(
        themes.length < minThemes ||
        themes.reduce((acc,x) => acc+unusedPassivePowers[x].size, 0) < params.nPassive || //not enough passive powers
        themes.reduce((acc,x) => acc+unusedActivePowers[x].size, 0) < (params.nPassive + params.nUnlimitedActive) //not enough active powers 
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
    const description = 'TODO';

    // determine personality
    const weapon: Weapon = isSentient ? {
        id: rngSeed,
        description,
        rarity,
        themes,
        name,
        damage: params.damage,
        active: {
            maxCharges: params.nCharges,
            rechargeMethod: drawFrom(themes, unusedRechargeMethods, rng).generate(rng),
            powers: []
        },
        passivePowers: [],
        isSentient: true,
        personalityTraits: [],
        languages: ['Common']
    } : {
        id: rngSeed,
        description,
        rarity,
        themes,
        name,
        damage: params.damage,
        active: {
            maxCharges: params.nCharges,
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

    while(params.nPassive-->0) {
        const x = drawFrom(themes, unusedPassivePowers, rng);
        weapon.passivePowers.push({
            ...x,
            desc: typeof(x.desc) === 'string' ? x.desc : x.desc.generate(rng)
        });
    }

    while(params.nActive-->0) {
        const x = drawFrom(themes, unusedActivePowers, rng);
        weapon.active.powers.push({
            ...x,
            desc: typeof(x.desc) === 'string' ? x.desc : x.desc.generate(rng)
        });
    }

    while(params.nUnlimitedActive-->0) {
        const x = drawFrom(themes, unusedActivePowers, rng);
        weapon.active.powers.push({
            ...x,
            cost: 'at will',
            desc: typeof(x.desc) === 'string' ? x.desc : x.desc.generate(rng)
        });
    }
    
    // set the weapon's max charges to be enough to cast its most expensive power, if it was previously lower
    weapon.active.maxCharges = 
        weapon.active.powers
        .filter(x => x.cost!='at will')
        .reduce((acc,x) => Math.max(x.cost, acc), weapon.active.maxCharges);
    
    return weapon;
}
