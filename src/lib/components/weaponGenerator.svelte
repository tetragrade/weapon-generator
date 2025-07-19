<script lang="ts">
    import { mkWeapon } from "$lib/generators/weaponGenerator/weaponGeneratorLogic";
    import { type Weapon } from "$lib/generators/weaponGenerator/weaponGeneratorTypes.ts";
    import { onMount } from "svelte";
    import WeaponDisplay from "./weaponDisplay.svelte";

    let weapon: Weapon = $state(mkWeapon(getIDFromURL()));

    // set up event listeners
    onMount(() => {
        // listen for any future changes in the URL, ensuring that the weapon always conforms to it
        window.addEventListener("popstate", () => {
            weapon = mkWeapon(getIDFromURL());
        });
    });

    function getNewId() {
        return Math.floor(Math.random() * 10e19).toString();
    }

    /**
     * Get the weapon ID associated with the current URL.
     * If the URL has no 'id' param, its associated with a random ID.
     */
    function getIDFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const currentId = urlParams.get("id");
        return currentId ?? getNewId();
    }

    /**
     * Generate a new weapon, called when the 'generate' button is clicked.
     */
    function generateWeapon() {
        const newId = getNewId();

        // update the view with the new weapon
        weapon = mkWeapon(newId);

        // and update the URL params to point to its ID
        // note this doesn't trigger popstate, which is why we also have to set the weapon ^above
        window.history.pushState(
            //navigate back to main
            null,
            "",
            `?id=${newId}`,
        );
    }
</script>

<div class="weapon-generator">
    {#if weapon !== null}
        <WeaponDisplay {weapon} />
    {/if}
    <button class="generate-button" onclick={generateWeapon}>Generate</button>
</div>

<style>
    @media (orientation: landscape) {
        .weapon-generator {
            margin-left: 10vw;
            margin-right: 10vw;
        }
    }

    .weapon-generator {
        display: flex;
        flex-direction: column;
        align-items: center;

        position: relative;

        flex-grow: 1;
    }

    .generate-button {
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;

        margin-top: auto;

        width: fit-content;
    }
</style>
