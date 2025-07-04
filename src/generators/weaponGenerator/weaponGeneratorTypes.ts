import seedrandom from "seedrandom";
import { Comp, Cond, Quant } from "./provider";
import shapes from './config/shapes.json'
import { TGenerator } from "../recursiveGenerator";

export const themes = [
    "fire", "ice",
    "cloud",
    "dark", "light",
    "sweet", "sour",
    "wizard", 
    "steampunk", "nature"
    // "poison", "water"
    // "earth", "cloud",
    // "psychic", "electric"
    // "wizard", "thief"
    // "jungle",
    // "space"
] as const;
export type Theme = (typeof themes)[number];
const themesSet = new Set(themes);
export const isTheme = (x: unknown): x is Theme => themesSet.has(x as Theme);

export const weaponRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;
const weaponRaritiesSet = new Set(weaponRarities);
export type WeaponRarity = (typeof weaponRarities)[number];
export const isRarity = (x: unknown): x is WeaponRarity => weaponRaritiesSet.has(x as WeaponRarity);


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


export type Weapon = {
    /**
     * The RNG seed that produces this weapon.
     */
    id: string;

    
    rarity: WeaponRarity;
    name: string;
    description: string;
    shape: WeaponShape;

    damage: DamageDice & { as: string };
    toHit: number;

    active: {
        maxCharges: number,
        rechargeMethod: RechargeMethod
        powers: ActivePower[];
    }
    passivePowers: PassivePower[];
    sentient: false | {
        personality: Personality[];
        languages: string[];
    }
    
    themes: Theme[],
    params: WeaponGenerationParams
}

export type WeaponViewModel = {
    /**
     * The RNG seed that produces this weapon.
     */
    id: string;

    themes: Theme[],
    
    rarity: WeaponRarity;
    name: string;
    description: string;
    shape: WeaponShape;

    damage: DamageDice & { as: string };
    toHit: number;

    active: {
        maxCharges: number,
        rechargeMethod: string
        powers: ActivePower[];
    }
    passivePowers: PassivePower[];
    sentient: false | {
        personality: string[];
        languages: string[];
    }
}

export interface Power {
    additionalNotes?: (string | TGenerator<string>)[];
}

export interface DamageDice {
    const?: number;
    d4?: number;
    d6?: number;
    d8?: number;
    d10?: number;
    d12?: number;
    d20?: number;
}
export interface PassiveBonus {
    addDamageDie?: DamageDice;
    /**
     * Plus this many to attack and damage
     */
    plus: number;
} // TODO

export interface ChargedPower extends Power {
    desc: string | TGenerator<string>;
    cost: number | string;
}
export interface UnlimitedChargedPower extends Power {
    desc: string;
    cost: "at will";
}
export type ActivePower = ChargedPower | UnlimitedChargedPower;

export interface Personality {
    desc: string | TGenerator<string>;
};
export interface RechargeMethod {
    desc: string | TGenerator<string>;
}

export interface MiscPower extends Power {
    miscPower: true;
    desc: string | TGenerator<string>;
    bonus?: PassiveBonus;
}
export interface Language extends Power {
    language: true;
    desc: string;
}

export type PassivePower = Language | MiscPower;
export type AnyPower = ActivePower | PassivePower;

export type WeaponShape = {
    particular: string;
    group: keyof typeof shapes;
}

export interface WeaponPowerCond extends Cond {
    themes?: Quant<Theme>;
    personality?: Quant<Personality>;
    languages?: Quant<string>;
    activePowers?: Quant<ActivePower>;
    passivePowers?: Quant<PassivePower>;
    shapeFamily?: Quant<WeaponShape['group']>;
    rarity?: Comp<WeaponRarity>;
    isSentient?: boolean;
}

/**
 * TODO this should really just accept weapon
 */
export type WeaponPowerCondParams = Pick<Weapon, 'active' | 'passivePowers' | 'sentient' | 'rarity' | 'themes' | 'shape'>