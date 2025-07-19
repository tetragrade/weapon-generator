import type seedrandom from "seedrandom";

export {}
declare global {
  interface Array<T> {
    /**
     * Choose a (psuedo)random element from the Array.
     * @returns a random element from the Array.
     */
    choice: (rng: seedrandom.PRNG) => T;
  }
  interface Set<T> {
    /**
     * Choose a (psuedo)random element from the Set.
     * @returns a random element from the Set.
     */
    choice: (rng: seedrandom.PRNG) => T;
  }
}
if(!Array.prototype.choice) {
  Array.prototype.choice = function(rng: seedrandom.PRNG) { return this[Math.floor(this.length*rng())]; }
}
if(!Set.prototype.choice) {
  Set.prototype.choice = function(rng: seedrandom.PRNG) { 
    const choice = Math.floor(this.size*rng()); 
    let i = 0;
    for(const x of this) {
        if(i==choice) {
          return x;
        }
        i++;
    }
  }
}