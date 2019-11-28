<script>
  /*
    Input
    A number input component
  */

  import useCssVars from "svelte-css-vars";
  import Required from "../utils/Required";
  import { Opacity } from "../utils/Colors.js";

  export let fontColor = Required("fontColor");
  export let value = Required("value");
  export let disabled = false;

  let virtualInput;
  const minVirtualWidth = 50;
  const maxVirtualWidth = 200;
  let virtualWidth = `${minVirtualWidth}px`;

  const onInput = e => {
    virtualInput.innerText = e.target.value;

    let newWidth = virtualInput.offsetWidth;
    if (newWidth < minVirtualWidth) newWidth = minVirtualWidth;
    else if (newWidth > maxVirtualWidth) newWidth = maxVirtualWidth;

    virtualWidth = `${newWidth}px`;
  };

  $: cssVars = {
    opacity: Opacity({ disabled }),
    fontColor,
    fontSize: "calc(30px + 0.35vw)",
    virtualWidth
  };
</script>

<style>
  .container {
    background-color: transparent;
    opacity: var(--opacity);
    margin-right: 15px;
  }

  .virtualInput {
    position: absolute;
    visibility: hidden;
    font-size: var(--fontSize);
  }

  input {
    display: flex;
    height: 30px;
    width: var(--virtualWidth);
    margin: 0;
    border: none;
    background-color: transparent;
    color: var(--fontColor);
    font-size: var(--fontSize);
    text-overflow: ellipsis;
  }
  input:focus {
    outline: none;
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  <div class="virtualInput" bind:this={virtualInput} />
  <input
    type="number"
    min="0"
    step="0.001"
    {value}
    {disabled}
    on:input={onInput}
    on:change />
  <slot />
</div>
