import { mkGen, StringGenerator, TGenerator } from "../recursiveGenerator.ts";
import '../../string.ts';
import seedrandom from "seedrandom";
import { weaponRarityConfig, POSSIBLE_PERSONALITIES, POSSIBLE_RECHARGE_METHODS, POSSIBLE_ACTIVE_POWERS, POSSIBLE_PASSIVE_POWERS, POSSIBLE_SHAPES, WEAPON_TO_HIT, POSSIBLE_OBJECT_ADJECTIVES } from "./weaponGeneratorConfigLoader.ts";
import { ActivePower, DamageDice, PassiveBonus, Theme, Weapon, WeaponPowerCond, WeaponPowerCondParams, WeaponRarity, WeaponShape, themes, isRarity, PassivePower, Personality, RechargeMethod } from "./weaponGeneratorTypes.ts";
import { ConditionalThingProvider, evComp, evQuant, ProviderElement, WithUUID } from "./provider.ts";
import { angloFirstNameGenerator, grecoRomanFirstNameGenerator } from "../nameGenerator.ts";

export class WeaponFeatureProvider<T extends object> extends ConditionalThingProvider<T, WeaponPowerCond, WeaponPowerCondParams> {
    constructor(source: WithUUID<ProviderElement<T, WeaponPowerCond>>[]) {
        super(source);
    }
    
    protected override condExecutor(UUID: number, cond: WeaponPowerCond, params: WeaponPowerCondParams): boolean {
        
        const ord = (x: WeaponRarity) => ({
            common: 0,
            uncommon: 1,
            rare: 2,
            epic: 3,
            legendary: 4,
        }[x])

        return (
            super.condExecutor(UUID, cond, params) && //uniqueness OK
            (!cond.isSentient || params.sentient) && // sentience OK
            (!cond.rarity || evComp(cond.rarity, params.rarity, ord)) && // rarity OK
            (!cond.themes || evQuant(cond.themes, params.themes)) && // themes OK
            (!cond.personality || evQuant(cond.personality, params.sentient ? params.sentient.personality : [])) && // personality OK
            (!cond.activePowers || evQuant(cond.activePowers, params.active.powers)) && // actives OK
            (!cond.passivePowers || evQuant(cond.passivePowers, params.passivePowers)) && // passives OK
            (!cond.languages || evQuant(cond.languages, params.sentient ? params.sentient.languages : [])) && // languages OK
            (!cond.shapeFamily || evQuant(cond.shapeFamily, params.shape.group)) // shapes OK
        );
    }
}

const personalityProvider = new WeaponFeatureProvider<Personality>(POSSIBLE_PERSONALITIES);
const rechargeMethodsProvider = new WeaponFeatureProvider<RechargeMethod>(POSSIBLE_RECHARGE_METHODS);
const activePowersProvider = new WeaponFeatureProvider<ActivePower>(POSSIBLE_ACTIVE_POWERS);
const passivePowersProvider = new WeaponFeatureProvider<PassivePower>(POSSIBLE_PASSIVE_POWERS);
const shapeProvider = new WeaponFeatureProvider<TGenerator<WeaponShape>>(POSSIBLE_SHAPES);


const objectAdjectivesProvider =  new WeaponFeatureProvider<TGenerator<string>>(POSSIBLE_OBJECT_ADJECTIVES);

const articles = new Set(['the', 'a', 'an', 'by', 'of'])
const mkNonSentientNameGenerator = (weapon: Weapon, shape: string, rng: seedrandom.PRNG) => mkGen(() => {
    const string = new StringGenerator([
        mkGen((x) => objectAdjectivesProvider.draw(x, weapon).generate(x)),
        mkGen(' '),
        mkGen(shape)
    ])?.generate(rng);
    return string.split(/\s/).map(x => articles.has(x) ? x : x.capFirst()).join(' ');
});
const mkSentientNameGenerator = (weapon: Weapon,shape: string, rng: seedrandom.PRNG) => mkGen(() => {
    const string = new StringGenerator([
        mkGen((rng) => [grecoRomanFirstNameGenerator, angloFirstNameGenerator].choice(rng).generate(rng)),
        mkGen([', ', ', the '].choice(rng)),
        mkGen((x) => objectAdjectivesProvider.draw(x, weapon).generate(x)),
        mkGen(' '),
        mkGen(shape)
    ])?.generate(rng);
    return string.split(/\s/).map(x => articles.has(x) ? x : x.capFirst()).join(' ');
});

