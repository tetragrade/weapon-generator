from random import choice
def lunar_divinity_name():
    return choice(
        [
            "Makotli",
            
            "Glin",
            "Sora",
            "Scintelle",

            "Xamont",
            "Cyhtlu",
            "Hastur",
            "Saturn",
            "Ykkoli",
            "Zhmark"
        ]
    )

def lunar_firstname():
        def one():
            return choice([
                "Lacri",
                "Lace",
                "Moro",
                "Seta",
                "Ala",
                "Tra",
                "Tri",
                "Be",
                "Di",
                "Ma",
                "Pe",
            ])
        def two():
            return choice([
                "nast",
                "mer",
                "v",
                "t",
                "r",
                "k",
                "m",
                "n",
                "l",
                "s"
            ])
        def three():
            return choice([
                #masc
                "ius",
                "us",
                "ion",
                "or",

                #fem
                "a",
                "ia",
                "e"
                "ina",
                "ira"
            ])
        return [one, two, three]

def lunar_name_controls():
    def lastname():
        return choice([
            "Steliad",
            "Arkelian"
        ])
    return [lunar_firstname, " ", lastname]

def lunar_name_crusaders():
    def lastname():
        return choice([
            "Floris"
        ])
    return [lunar_firstname, " ", lastname]

def lunar_name_commons():
    return [lunar_firstname]