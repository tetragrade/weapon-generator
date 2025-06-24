import type seedrandom from "seedrandom";
import { mkGen, type TGenerator } from "../recursiveGenerator";

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


export type Comp<T> = {lte: T } | { eq: T} | { gte: T};
export type Quant<T> = { any: T[]} | { all: T[] } | { none: T[] }

function evQuant<T>(req: Quant<T>, act: T[]) {
    const actSet = new Set(act);
    if('any' in req) {
        return actSet.size>0 && req.any.some(x => actSet.has(x));
    }
    else if('all' in req) {
        return actSet.size>0 && req.all.every(x => actSet.has(x));
    }
    else if('none' in req) {
        return actSet.size===0 || !req.none.some(x => actSet.has(x));
    }
    return true;
}

interface Cond {
    unique?: boolean;
}

export interface WeaponPowerCond extends Cond {
    themes?: Quant<Theme>;
    personalities?: Quant<string>;
    rarity?: Comp<WeaponRarity>;
    isSentient?: boolean;
}

interface CondProvider<TCond extends Cond> {
    cond: TCond;
}

export abstract class ConditionalThingProvider<TThing, TTarget> {
    /**
     * returns a thing that is available given this condition
     * @param rng seedrandom randomness source to pick using
     * @param params the params that the return value's condition must hold for
     * @returns a random thing meeting that is valid for conditions
     */
    abstract draw: (rng: seedrandom.PRNG, params: TTarget) => TThing;
    
    /**
     * Returns the set of things whose condition holds for given params.
     * @param params the params to get all the things whose condition must hold for
     * @returns the set of things that may possibly be returned by calling this.draw with conditions 
     */
    abstract available: (params: TTarget) => Set<TThing>;
}
export interface PersonalityCondProvider extends CondProvider<WeaponPowerCond> {
    personalityGenerator: TGenerator<string>;
}

type CondExecutor<TCond extends Cond, TCondParams> = (cond: CondProvider<TCond>, params: TCondParams) => boolean;

export interface WeaponPowerCondParams {
    themes: Theme[];
    personalityTraits: string[];
    rarity: WeaponRarity;
    isSentient: boolean;
}

export const personalityExecutor: CondExecutor<WeaponPowerCond, WeaponPowerCondParams> = (x, params) => {
    function evComp_Rarity(comp: Comp<WeaponRarity>, rarity: WeaponRarity) {
        const ord: Record<WeaponRarity, number> = {
            common: 0,
            uncommon: 1,
            rare: 2,
            epic: 3,
            legendary: 4,
        }
        if('lte' in comp) {
            return ord[rarity] <= ord[comp.lte];
        }
        else if('eq' in comp) {
            return ord[rarity] === ord[comp.eq];
        }
        else if('gte' in comp) {
            return ord[rarity] >= ord[comp.gte];
        }
        return true;
    }

    const cond = x.cond;
    return (
        (!cond.isSentient || params.isSentient) && // sentience OK
        (!cond.rarity || evComp_Rarity(cond.rarity, params.rarity)) && // rarity OK
        (!cond.themes || evQuant(cond.themes, params.themes)) && //themes OK
        (!cond.personalities || evQuant(cond.personalities, params.personalityTraits)) //no duplicates OK
    );
};


export const mockProvider = {
    draw: () => mkGen({
        capFirst:() => {},
        desc: 'mocked'
    }) as TGenerator<any>,
    available: () => ({ size: Infinity }) as Set<any>
} as ConditionalThingProvider<any,any>;