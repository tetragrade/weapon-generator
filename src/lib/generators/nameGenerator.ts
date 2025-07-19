import "$lib/util/choice";
import { mkGen, StringGenerator } from "./recursiveGenerator";

const angloNamesByPartShortSuffixGenerator = new StringGenerator([
    mkGen(rng => [
        "vin",
        "gan",
        "rron",
        "sh",

        "rryl",
        "ley",
        "ya",
        "cy",
        "cey",
    ].choice(rng))
]);
const angloNamesByPartLongSuffixGenerator = new StringGenerator([
    mkGen(rng => ["t", "y", "rr", "nn", "s", "sh"].choice(rng)),
    mkGen(rng => [
        "on",
        "in",
        "ah",
        "ley",
        "leigh",
        "cy",
        "cey",
    ].choice(rng))
]);


export const angloNamesByPartGenerator = new StringGenerator([
    mkGen(rng => [
        "A",
        "Cha",
        "Ba",
        "Da",
        "Ka",
        "Ke",
        "Pe",
        "Ha",
        "Le",
        "La",
        "Cla",
    ].choice(rng)),
    mkGen(rng => [angloNamesByPartShortSuffixGenerator, angloNamesByPartLongSuffixGenerator].choice(rng).generate(rng)),
]);

export const angloFirstNameGenerator = mkGen((rng) => [
    mkGen((rng) => [
        "Tom",
        "Richard",
        "Harry",
        "Edward",
        "Jack",
        "Paul",
        "George",
        "Logan",
        "Ethan",
        "Bill",
        "Winston",
        "Lewis",
        "Luke",
        "John",
        "Peter",
        "Philip",
        "Thomas",
        "Simon",
        "James",
        "Andrew",

        "Alex",
        "Sam",
        "Ellis",
        "Kai",
        "Ash",
        "Charlie",

        "Mary",
        "Eve",
        "Ashley",
        "Alice",
        "Triss",
        "Stacy",
        "Lucy",
        "Lily",
        "Rose",
        "Elizabeth",
        "Jessica",
        "Emma",
        "Abigail",
        "Megan",
        "Sarah",
        "Julia",
        "Kate",
        "Karen",
        "Carol"
    ].choice(rng)),
    angloNamesByPartGenerator
].choice(rng).generate(rng));

export const grecoRomanFirstNameGenerator = new StringGenerator([
    mkGen((rng) => [
        "Lacri",
        "Lace",
        "Moro",
        "Ala",
        "Tri",
        "Be",
        "Di",
        "Ma",
        "Pe",
    ].choice(rng)),
    mkGen((rng) => [
        "mer",
        "v",
        "t",
        "c",
        "m",
        "n",
        "l",
        "s"
    ].choice(rng)),
    mkGen((rng) => [
        "ius",
        "us",
        "ion",
        "or",

        "a",
        "ia",
        "ina",
        "ira"
    ].choice(rng))
])
