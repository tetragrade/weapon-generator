import { mkWeapon } from "../generators/weaponGenerator/weaponGeneratorLogic";

const nRuns = 10e3;

test('Weapon Generator Tests', () => {
    it('Always generates a weapon with a number of active abilities matching its params.', () => {
        for(let i=0; i<nRuns; i++) {
            const weapon = mkWeapon(i.toString());
        }
    });
    
    it('Always generates a weapon with a number of passive abilities matching its params.', () => {
        throw new Error('not implemented')
    });
    
    it('Always generates a weapon with a number of charges matching its params.', () => {
        throw new Error('not implemented')
    });
    
    it('Always generates a weapon with enough charges to use any of its actives at least once.', () => {
        throw new Error('not implemented')
    });
})