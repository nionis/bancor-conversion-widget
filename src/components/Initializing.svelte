<script>
  /*
    Success
    A success view once the conversion is complete.
  */

  import { createEventDispatcher } from "svelte";
  import useCssVars from "svelte-css-vars";
  import Loading from "./Loading.svelte";
  import Required from "../utils/Required";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let status = Required("status");

  const statuses = {
    initializing: "initializing",
    wrong_networkId: "wrong_networkId"
  };

  if (!Object.values(statuses).includes(status)) {
    throw Error("invalid 'status' input");
  }

  $: cssVars = {
    bgColor,
    fontColor
  };
</script>

<style>
  .container {
    position: absolute;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    box-sizing: border-box;
    justify-content: space-between;
    width: 450px;
    height: 600px;
    background: var(--bgColor);
    opacity: 75%;
    z-index: 2;
  }

  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100%;
    width: auto;
  }

  .error {
    color: var(--fontColor);
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  <div class="content">
    {#if status === statuses.initializing}
      <Loading color={fontColor} />
    {:else}
      <span class="error">switch ethereum network to mainnet! 🟢</span>
    {/if}
  </div>
</div>
