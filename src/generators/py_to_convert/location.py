from utils.jobs import job_commons
from random import choice

def world_location():
    return choice([
        "Ziggurat",
        "Mareot",
        "Hell",
        "Skull Pass"
    ])

def hamlet_building():
    def possessive(s:str):
        return s+"'" if s.endswith("s") else s+"'s"
    return choice([
        [lambda: possessive(job_commons()), " house"],
        "pale temple",
        "well",
        "market",
        "inn",
    ])