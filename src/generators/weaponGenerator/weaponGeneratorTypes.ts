import type seedrandom from "seedrandom";
import type { Comp, Cond, Quant } from "./provider";

export const allThemes = [
    "fire", "ice",
    "dark", "light",
    "sweet", "sour",
    // "poison", "water"
    // "earth", "cloud",
    // "psychic", "electric"
    // "wizard", "thief"
    // "jungle",
    // "space"
    // 
] as const;
export type Theme = (typeof allThemes)[number];
const themesSet = new Set(allThemes);
export const isTheme = (x: unknown): x is Theme => themesSet.has(x as Theme);

export const weaponRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const weaponRaritiesSet = new Set(weaponRarities);
export type WeaponRarity = 'common'| 'uncommon' | 'rare' | 'epic' | 'legendary';
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
export type AnyPower = ActivePower | PassivePower;

export interface WeaponPowerCond extends Cond {
    themes?: Quant<Theme>;
    personalities?: Quant<string>;
    rarity?: Comp<WeaponRarity>;
    isSentient?: boolean;
}
export interface WeaponPowerCondParams {
    themes: Theme[];
    personalityTraits: string[];
    rarity: WeaponRarity;
    isSentient: boolean;
}