import { mkGen } from "./recursiveGenerator";

export const mundaneNameGenerator = mkGen(() => ['Joe', 'Jo'].choice()) 