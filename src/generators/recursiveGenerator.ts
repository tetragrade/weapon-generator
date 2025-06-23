import seedrandom from "seedrandom";

export interface LeafGenerator<T> {
    /**
     * Execute the random generator.
     * @returns one of the possible strings that the random generator can yield.
     */
    generate: (rng: seedrandom.PRNG) => T;
}
export function mkGen<T>(x: T | ((rng: seedrandom.PRNG) => T)): LeafGenerator<T> {
    return x instanceof Function ? {generate: x} : {generate: () => x};
}
export type TGenerator<T> = LeafGenerator<T> | RecursiveGenerator<T>;

export abstract class RecursiveGenerator<T> {
    children: (TGenerator<T>)[];

    constructor(children: (TGenerator<T>)[]) {
        this.children = children;
    }

    /**
     * Execute the random generator.
     * @returns one of the possible strings that the random generator can yield.
     */
    abstract generate: (rng: seedrandom.PRNG) => T;
}

export class StringGenerator extends RecursiveGenerator<string> {
    generate: (rng: seedrandom.PRNG) => string = (rng) => this.children.reduce((acc, x) => acc+x.generate(rng), "");
}

