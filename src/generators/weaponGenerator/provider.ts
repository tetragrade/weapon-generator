import type seedrandom from "seedrandom";
import * as _ from 'lodash';

export type Quant<T> = { any: T[]} | { all: T[] } | { none: T[] }
export function evQuant<T>(req: Quant<T>, actual: T | T[]) {
    const isArray = Array.isArray(actual);
    const eq: (x:T) => boolean = isArray ? 
        (x: T) => actual.some(y => _.isEqual(x,y)) :
        (x) => x === actual;
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
    
    // note that the complexity on this implementation is awful, O(n). it should build a decision tree on construction & be O(1)
    /**
     * returns a thing that is available given this condition
     * @param rng seedrandom randomness source to pick using
     * @param params the params that the return value's condition must hold for
     * @returns a random thing meeting that is valid for conditions
     */
    draw = (rng: seedrandom.PRNG, params: TCondParams) => this.source.filter(x => this.condExecutor(x.cond, params)).choice(rng)?.thing;
    
    // note that the complexity on ths implementation is awful, O(n). it should build a decision tree on construction & be O(1)
    /**
     * Returns the set of things whose condition holds for given params.
     * @param params the params to get all the things whose condition must hold for
     * @returns the set of things that may possibly be returned by calling this.draw with conditions 
     */
    available = (params: TCondParams) => new Set(this.source.filter(x => this.condExecutor(x.cond, params)).map(x => x.thing));
}