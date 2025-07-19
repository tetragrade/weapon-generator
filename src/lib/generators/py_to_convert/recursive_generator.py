from datetime import datetime
import numpy as np
import random

#this is the base class for generator
#all top-level generators should implement this because it provides console output
#it contains a tree of generators that are called to produce a result
#the generators in this tree may be strings, other recursive_generators or callables/functions
class recursive_generator:
    def __init__(self, seed:int|None=None) -> None:
        if seed is None:
            self.seed = int(datetime.now().timestamp()*100) % 2**32
        else:
            self.seed = seed
        self.root: str|list[str|recursive_generator|callable[list,str]] = [] #should be overwritten by subclases to create functionality
        self.name: str = "unnamed generator" #should be overwritten by subclasses
    def handleCallableComponent(self,rootComponent) -> str:
        result = ""
        for component in rootComponent():
            if isinstance(component, str):
                result+= component
            elif isinstance(component, recursive_generator):
                result+= component.generate()
            elif callable(component):
                result+= self.handleCallableComponent(component)
        return result
    def generate(self) -> str:
        np.random.seed(self.seed)
        random.seed(self.seed)
        result: str = ""
        for component in self.root:
            if isinstance(component, str):
                result += component
            if isinstance(component, recursive_generator):
                result += component.generate()
            elif callable(component):
                result += self.handleCallableComponent(component)
        return result
    def generateAndPrint(self):
        print(f"{self.name} @ {self.seed}:\n\033[94m{self.generate()}\033[0m")