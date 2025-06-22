import type { Theme } from "../weaponGenerator.options";

export type Weapon = {
    /**
     * The RNG seed that produces this weapon.
     */
    id: string;

    themes: Theme[],
    
    name: string;

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

export interface MiscPower extends Power {
    miscPower: true;
    bonus?: PassiveBonus;
}
export interface Language extends Power {
    language: true;
}

export type PassivePower = Language | MiscPower;