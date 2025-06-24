import { mundaneNameGenerator } from "../nameGenerator.ts";
import { mkGen, StringGenerator, type TGenerator } from "../recursiveGenerator.ts";
import '../../string.ts';
import seedrandom from "seedrandom";
import { OBJECT_ADJECTIVES, weaponRarityConfig, POSSIBLE_PERSONALITIES, weaponShapeGenerator } from "./weaponGeneratorConfig.ts";
import { type ActivePower, type ConditionalThingProvider, type PassivePower, type Theme, type Weapon, type WeaponPowerCondParams, type WeaponRarity, allThemes, isRarity, mockProvider, personalityExecutor } from "./weaponGeneratorTypes.ts";


// this also needs to block picking duplicates
const PersonalityProvider: ConditionalThingProvider<TGenerator<string>, WeaponPowerCondParams> = {
    draw: (rng, params) => POSSIBLE_PERSONALITIES.filter(x => personalityExecutor(x, params)).choice(rng).personalityGenerator,
    available: (params) => new Set(POSSIBLE_PERSONALITIES.filter(x => personalityExecutor(x, params)).map(x => x.personalityGenerator))
}


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
    const unusedThemes = new Set<Theme>(allThemes);
    
    // copy over all the powers to the structure we'll draw from
    //TODO
    const rechargeMethodsProvider: ConditionalThingProvider<TGenerator<string>, WeaponPowerCondParams> = mockProvider;
    const activePowersProvider: ConditionalThingProvider<TGenerator<ActivePower>, WeaponPowerCondParams> = mockProvider;
    const passivePowersProvider: ConditionalThingProvider<TGenerator<PassivePower>, WeaponPowerCondParams> = mockProvider;


    // decide power level
    const rarity = generateRarity(rng);
    const params = weaponRarityConfig[rarity].paramsProvider(rng);

    // TODO remove me
    params.damage = { d6: 1}
    
    // determine sentience
    const isSentient = true; //rng() < params.sentienceChance;
    
    // draw themes until we have enough to cover our number of powers
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
            const chosen = PersonalityProvider.draw(rng, { themes, personalityTraits, rarity, isSentient }).generate(rng);
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
