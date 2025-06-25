import type seedrandom from "seedrandom";

export type Quant<T> = { any: T[]} | { all: T[] } | { none: T[] }
export function evQuant<T>(req: Quant<T>, act: T[]) {
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

export interface Cond {
    unique?: boolean;
}

export interface ProviderElement<TThing, TCond extends Cond> { 
    thing: TThing;
    cond: TCond;
}

export abstract class ConditionalThingProvider<TThing, TCond extends Cond, TCondParams> {
    protected source: ProviderElement<TThing, TCond>[];

    constructor(source: ProviderElement<TThing, TCond>[]) {
        this.source = source;
    }

    protected abstract condExecutor(cond: TCond, params: TCondParams): boolean;
    
    /**
     * returns a thing that is available given this condition
     * @param rng seedrandom randomness source to pick using
     * @param params the params that the return value's condition must hold for
     * @returns a random thing meeting that is valid for conditions
     */
    draw = (rng: seedrandom.PRNG, params: TCondParams) => this.source.filter(x => this.condExecutor(x.cond, params)).choice(rng).thing;
    
    /**
     * Returns the set of things whose condition holds for given params.
     * @param params the params to get all the things whose condition must hold for
     * @returns the set of things that may possibly be returned by calling this.draw with conditions 
     */
    available = (params: TCondParams) => new Set(this.source.filter(x => this.condExecutor(x.cond, params)).map(x => x.thing));
}