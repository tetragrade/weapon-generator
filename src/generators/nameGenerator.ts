import { mkGen } from "./recursiveGenerator";

export const mundaneNameGenerator = mkGen((rng) => ['Joe', 'Jo'].choice(rng)) 