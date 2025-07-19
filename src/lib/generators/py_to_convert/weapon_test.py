from utils.object import weapon
from utils.recursive_generator import recursive_generator
import random

class weapon_test(recursive_generator):
    def __init__(self,seed:int|None=None):
        super().__init__(seed)
        self.root = [lambda: weapon(random.randint(50,1010), currency="GP")]
        self.name = "Weapon" 

gen = weapon_test()
gen.generateAndPrint()