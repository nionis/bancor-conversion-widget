<script>
  /*
    Label
    Adds a label wrapper ontop of a component
  */

  import useCssVars from "svelte-css-vars";
  import { emptyChar } from "../utils";
  import Required from "../utils/Required";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let text = emptyChar;

  $: cssVars = {
    bgColor,
    fontColor
  };
</script>

<style>
  span {
    font-size: calc(26px + 0.35vw);
    font-weight: lighter;
    color: var(--fontColor);
  }

  .container {
    display: flex;
    width: 100%;
    height: 150px;
    padding: 20px;
    flex-direction: column;
    justify-content: space-between;
    text-align: center;
    align-items: flex-start;
    background-color: var(--bgColor);
    box-sizing: border-box;
  }

  .childrenContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  {#if text}
    <span>{text}</span>
  {/if}
  <div class="childrenContainer">
    <slot />
  </div>
</div>
