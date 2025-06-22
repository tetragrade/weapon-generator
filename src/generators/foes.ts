import { mkGen } from "./recursiveGenerator";

export const foeType = mkGen(() => [
    "satanists",
    "cannibals",

    "angels",
    "priests",

    "vampires",
    "undead",
    "ghosts",
    "ghouls",
    "wendigos",
    "skinwalkers",

    "sharks",
    "bears",
    "dinosaurs",
    "giant animals",
    "human-eating worms",
    
    "automatons",
    "blood beasts"
].choice());