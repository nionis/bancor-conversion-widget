<script>
  /*
    Input
    A number input component
  */

  import { onMount } from "svelte";
  import useCssVars from "svelte-css-vars";
  import Required from "../utils/Required";
  import { Opacity } from "../utils/Colors.js";

  export let fontColor = Required("fontColor");
  export let value;
  export let disabled = false;

  const minVirtualWidth = 50;
  const maxVirtualWidth = 200;
  const placeholder = "0.001";

  let focused = false;
  let virtualInput;
  let virtualWidth = `${minVirtualWidth}px`;

  const onFocus = () => (focused = true);
  const onBlur = () => (focused = false);

  const updateVirtualInput = value => {
    virtualInput.innerText = value || placeholder;

    let newWidth = virtualInput.offsetWidth + 5;
    if (newWidth < minVirtualWidth) newWidth = minVirtualWidth;
    else if (newWidth > maxVirtualWidth) newWidth = maxVirtualWidth;

    virtualWidth = `${newWidth}px`;
  };

  // update on every input
  const onInput = e => {
    updateVirtualInput(e.target.value);
  };

  // update when upstream value is changed, only when not focused
  $: if (virtualInput) {
    if (!focused) updateVirtualInput(value);
  }

  $: cssVars = {
    opacity: Opacity({ disabled }),
    fontColor,
    fontSize: "calc(30px + 0.35vw)",
    virtualWidth,
    underline: focused ? `1px solid ${fontColor}` : "none"
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
    border-bottom: var(--underline);
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
    placeholder="0.001"
    value={value || ''}
    {disabled}
    on:focus={onFocus}
    on:blur={onBlur}
    on:input={onInput}
    on:change />
  <slot />
</div>
