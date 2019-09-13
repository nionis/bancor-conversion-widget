<script>
  import useCssVars from "svelte-css-vars";
  import Required from "../utils/Required";
  import { Opacity } from "../utils/Colors.js";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let borderColor = Required("borderColor");
  export let value = Required("value");
  export let disabled = false;

  $: cssVars = {
    bgColor,
    opacity: Opacity({ disabled }),
    borderColor,
    fontColor
  };
</script>

<style>
  div {
    border: var(--borderColor) solid 1px;
    background-color: var(--bgColor);
    opacity: var(--opacity);
  }

  input {
    height: 41px;
    width: 175px;
    text-align: center;
    margin: 0;
    border: none;
    border-radius: 5px;
    outline: none;
    background-color: transparent;
    color: var(--fontColor);
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    height: 45px;
    width: 270px;
    border-radius: 5px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  <input type="number" min="0" {value} {disabled} on:change />
  <slot />
</div>
