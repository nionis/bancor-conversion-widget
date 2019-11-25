<script>
  /*
    ConvertSteps
    Steps shown when a user is required to take more than one
    action in order to complete a conversion.
  */

  import { createEventDispatcher } from "svelte";
  import useCssVars from "svelte-css-vars";
  import MdClose from "svelte-icons/md/MdClose.svelte";
  import Step from "./Step.svelte";
  import Icon from "../Icon.svelte";
  import Required from "../../utils/Required.js";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let buttonBgColor = Required("buttonBgColor");
  export let buttonFontColor = Required("buttonFontColor");
  export let disabledFont = Required("disabledFont");
  export let steps = Required("steps");
  export let activeIndex = required("activeIndex");

  $: cssVars = {
    bgColor
  };

  const dispatch = createEventDispatcher();

  const onClose = () => {
    dispatch("close");
  };
</script>

<style>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: var(--bgColor);
  }
  .iconContainer {
    display: flex;
    width: 100%;
    justify-content: flex-end;
  }
  h1 {
    font-weight: normal;
    padding-bottom: 20px;
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  <div class="iconContainer">
    <Icon color={disabledFont} on:click={onClose}>
      <MdClose />
    </Icon>
  </div>

  <h1>Conversion Steps</h1>
  {#each steps as step, i}
    <Step
      {bgColor}
      {fontColor}
      {buttonBgColor}
      {buttonFontColor}
      {disabledFont}
      {step}
      position={i + 1}
      active={activeIndex === i} />
  {/each}
</div>
