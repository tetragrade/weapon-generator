import math
from utils.recursive_generator import recursive_generator
from utils.lunar_names import lunar_name_commons, lunar_name_controls, lunar_name_crusaders
from utils.mental import personality_commons, personality_crusader, personality_controls, secrets
from utils.object import armor, weapon
from utils.distributions import weighted_choice, trunc_normal, uniform
import numpy as np
import random

class lunarchy_adventurer(recursive_generator):
    def __init__(self,seed:int|None=None):
        def controls_adventurer():
            return adventurer(
                lunar_name_controls,
                None,
                None,
                8,16,
                2,6,
                100,300
            )
        def crusaders_adventurer():
            return adventurer(
                lunar_name_crusaders,
                None,
                None,
                6,12,
                4,8,
                50,100
            )
        def commons_adventurer():
            return adventurer(
                lunar_name_commons,
                None,
                None,
                4,8,
                4,8,
                1,20
            )
        def adventurer(name_source,personality_source,secrets_source, fleshMin,fleshMax, lightMin,lightMax, cashMin,cashMax):
            flesh = trunc_normal(fleshMin,fleshMax)
            light = trunc_normal(lightMin,lightMax)
            (hp, inventory) = adventurer_inventory(3, flesh, trunc_normal(cashMin,cashMax))
            return [
                "Name: ", name_source, ".\n",
                str(light)," LIGHT, ", str(hp)," HP, ", str(flesh)," FLESH.\n",
                
            ] + inventory

        def adventurer_inventory(minItems:int, maxItems:int, totalValue:int):
            output = []

            nItems = trunc_normal(minItems,maxItems)
            nWeapons = 0
            hlth = 0
            slotsUsed = []
            food = 0
            loot = 0
            #values = [1 if x<1 else int(x) for x in (np.random.dirichlet(np.ones(nItems))*daysRnB)]
            #values.sort()
            
            index = 0
            for _ in range(nItems):
                index+=1
                output.append(f"\t{index}. ")
                if nWeapons==0:
                    value = min(totalValue,trunc_normal(totalValue*.2,totalValue*.5))
                    totalValue-=value

                    weaponString = self.handleCallableComponent(lambda: weapon(value, "\t"))
                    output.append(weaponString.capitalize())
                    output.append(".")

                    nWeapons+=1
                else:
                    #I just picked these weights because they felt good idk lol
                    confHP = (0.0*hlth + 3.0*food + 3.0*loot)
                    confFD = (3.0*hlth + 0.0*food + 3.0*loot)
                    confLT = (5.0*hlth + 5.0*food + 0.001*totalValue*loot)

                    mag = confHP + confFD + confLT

                    match 0 if mag==0 else np.random.choice([0,1,2], p=[confHP/mag, confFD/mag, confLT/mag]):
                        case 0:
                            value = min(totalValue,trunc_normal(1,totalValue*.1))
                            totalValue-=value
                            (slot, hp, statblock) = armor(value, slotsUsed)
                            output.append(statblock)
                            slotsUsed.append(slot)
                            hlth += hp
                        case 1:
                            output.append(f"Ration.")
                            totalValue-=min(totalValue,1)
                            food+=1
                        case 2:
                            value = min(totalValue,trunc_normal(1,totalValue*(confLT/32)))
                            totalValue-=value
                            output.append(f"Treasure ({1 if value==0 else value} days R&B).")
                            loot+=value
                    
                    #some sort of weighted comparison of hp/food/armor
                output.append("\n")
            return (hlth, output)
        
        super().__init__(seed)
        self.root = [
            lambda: weighted_choice(
                [
                    (0.01, ["\033[4mControls Adventurer.\033[0m\033[94m\n",controls_adventurer]),
                    (0.09, ["\033[4mCrusaders Adventurer.\033[0m\033[94m\n",crusaders_adventurer]),
                    (0.90, ["\033[4mCommons Adventurer.\033[0m\033[94m\n",commons_adventurer]),
                ]
            )
        ]
        self.name = "Lunar Adventurer"

gen = lunarchy_adventurer()
gen.generateAndPrint()

#1038085103 == literally Guts can't believe I rolled this