<script>
  /*
    Popup shows after clicking "convert"
  */

  import { createEventDispatcher } from "svelte";
  import { derived, get } from "svelte/store";
  import MdClose from "svelte-icons/md/MdClose.svelte";
  import useCssVars from "svelte-css-vars";
  import PopUpStep from "./PopUpStep.svelte";
  import Icon from "./Icon.svelte";
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
    height: 425px;
    border-radius: 10px;
    border: var(--borderColor) solid 3px;
    background-color: var(--bgColor);
  }

  .exitContainer {
    position: absolute;
    width: 100%;
    z-index: 6;
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  <div class="popup">
    <div class="exitContainer">
      <Icon orientation="horizontal" color={fontColor} on:click={onClose}>
        <MdClose />
      </Icon>
    </div>
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
        border={steps.length !== i + 1} />
    {/each}
  </div>
</div>
