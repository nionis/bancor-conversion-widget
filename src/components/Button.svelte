<script>
  /*
    A styled button used throughout the widget
  */

  import { createEventDispatcher } from "svelte";
  import useCssVars from "svelte-css-vars";
  import Loading from "./Loading.svelte";
  import { emptyChar } from "../utils";
  import { Cursor, Opacity } from "../utils/Colors.js";
  import Required from "../utils/Required";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let disabled = false;
  export let loading = false;

  $: cssVars = {
    bgColor,
    fontColor,
    cursor: Cursor({ disabled }),
    opacity: Opacity({ disabled }),
    opacityHover: Opacity({ hover: true }),
    margin: "0px"
  };

  const dispatch = createEventDispatcher();

  const onClick = e => {
    if (disabled) return;

    dispatch("click", e);
  };
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    text-align: center;
    margin-top: var(--margin);
  }

  .btnContainer {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .btn {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 300px;
    min-width: 90px;
    height: 50px;
    font-size: calc(22px + 0.3vw);
    padding-top: 1px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
    color: var(--fontColor);
    background-color: var(--bgColor);
    opacity: var(--opacity);
    cursor: var(--cursor);
  }

  .btn:hover {
    opacity: var(--opacityHover) !important;
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  <div class="btnContainer">
    <div class="btn" on:click={onClick}>
      {#if loading}
        <Loading color={fontColor} />
      {:else}
        <slot />
      {/if}
    </div>
  </div>
  <slot name="message" />
</div>
