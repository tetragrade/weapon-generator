- TODO                                                  Difficulty, Time, Impact (1-10)
    - typos.
        - 'intimate' -> 'intimidate'

    - Bugs.
        - Broken weapon @ 60724988481853520000

    - Generator setup.
        - So, currently there's just one weapon type that's got things with generators inside them.
        - Should be replaced with a weapon model generator that's got generators inside it.
        - And all the features are generators on the outside, rather than containing generators in their desc.
        - Generators should have a UUID and transfer it to the things they generate.  

    - Basic Functionality
        - ~~Color-coded rarities.~~
        - ~~Weapon shape type based damage.~~
        - ~~Support for conditionally available abilities, beyond themes.~~
            - ~~Personality.~~
            - ~~Active Abilities.~~
            - ~~Passive Abilities.~~
            - ~~Recharge Method.~~
            - ~~Quant for active & passive powers.~~
            - ~~UUID based Quant.~~                         HARD SHORT  4
            - Split languages from passive powers. Current way of doing it is stupid & it's now possible to just have a Language or Misc Power provider. 

        - Sentient demands
            - ", and a charge when one of its demands is fulfilled."
            - 1-in-x to make demands
            - demand generator

        - ~~Implement bonuses for passive abilities.~~

        - Configuration.
            - Power level.
            - 5e mode.
        - UX.                                           EASY LONG   6
            - Link to github.
            - Link to this weapon button.
        - More themes & abilities.                      EASY LONG   8
            - 'pets'
        
        - ~~Names / Namelist~~                          EASY LONG   7
        - Descriptions.                                 HARD LONG   4
        - Automated Testing.                            HARD LONG   ~
    - Advanced.
        - User configuration menu & settings.           EASY SHORT  4
        - Bookmark weapons functionality.               EASY SHORT  3
        - Automated Testing.                            HARD SHORT  ~