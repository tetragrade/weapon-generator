<script lang="ts">
    import mkDemand from "$lib/generators/demandGenerator";
    import { type Weapon } from "$lib/generators/weaponGenerator/weaponGeneratorTypes";

    interface Props {
        /**
         *  A Weapon, which is guaranteed to be sentient.
         */
        weapon: Omit<Weapon, "sentient"> & {
            sentient: Exclude<Weapon["sentient"], false>;
        };
    }

    let { weapon }: Props = $props();

    let demand = $state("");

    /**
     * The demand paragraph swaps between two animations each
     * time a new demand is generated, so that the animation
     * always triggers. fadeLock represents which one it's using
     */
    let fadeLock = $state(false);

    // TODO button click functionality
    function generateDemand() {
        // generate the new demand
        demand = mkDemand(weapon);

        // switch animations
        fadeLock = !fadeLock;
    }
</script>

<div class="weapon-demands-main">
    <h2>Demands</h2>
    <p>
        Sentient weapons can issue demands, so long as one isn't pending. The
        referee is responsible for rolling and interpreting demands.
    </p>
    <p>
        Fulfilling a demand causes the weapon to regain charges. If the demand
        is made impossible, it's dropped.
    </p>
    <p>
        This weapon has a 1-in-{weapon.sentient.chanceOfMakingDemands} chance each
        scene to make a new demand.
    </p>
    <div
        class="weapon-demands-generator"
        id="main-weapon-generator-weapon-demands-generator"
    >
        <div class="weapon-demands-generator-output-container">
            <p class="weapon-demands-generator-output-header">Latest Demand</p>
            <p
                class={`weapon-demands-generator-content fade-in-${fadeLock ? "1" : "2"}`}
            >
                {demand}
            </p>
        </div>
        <div>
            <button
                class="weapon-demands-generator-button"
                onclick={generateDemand}>Another!</button
            >
        </div>
    </div>
</div>

<style>
    .weapon-demands-generator {
        margin-top: 10pt;
        padding: 5pt;

        display: flex;
        flex-direction: column;
        gap: 5pt;
        align-items: center;

        margin-left: auto;
        margin-right: auto;
    }

    .weapon-demands-generator-output-header {
        font-weight: bold;
    }

    .weapon-demands-generator-content {
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    div > .weapon-demands-generator-button {
        display: flex;
        justify-content: center;
    }

    .weapon-demands-generator-button {
        width: fit-content;
    }

    .weapon-demands-generator-output-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>
