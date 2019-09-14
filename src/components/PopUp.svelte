<script>
  import { createEventDispatcher } from "svelte";
  import { derived, get } from "svelte/store";
  import useCssVars from "svelte-css-vars";
  import PopUpStep from "./PopUpStep.svelte";
  import Required from "../utils/Required.js";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let borderColor = Required("borderColor");
  export let buttonBgColor = Required("buttonBgColor");
  export let buttonFontColor = Required("buttonFontColor");
  export let buttonBorderColor = Required("buttonBorderColor");
  export let steps = Required("steps");
  export let activeIndex = required("activeIndex");

  $: cssVars = {
    bgColor,
    borderColor
  };

  const dispatch = createEventDispatcher();

  const onClose = () => {
    dispatch("close");
  };
</script>

<style>
  .container {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: black;
    background-color: rgba(0, 0, 0, 0.48);
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    z-index: 5;
  }

  .popup {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 375px;
    height: 325px;
    border-radius: 10px;
    border: var(--borderColor) solid 3px;
    background-color: var(--bgColor);
  }
</style>

<div class="container" on:click={onClose} use:useCssVars={cssVars}>
  <div class="popup">
    {#each steps as step, i}
      <PopUpStep
        {bgColor}
        {fontColor}
        {borderColor}
        {buttonBgColor}
        {buttonFontColor}
        {buttonBorderColor}
        {step}
        active={activeIndex === i}
        position={i + 1}
        border={steps.length !== i - 1} />
    {/each}
  </div>
</div>
