import type seedrandom from "seedrandom";
import { mkGen } from "./recursiveGenerator";

export const singularHolyFoe = mkGen((rng) => [
    "angel",
    "priest"
].choice(rng));

export const pluralHolyFoe = mkGen((rng) => [
    "angels",
    "priests",
].choice(rng))

export const singularUnholyFoe = mkGen((rng) => [
    "satanist",
    "cannibal",

    "vampire",
    "undead",
    "ghost",
    "ghoul",
    "wendigo",
    "skinwalker",
    
    "automaton",
].choice(rng));

export const pluralUnholyFoe = mkGen((rng) => [
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
].choice(rng));

export const singularBeastFoe = mkGen((rng) => [
    "shark",
    "bear",
    "dinosaurs",
    "giant animal",
    "human-eating worm",
].choice(rng))