export {}
declare global {
  interface String {
    /**
     * Get this string with the first letter apitalized.
     * @returns the string with the first letter capitalized.
     */
    capFirst: () => string;
  }
}
if(!String.prototype.capFirst) {
    String.prototype.capFirst = function() { return this.slice(0,1).toUpperCase() + this.slice(1) }
}