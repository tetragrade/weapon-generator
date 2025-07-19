<script>
    import WeaponGenerator from "$lib/components/weaponGenerator.svelte";
</script>

<h1>Generator Test</h1>
<WeaponGenerator />

<style>
    :global(h1, h2) {
        text-align: center;
    }
    :global(:root) {
        font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
        line-height: 1.5;
        font-weight: 400;

        color-scheme: light dark;
        color: rgba(255, 255, 255, 0.87);
        background-color: #242424;

        font-synthesis: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;

        display: flex;
        flex-direction: column;
        align-items: center;
    }

    :global(p) {
        margin: 0;
    }

    :global(a) {
        font-weight: 500;
        color: #646cff;
        text-decoration: inherit;
    }
    :global(a:hover) {
        color: #535bf2;
    }

    :global(body) {
        margin: 0;
        display: flex;
        flex-direction: column;
        place-items: center;
    }

    :global(#body) {
        width: 100%;
    }

    :global(h1) {
        font-size: 3.2em;
        line-height: 1.1;
    }
    :global(h2) {
        text-align: center;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }

    :global(#app) {
        max-width: 1280px;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
    }

    :global(.logo) {
        height: 6em;
        padding: 1.5em;
        will-change: filter;
        transition: filter 300ms;
    }
    :global(.logo:hover) {
        filter: drop-shadow(0 0 2em #646cffaa);
    }
    :global(.logo.vanilla:hover) {
        filter: drop-shadow(0 0 2em #3178c6aa);
    }

    :global(.card) {
        padding: 2em;
    }

    :global(button) {
        border-radius: 8px;
        border: 2pt solid transparent;
        padding: 0.6em 1.2em;
        font-size: 1em;
        font-weight: 500;
        font-family: inherit;
        background-color: #1a1a1a;
        cursor: pointer;
        transition: border-color 0.25s;
    }
    :global(button:hover) {
        border-color: #ffffff47;
    }
    :global(button:focus, button:focus-visible) {
        outline: 4px auto -webkit-focus-ring-color;
    }

    @media (prefers-color-scheme: light) {
        :global(:root) {
            color: #213547;
            background-color: #ffffff;
        }
        :global(a:hover) {
            color: #747bff;
        }
        :global(button) {
            background-color: #f9f9f9;
        }
        .weapon-is-sentient {
            border-color: #00000047 !important;
        }
        :global(button:hover) {
            border-color: #00000047 !important;
        }
    }

    :global(button) {
        width: 10vw;
    }
    :global(h1) {
        height: 7.5vh;
        margin: 0;
        margin-top: 1.5vh;
    }
    :global(#body) {
        height: 90vh;
        margin: 0;
        min-width: 33%;

        display: flex;
    }

    :global(.fade-in-1) {
        animation: 0.666s ease-in 0s 1 fade-in-1;
    }
    :global(.fade-in-2) {
        animation: 0.666s ease-in 0s 1 fade-in-2;
    }

    @keyframes fade-in-1 {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes fade-in-2 {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>
