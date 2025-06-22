import { mkGen } from "./recursiveGenerator";

export const singularHolyFoe = mkGen(() => [
    "angel",
    "priest"
].choice());

export const pluralHolyFoe = mkGen(() => [
    "angels",
    "priests",
].choice())

export const singularUnholyFoe = mkGen(() => [
    "satanist",
    "cannibal",

    "vampire",
    "undead",
    "ghost",
    "ghoul",
    "wendigo",
    "skinwalker",
    
    "automaton",
].choice());
export const pluralUnholyFoe = mkGen(() => [
    "satanists",
    "cannibals",

    "vampires",
    "undead",
    "ghost",
    "ghouls",
    "wendigos",
    "skinwalkers",
    
    "automatons",
    "blood beasts"
].choice());

export const singularBeastFoe = mkGen(() => [
    "shark",
    "bear",
    "dinosaurs",
    "giant animal",
    "human-eating worm",
].choice())