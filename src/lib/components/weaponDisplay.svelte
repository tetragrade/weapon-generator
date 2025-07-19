<script lang="ts">
    import WeaponDemandsGenerator from "$lib/components/weaponDemandsGenerator.svelte";
    import { type Weapon } from "$lib/generators/weaponGenerator/weaponGeneratorTypes";

    interface Props {
        weapon: Weapon;
    }

    let { weapon }: Props = $props();

    const damageString = $derived.by(() => {
        const acc = `as ${weapon.damage.as}`;
        const damageKeys = (
            Object.keys(weapon.damage) as [keyof (typeof weapon)["damage"]]
        )
            .filter((k) => k != "as")
            .sort((k1, k2) => {
                const ord = ["d20", "d12", "d10", "d8", "d6", "d4", "const"];
                return (
                    ord.findIndex((x) => x === k1) -
                    ord.findIndex((x) => x === k2)
                );
            });
        return damageKeys.length > 0
            ? damageKeys.reduce<string>(
                  (acc, k) =>
                      (weapon?.damage[k] ?? 0) > 0
                          ? acc +
                            ` + ${weapon?.damage[k]}${k === "const" ? "" : k}`
                          : acc,
                  acc,
              )
            : acc;
    });

    const toHitString = $derived(
        weapon.toHit > 0 ? ` (+${weapon.toHit} to hit)` : "",
    );

    function textForCharges(c: number | string | "at will") {
        if (c === "at will") {
            return c;
        }
        if (typeof c === "string") {
            return `charges ${c}`;
        } else {
            if (c == 1) {
                return "1 charge";
            } else {
                return `${c} charges`;
            }
        }
    }
</script>

<div class="weapon-display">
    <h2 class={`weapon-class weapon-rarity-${weapon.rarity}`}>
        {weapon?.name ?? ""}
    </h2>
    <div class="weapon-display-body">
        <div class="weapon-display-powers">
            <div class="weapon-generator-row-flex">
                <p>
                    <span class="weapon-damage-title">Damage:</span>
                    {damageString}
                    {toHitString}
                </p>
            </div>
            <div>
                <h2>Active Powers</h2>
                <div class="weapon-generator-row-flex">
                    <p>
                        {textForCharges(weapon.active.maxCharges)}. Regains
                        {#if weapon.sentient}
                            charges when its demands are fulfilled, and
                        {/if}
                        {weapon.active.rechargeMethod.desc}.
                    </p>
                </div>
                <div class="weapon-active-powers-root">
                    {#each weapon.active.powers as power}
                        <div class="weapon-generator-list-item">
                            <p>
                                {`${(power.desc as string).capFirst()} (${textForCharges(power.cost)}).`}
                            </p>
                            {#if power.additionalNotes}
                                <div>
                                    {#each power.additionalNotes as additionalNote}
                                        <div class="weapon-generator-list-item">
                                            <p>
                                                {additionalNote}
                                            </p>
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
            <div>
                <h2>Passive Powers</h2>
                <div class="weapon-passive-powers-root">
                    {#each weapon.passivePowers as power}
                        <div class="weapon-generator-list-item">
                            <p>
                                {power.desc}
                            </p>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
        {#if weapon.sentient !== false}
            <div class="weapon-display-sentient-info">
                <p class="weapon-display-sentient-info-title">
                    This is a sentient weapon.
                </p>
                <div class="weapon-display-sentient-info-top-half">
                    <div>
                        <h2>Personality</h2>
                        <div class="weapon-personality-root">
                            {#each weapon.sentient.personality as personality}
                                <div class="weapon-generator-list-item">
                                    <p>
                                        {personality.desc}
                                    </p>
                                </div>
                            {/each}
                        </div>
                    </div>
                    <div>
                        <h2>Languages</h2>
                        <div class="weapon-languages-root">
                            {#each weapon.sentient.languages as language}
                                <div class="weapon-generator-list-item">
                                    <p>
                                        {language}
                                    </p>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
                {#if weapon.active.powers.length !== 0}
                    <WeaponDemandsGenerator
                        weapon={{
                            // unfortunately we have to unroll it like this for the type of 'sentient' to be picked up
                            ...weapon,
                            sentient: weapon.sentient,
                        }}
                    />
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .weapon-display-body > * {
        flex-basis: 0;
    }

    .weapon-display-powers {
        flex-grow: 2;
    }
    .weapon-display-sentient-info {
        flex-grow: 1;
    }

    .weapon-display {
        width: 100%;

        flex-grow: 1;
        overflow-y: auto;

        margin-bottom: 10pt;
    }

    .weapon-display-body {
        display: flex;
        gap: 20pt;
    }

    @media (orientation: landscape) {
        .weapon-display-sentient-info-top-half {
            display: flex;
            justify-content: space-around;
        }
    }

    @media (orientation: portrait) {
        .weapon-display-body {
            flex-direction: column;
        }
    }

    .weapon-generator-list-item {
        margin-left: 20pt;
        margin-top: 10pt;
        margin-bottom: 10pt;
    }
    .weapon-generator-list-item > p {
        display: inline;
    }
    .weapon-generator-list-item::before {
        content: "•";
        display: inline-block;
        width: 10pt;
        height: 10pt;
    }
    .weapon-name {
        width: 100%;
        text-align: center;
    }
    .weapon-damage-title {
        font-weight: bold;
        text-decoration: underline;
    }
    .weapon-display-sentient-info {
        border: 2pt solid #ffffff47;
        border-radius: 10pt;

        padding: 10pt;
    }
    .weapon-display-sentient-info-title {
        text-align: center;
    }

    .weapon-generator-row-flex {
        padding: 0;
        margin: 0;

        display: flex;
        align-items: center;
        gap: 6pt;
    }
    .weapon-generator-row-flex > * {
        padding: 0;
        margin: 0;
    }

    .weapon-rarity-common {
        color: white;
    }
    .weapon-rarity-uncommon {
        color: hsl(108, 74%, 50%);
    }
    .weapon-rarity-rare {
        color: hsl(212, 74%, 55%);
    }
    .weapon-rarity-epic {
        color: hsl(273, 74%, 60%);
    }
    .weapon-rarity-legendary {
        color: hsl(51, 84%, 50%);
    }
</style>