export const mkWeapon: (rngSeed: string) => Weapon = (rngSeed) => {
    const genStr = (x: string | TGenerator<string>) => typeof x === 'string' ? x : x.generate(rng);
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
    const originalParams = weaponRarityConfig[rarity].paramsProvider(rng);
    const params = structuredClone(originalParams)

    // determine sentience
    const isSentient = rng() < params.sentienceChance;

    const toHit = WEAPON_TO_HIT[rarity].generate(rng);
    
    // init weapon
    const weapon: Weapon = {
        id: rngSeed,
        description: 'TODO',
        rarity,
        name: '',
        shape: {
            particular: "sword",
            group: "sword"
        },
        damage: {
            as: 'sword',
            const: toHit,
        },
        toHit,
        active: {
            maxCharges: params.nCharges,
            rechargeMethod: {
                desc: '',
            },
            powers: []
        },
        passivePowers: [],
        sentient: isSentient ? {
            personality: [],
            languages: ['Common.'],
            chanceOfMakingDemands: params.chanceOfMakingDemands
        } : false as false,
        
        themes: [],
        params,
    };

    // draw themes until we have enough to cover our number of powers
    const unusedThemes = new Set<Theme>(themes); // this could be a provider but whatever go my Set<Theme>
    const minThemes = Math.max(
        1, 
        Math.min(
            Math.ceil((params.nActive + params.nUnlimitedActive + params.nPassive) / 2),
            3
        ), 
    );
    while(
        weapon.themes.length < minThemes ||
        activePowersProvider.available(weapon).size < params.nActive+params.nUnlimitedActive ||
        passivePowersProvider.available(weapon).size < params.nPassive
    ) {
        const choice = unusedThemes.choice(rng);
        if(choice!=undefined) {
            unusedThemes.delete(choice);
            weapon.themes.push(choice);
        }
        else {
            // there were not enough themes available, but continue anyway in case we get lucky & still generate a valid weapon
            break;
        }
    }
    
    //determine shape
    weapon.shape = shapeProvider.draw(rng, weapon).generate(rng);
    weapon.damage.as = weapon.shape.group;

    // determine name
    weapon.name = (isSentient ? mkSentientNameGenerator(weapon, weapon.shape.particular, rng) : mkNonSentientNameGenerator(weapon, weapon.shape.particular, rng))?.generate(rng);

    
    // determine description
    weapon.description = 'TODO';

    if(weapon.sentient) {
        const nPersonalities = 2;
        while(weapon.sentient.personality.length < nPersonalities) {
            const choice = personalityProvider.draw(rng, weapon);
            if(choice!=undefined) {
                weapon.sentient.personality.push({
                    ...choice,
                    desc: genStr(choice?.desc)
                });
            }
        }
    }
    

    // draw passive powers
    for(let i=0; i<params.nPassive; i++ ) {
        const choice = passivePowersProvider.draw(rng, weapon);
        if(choice!=undefined) {
            if('language' in choice && weapon.sentient) {
                weapon.sentient.languages.push(choice.desc);
            }
            else if ('miscPower' in choice) {
                if(choice.desc !== null) {
                    weapon.passivePowers.push({
                        ...choice,
                        desc: genStr(choice.desc)
                    });
                }
                for(const k in choice.bonus) {
                    const bonus = k as keyof PassiveBonus
                    switch(bonus) {
                        case 'addDamageDie':
                            // apply all damage dice to the weapon
                            for(const k in choice.bonus.addDamageDie) {
                                const die = k as keyof DamageDice;
                                if(typeof choice.bonus.addDamageDie[die] === 'number') {
                                    if(weapon.damage[die] === undefined) {
                                        weapon.damage[die] = 0;
                                    }
                                    weapon.damage[die] += choice.bonus.addDamageDie[die];
                                }
                            }
                            break;
                        case "plus":
                                weapon.toHit += choice.bonus.plus;

                                if(weapon.damage.const === undefined) {
                                    weapon.damage.const = 0;
                                }
                                weapon.damage.const += 1;
                            break;
                        default:
                            return bonus satisfies never;
                    }
                }
            }
            else {
                // Probably because a passive power was missing a type key.
                // Or because a language was configured in an invalid way & did not require the weapon to be sentient.
                throw new Error('Could not assign passive power, config was invalid.');
            }
        }
    }
    
    // draw active powers
    const rechargeMethodChoice = rechargeMethodsProvider.draw(rng, weapon);
    weapon.active.rechargeMethod = {
        ...rechargeMethodChoice,
        desc: genStr(rechargeMethodChoice.desc)
    };
    for(let i=0; i<params.nActive; i++ ) {
        const choice = activePowersProvider.draw(rng, weapon);
        if(choice!=undefined) {
            weapon.active.powers.push({
                ...choice,
                desc: genStr(choice.desc),
                additionalNotes: choice.additionalNotes?.map(genStr)
            });
        }
    }

    for(let i=0; i<params.nUnlimitedActive; i++ ) {
        const choice = activePowersProvider.draw(rng, weapon);
        if(choice!=undefined) {
            weapon.active.powers.push({
                ...choice,
                cost: 'at will',
                desc: genStr(choice.desc),
                additionalNotes: choice.additionalNotes?.map(genStr)
            });
        }
    }
    
    // set the weapon's max charges to be enough to cast its most expensive power, if it was previously lower
    weapon.active.maxCharges = 
        weapon.active.powers
        .filter(x => x.cost!='at will')
        .reduce((acc,x) => Math.max(typeof x.cost === 'string' ? 0 : x.cost, acc), weapon.active.maxCharges);

    console.log('generated weapon', weapon, params);
    
    // TODO convert to viewmodel
    
    return weapon;
}

