
export interface LeafGenerator {
    /**
     * Execute the random generator.
     * @returns one of the possible strings that the random generator can yield.
     */
    generate: () => string;
}
export const mkGen: (x: string | (() => string)) => LeafGenerator = (x) =>(typeof x=='string' ? {generate: () => x} : {generate: x});

export class RecursiveGenerator {
    children: (LeafGenerator | RecursiveGenerator)[];

    constructor(children: (LeafGenerator | RecursiveGenerator)[]) {
        this.children = children;
    }

    /**
     * Execute the random generator.
     * @returns one of the possible strings that the random generator can yield.
     */
    generate: () => string = () => this.children.reduce((acc, x) => acc+x.generate(), "");

    toString = this.generate;
}