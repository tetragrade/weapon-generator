import './util/choice.ts';
import { WeaponGeneratorController } from './controllers.ts';

// load the seed if one exists
new WeaponGeneratorController("main-generator");

// testing
// console.log('random names', new Array(100).fill(null).map(() => angloNamesByPartGenerator.generate(seedrandom())))