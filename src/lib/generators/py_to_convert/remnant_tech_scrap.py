from utils.recursive_generator import recursive_generator
from utils.y2k import y2k_opener, y2k_function, y2k_object

class remnant_trinket(recursive_generator):
    def __init__(self,seed:int|None=None):
        super().__init__(seed)
        self.root = [y2k_opener, " ", lambda: y2k_function(50), " ", y2k_object]
        self.name = "Remnant Trinket"

gen = remnant_trinket()
gen.generateAndPrint()