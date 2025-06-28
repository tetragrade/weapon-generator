import { type TGenerator } from "../recursiveGenerator.ts";
import '../../string.ts';
import seedrandom from "seedrandom";
import { weaponRarityConfig, POSSIBLE_PERSONALITIES, POSSIBLE_RECHARGE_METHODS, POSSIBLE_ACTIVE_POWERS, POSSIBLE_PASSIVE_POWERS, POSSIBLE_SHAPES, mkSentientNameGenerator, mkNonSentientNameGenerator } from "./weaponGeneratorConfigLoader.ts";
import { type ActivePower, type DamageDice, type PassiveBonus, type PassivePower, type Theme, type Weapon, type WeaponPowerCond, type WeaponPowerCondParams, type WeaponRarity, type WeaponShape, themes, isRarity } from "./weaponGeneratorTypes.ts";
import { ConditionalThingProvider, evComp, evQuant, type ProviderElement } from "./provider.ts";

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

const personalityProvider = new WeaponFeatureProvider<string>(POSSIBLE_PERSONALITIES);
const rechargeMethodsProvider = new WeaponFeatureProvider<string>(POSSIBLE_RECHARGE_METHODS);

const activePowersProvider = new WeaponFeatureProvider<ActivePower>(POSSIBLE_ACTIVE_POWERS);
const passivePowersProvider = new WeaponFeatureProvider<PassivePower>(POSSIBLE_PASSIVE_POWERS);
const shapeProvider = new WeaponFeatureProvider<WeaponShape>(POSSIBLE_SHAPES);

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
    const paramsClone = structuredClone(params)

    // determine sentience
    const isSentient = rng() < params.sentienceChance;

    // TODO move out
    // init weapon
    const weapon: Weapon = {
        id: rngSeed,
        description: 'TODO',
        rarity,
        themes: [],
        name: '',
        shape: {
            particular: "sword",
            group: "sword"
        },
        damage: {
            as: 'sword'
        }, 
        active: {
            maxCharges: params.nCharges,
            rechargeMethod: '',
            powers: []
        },
        passivePowers: [],
        sentient: isSentient ? {
            personality: [],
            languages: ['Common.']
        } : false as false,
    };

    // draw themes until we have enough to cover our number of powers
    const unusedThemes = new Set<Theme>(themes); // this could be a provider but whatever go my Set<Theme>
    const minThemes = [1,2].choice(rng);
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
    weapon.name = (isSentient ? mkSentientNameGenerator(weapon.themes, weapon.shape.particular, rng) : mkNonSentientNameGenerator(weapon.themes, weapon.shape.particular, rng))?.generate(rng);

    
    // determine description
    weapon.description = 'TODO';

    if(weapon.sentient) {
        // choose one personality for each theme
        for(const _ of weapon.themes) {
            const choice = personalityProvider.draw(rng, weapon)?.generate(rng);
            if(choice!=undefined) {
                weapon.sentient.personality.push(choice);
            }
        }
    }

    // draw passive powers
    while(params.nPassive-->0) {
        const choice = passivePowersProvider.draw(rng, weapon)?.generate(rng);
        if(choice!=undefined) {
            if('language' in choice && weapon.sentient) {
                weapon.sentient.languages.push(choice.desc);
            }
            else if ('miscPower' in choice) {
                weapon.passivePowers.push(choice);
                for(const bonus in choice.bonus) {
                    switch(bonus as keyof PassiveBonus) {
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
    weapon.active.rechargeMethod = rechargeMethodsProvider.draw(rng, weapon)?.generate(rng);
    while(params.nActive-->0) {
        const choice = activePowersProvider.draw(rng, weapon)?.generate(rng);
        if(choice!=undefined) {
            weapon.active.powers.push(choice);
        }
    }

    while(params.nUnlimitedActive-->0) {
        const choice = activePowersProvider.draw(rng, weapon)?.generate(rng);
        if(choice!=undefined) {
            weapon.active.powers.push({
                ...choice,
                cost: 'at will',
            });
        }
    }
    
    // set the weapon's max charges to be enough to cast its most expensive power, if it was previously lower
    weapon.active.maxCharges = 
        weapon.active.powers
        .filter(x => x.cost!='at will')
        .reduce((acc,x) => Math.max(x.cost, acc), weapon.active.maxCharges);
    
    console.log('generated weapon', weapon, paramsClone);
    return weapon;
}

