<script>
  import useCssVars from "svelte-css-vars";
  import Required from "../utils/Required";
  import { Opacity } from "../utils/Colors.js";

  export let fontColor = Required("fontColor");
  export let value = Required("value");
  export let disabled = false;

  $: cssVars = {
    opacity: Opacity({ disabled }),
    fontColor
  };
</script>

<style>
  div {
    background-color: transparent;
    opacity: var(--opacity);
    width: 40%;
  }

  input {
    display: flex;
    height: 30px;
    width: 100%;
    margin: 0;
    border: none;
    background-color: transparent;
    color: var(--fontColor);
    font-size: calc(30px + 0.35vw);
    text-overflow: ellipsis;
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>

<div use:useCssVars={cssVars}>
  <input type="number" min="0" {value} {disabled} on:change />
  <slot />
</div>
