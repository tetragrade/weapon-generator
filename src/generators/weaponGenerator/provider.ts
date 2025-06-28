import seedrandom from "seedrandom";
import * as _ from 'lodash';

export type Quant<T> = { any: T[]} | { all: T[] } | { none: T[] }
export function evQuant<T>(req: Quant<T>, actual: T | T[]) {
    const isArray = Array.isArray(actual);
    const eq: (x:T) => boolean = isArray ? 
        (x) => actual.some(y => _.isEqual(x,y)) :
        (x) =>  _.isEqual(x,actual);
    const length = isArray ? actual.length : 1;

    if('any' in req) {
        return length>0 && req.any.some(eq);
    }
    else if('all' in req) {
        return length>0 && req.all.every(eq);
    }
    else if('none' in req) {
        return length===0 || !req.none.some(eq);
    }
    return true;
}

export type Comp<T> = {lte: T } | { eq: T} | { gte: T};
export function evComp<T> (comp: Comp<T>, x: T, ord: (x: T) => number) {
    if('lte' in comp) {
        return ord(x) <= ord(comp.lte);
    }
    else if('eq' in comp) {
        return ord(x) === ord(comp.eq);
    }
    else if('gte' in comp) {
        return ord(x) >= ord(comp.gte);
    }
    return true;
}

export interface ProviderElement<TThing, TCond> { 
    thing: TThing;
    cond: TCond;
}

export interface Cond {
    unique: true
}

export type WithUUID<T extends object> = {   
    [k in keyof T]: T[k]
} & {
    UUID: number;
}
export class UUIDIssuer {
    count: number;
    
    constructor() {
        this.count = 0;
    }

    Issue<T extends object>(x: T): WithUUID<T> {
        try {
            console.log(`issued id ${this.count} for`, (x as any)?.thing?.desc?.generate(seedrandom()));
        }
        catch(e) {}
        return {
            ...x,
            UUID: this.count++,
        }
    }
}

export const GLOBAL_UUID_ISSUER = new UUIDIssuer();

export abstract class ConditionalThingProvider<TThing extends object, TCond extends Cond, TParams extends object> {
    protected source: WithUUID<ProviderElement<TThing, TCond>>[];

    constructor(source: WithUUID<ProviderElement<TThing, TCond>>[]) {
        this.source = source;
    }

    protected condExecutor(UUID: number, cond: TCond, params: TParams): boolean {
        // if the cond reqires unique, then no iterable on params can have the same UUID
        return (
            // unique implies no same UUID (de-morgan's)
            !cond.unique || 
            !Object.values(params).some(x => // no property
                x?.UUID === UUID || // has this UUID
                Array.isArray(x) && x.some(y => y?.UUID === UUID) // or has an element with this UUID (doesn't handle recursion)
            ));
    };
    
    // note that the complexity on this implementation is awful, O(n). it should build a decision tree on construction & be O(1)
    /**
     * returns a thing that is available given this condition
     * @param rng seedrandom randomness source to pick using
     * @param params the params that the return value's condition must hold for
     * @returns a random thing meeting that is valid for conditions
     */
    draw(rng: seedrandom.PRNG, params: TParams): WithUUID<TThing> {
        const choice = this.source.filter(x => this.condExecutor(x.UUID, x.cond, params)).choice(rng);
        return {
            ...choice.thing,
            UUID: choice.UUID
        }
    }
    
    // note that the complexity on ths implementation is awful, O(n). it should build a decision tree on construction & be O(1)
    /**
     * Returns the set of things whose condition holds for given params.
     * @param params the params to get all the things whose condition must hold for
     * @returns the set of things that may possibly be returned by calling this.draw with conditions 
     */
    available: (params: TParams) => Set<WithUUID<TThing>> = (params) => new Set(this.source.filter(x => this.condExecutor(x.UUID, x.cond, params)).map(x => ({
        ...(x.thing),
        UUID: x.UUID
    })));
}