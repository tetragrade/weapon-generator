import type seedrandom from "seedrandom";

export interface LeafGenerator {
    /**
     * Execute the random generator.
     * @returns one of the possible strings that the random generator can yield.
     */
    generate: (rng: seedrandom.PRNG) => string;
}
export const mkGen: (x: string | ((rng: seedrandom.PRNG) => string)) => LeafGenerator = (x) =>(typeof x=='string' ? {generate: () => x} : {generate: x});

export type StringGenerator = LeafGenerator | RecursiveGenerator;

export class RecursiveGenerator {
    children: (StringGenerator)[];

    constructor(children: (StringGenerator)[]) {
        this.children = children;
    }

    /**
     * Execute the random generator.
     * @returns one of the possible strings that the random generator can yield.
     */
    generate: (rng: seedrandom.PRNG) => string = (rng) => this.children.reduce((acc, x) => acc+x.generate(rng), "");

    toString = this.generate;
}
