import { mkGen } from "./recursiveGenerator";

export const singularHolyFoe = mkGen((rng) => [
    "an angel",
    "a priest"
].choice(rng));

export const pluralHolyFoe = mkGen((rng) => [
    "angels",
    "priests",
].choice(rng))

export const singularUnholyFoe = mkGen((rng) => [
    "a satanist",
    "a cannibal",

    "a vampire",
    "an undead",
    "a ghost",
    "a ghoul",
    "a wendigo",
    "a skinwalker",
    
    "an automaton",
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
    "a shark",
    "a bear",
    "a dinosaur",
    "a giant animal",
    "a human-eating worm",
].choice(rng))