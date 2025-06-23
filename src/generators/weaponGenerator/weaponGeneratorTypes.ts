import type seedrandom from "seedrandom";
import type { Theme } from "./weaponGeneratorConfig";

export type WeaponRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export const weaponRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary']
export type WeaponRarityConfig = {
    common: {
        percentile: 1;
        paramsProvider: (rng: seedrandom.PRNG) => WeaponGenerationParams;
    };
} & {
    [k in Exclude<WeaponRarity, 'common'>]: {
        percentile: number;
        paramsProvider: (rng: seedrandom.PRNG) => WeaponGenerationParams;
    }
}
export interface WeaponGenerationParams {
    damage: DamageDice;
    nPassive: number;
    nCharges: number;
    nActive: number;
    nUnlimitedActive: number;
    sentienceChance: number;
}

export const isRarity: ((x: unknown) => x is WeaponRarity) = (x) => (x==='common' || x==='uncommon' || x==='rare' || x==='epic' || x==='legendary');

export type Weapon = {
    /**
     * The RNG seed that produces this weapon.
     */
    id: string;

    themes: Theme[],
    
    rarity: WeaponRarity;
    name: string;
    description: string;

    damage: DamageDice;
    active: {
        maxCharges: number,
        rechargeMethod: string
        powers: (ChargedPower | UnlimitedChargedPower)[];
    }
    passivePowers: PassivePower[];
} & (
    { isSentient: false; } | {
        isSentient: true;
        personalityTraits: string[];
        languages: string[];
    }
)

export interface Power {
    desc: string;
    additionalNotes?: string[];
}

export interface DamageDice {
    d4?: number;
    d6?: number;
    d8?: number;
    d10?: number;
    d12?: number;
    d20?: number;
}
export interface PassiveBonus {
    addDamageDie?: DamageDice;
} // TODO

export interface ChargedPower extends Power {
    cost: number;
}
export interface UnlimitedChargedPower extends Power {
    cost: "at will";
}
export type ActivePower = ChargedPower | UnlimitedChargedPower;

export interface MiscPower extends Power {
    miscPower: true;
    bonus?: PassiveBonus;
}
export interface Language extends Power {
    language: true;
}

export type PassivePower = Language | MiscPower;

export type ConditionalThingProvider<TThing,TCond> = {
    /**
     * returns a thing that is available given this condition
     * @param rng seedrandom randomness source to pick using
     * @param conditions the conditions that the return value must be is valid for
     * @returns a random thing meeting that is valid for conditions
     */
    draw: (rng: seedrandom.PRNG, conditions: TCond) => TThing;
    
    /**
     * Returns the set of things available given this condition.
     * @param conditions the condition to get the things available for
     * @returns the set of things that may possibly be returned by calling this.draw with conditions 
     */
    available: (conditions: TCond) => Set<TThing>;
}

export type WeaponPowerCond = {
    themes: Theme[];
    rarity: WeaponRarity;
    isSentient: boolean;
}