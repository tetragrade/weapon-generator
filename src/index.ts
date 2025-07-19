import { WeaponGeneratorController } from './controllers.ts';
import './util/choice.ts';

// load the seed if one exists
new WeaponGeneratorController("main-generator");

// testing
// console.log('random names', new Array(100).fill(null).map(() => angloNamesByPartGenerator.generate(seedrandom())))