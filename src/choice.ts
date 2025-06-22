export {}
declare global {
  interface Array<T> {
    /**
     * Choose a (psuedo)random element from the Array.
     * @returns a random element from the Array.
     */
    choice: () => T;
  }
  interface Set<T> {
    /**
     * Choose a (psuedo)random element from the Set.
     * @returns a random element from the Set.
     */
    choice: () => T;
  }
}
if(!Array.prototype.choice) {
  Array.prototype.choice = function() { return this[Math.floor(this.length*Math.random())]; }
}
if(!Set.prototype.choice) {
  Set.prototype.choice = function() { 
    const choice = Math.floor(this.size*Math.random()); 
    let i = 0;
    for(const x of this) {
        if(i==choice) {
          return x;
        }
        i++;
    }
  }
}