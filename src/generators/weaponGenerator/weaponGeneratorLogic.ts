import { mundaneNameGenerator } from "../nameGenerator.ts";
import { mkGen, StringGenerator, type TGenerator } from "../recursiveGenerator.ts";
import '../../string.ts';
import seedrandom from "seedrandom";
import { OBJECT_ADJECTIVES, weaponRarityConfig, POSSIBLE_PERSONALITIES, weaponShapeGenerator, POSSIBLE_RECHARGE_METHODS, POSSIBLE_ACTIVE_POWERS, POSSIBLE_PASSIVE_POWERS } from "./weaponGeneratorConfig.ts";
import { type Theme, type Weapon, type WeaponPowerCond, type WeaponPowerCondParams, type WeaponRarity, allThemes, isRarity } from "./weaponGeneratorTypes.ts";
import { ConditionalThingProvider, evComp, evQuant, type ProviderElement } from "./provider.ts";

const mockProvider = {
    draw: () => mkGen({
        capFirst:() => {},
        desc: 'mocked'
    }) as TGenerator<any>,
    available: () => ({ size: Infinity }) as Set<any>
} as unknown as ConditionalThingProvider<any, any, any>;

class WeaponFeatureProvider<T1> extends ConditionalThingProvider<TGenerator<T1>, WeaponPowerCond, WeaponPowerCondParams> {
    constructor(source: ProviderElement<TGenerator<T1>, WeaponPowerCond>[]) {
        super(source);
    }
    
    protected condExecutor(cond: WeaponPowerCond, params: WeaponPowerCondParams): boolean {
        const ord = (x: WeaponRarity) => ({
            common: 0,
            uncommon: 1,
            rare: 2,
            epic: 3,
            legendary: 4,
        }[x])

        return (
            (!cond.isSentient || params.isSentient) && // sentience OK
            (!cond.rarity || evComp(cond.rarity, params.rarity, ord)) && // rarity OK
            (!cond.themes || evQuant(cond.themes, params.themes)) && //themes OK
            (!cond.personalities || evQuant(cond.personalities, params.personalityTraits)) //no duplicates OK
        );
    }
}

const personalityProvider = new WeaponFeatureProvider(POSSIBLE_PERSONALITIES);
const rechargeMethodsProvider = new WeaponFeatureProvider(POSSIBLE_RECHARGE_METHODS);

const activePowersProvider = new WeaponFeatureProvider(POSSIBLE_ACTIVE_POWERS);
const passivePowersProvider = new WeaponFeatureProvider(POSSIBLE_PASSIVE_POWERS);

const generateObjectAdjective = (themes: Theme[], rng: seedrandom.PRNG) => 
    themes.map(x => OBJECT_ADJECTIVES[x])
    .choice(rng)   //choose a category
    .choice(rng);  //choose an adjective

const mkNonSentientNameGenerator = (themes: Theme[], rng: seedrandom.PRNG) => mkGen(() => {
    const string = new StringGenerator([
        mkGen(() => rng()>.9 ? mundaneNameGenerator.generate(rng) + ', the ' : ''),
        [mkGen(generateObjectAdjective(themes, rng)), weaponMaterialGenerator].choice(rng),
        mkGen(' '),
        weaponShapeGenerator
    ]).generate(rng);
    return string.split(/\s/).map(x => x.capFirst()).join(' ');
});
const mkSentientNameGenerator = (themes: Theme[], rng: seedrandom.PRNG) => mkGen(() => {
    const string = new StringGenerator([
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

export const mkWeapon: (rngSeed: string) => Weapon = (rngSeed) => {
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

    // decide power level
    const rarity = generateRarity(rng);
    const params = weaponRarityConfig[rarity].paramsProvider(rng);
    console.log(params);

    // TODO remove me
    params.damage = { d6: 1}
    
    // determine sentience
    const isSentient = rng() < params.sentienceChance;
    
    // draw themes until we have enough to cover our number of powers
    const unusedThemes = new Set<Theme>(allThemes); // this could be a provider but whatever go my Set<Theme>
    const minThemes = [1,2,3].choice(rng);
    const themes = [] as Theme[];
    while(
        themes.length < minThemes || 
        activePowersProvider.available({ themes, personalityTraits: [], rarity, isSentient }).size < params.nActive+params.nUnlimitedActive ||
        passivePowersProvider.available({ themes, personalityTraits: [], rarity, isSentient }).size < params.nPassive
    ) {
        const chosen = unusedThemes.choice(rng);
        unusedThemes.delete(chosen);
        themes.push(chosen);
    }
        
    // determine name
    const name = (isSentient ? mkSentientNameGenerator(themes, rng) : mkNonSentientNameGenerator(themes, rng)).generate(rng);
    
    // determine description
    const description = 'TODO';

    const personalityTraits: string[] = [];


    if(isSentient) {
        // choose one personality for each theme
        themes.forEach(_ => {
            const chosen = personalityProvider.draw(rng, { themes, personalityTraits, rarity, isSentient }).generate(rng);
            personalityTraits.push(chosen.capFirst() + '.');
        })
    }

    const finalConds: WeaponPowerCondParams = { themes, personalityTraits, rarity, isSentient };

    const rechargeMethod = rechargeMethodsProvider.draw(rng, finalConds).generate(rng);

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
            rechargeMethod,
            powers: []
        },
        passivePowers: [],
        isSentient: true,
        personalityTraits,
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
            rechargeMethod,
            powers: []
        },
        passivePowers: [],
        isSentient: false,
    };

    while(params.nPassive-->0) {
        weapon.passivePowers.push(passivePowersProvider.draw(rng,finalConds).generate(rng));
    }

    while(params.nActive-->0) {
        weapon.active.powers.push(activePowersProvider.draw(rng,finalConds).generate(rng));
    }

    while(params.nUnlimitedActive-->0) {
        const x = activePowersProvider.draw(rng,finalConds).generate(rng);
        weapon.active.powers.push({
            ...x,
            cost: 'at will',
        });
    }
    
    // set the weapon's max charges to be enough to cast its most expensive power, if it was previously lower
    weapon.active.maxCharges = 
        weapon.active.powers
        .filter(x => x.cost!='at will')
        .reduce((acc,x) => Math.max(x.cost, acc), weapon.active.maxCharges);
    
    return weapon;
}

