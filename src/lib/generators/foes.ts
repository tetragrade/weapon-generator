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
    "a demon",

    "a vampire",
    "an undead",
    "a ghost",
    "a ghoul",
    "a wendigo",
    "a skinwalker",
    
    "an automaton",

    "an orc",
    "a goblin"
].choice(rng));

export const pluralUnholyFoe = mkGen((rng) => [
    "satanists",
    "cannibals",
    "demons",

    "vampires",
    "undead",
    "ghost",
    "ghouls",
    "wendigos",
    "skinwalkers",
    
    "automatons",
    
    "orcs",
    "goblins",
].choice(rng));

export const singularWildAnimal = mkGen((rng) => [
    "a wolf",
    "a fox",
    "a bear",
    "a badger",
    "a hedgehog",
    "a python",
    "a cobra",
    "an elephant",
    "an anteater",
    "a giant ant",
    "a giant bee",
    "a giant dragonfly",
    "a hawk",
    "an owl",
    "an eagle",
    "a seal",
    "a tiger",
    "a lion",
    "a crow"
].choice(rng))