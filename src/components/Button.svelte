<script>
  import { createEventDispatcher } from "svelte";
  import useCssVars from "svelte-css-vars";
  import Required from "../utils/Required";
  import { Cursor, Opacity } from "../utils/Colors.js";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let borderColor = Required("borderColor");
  export let disabled = false;

  $: cssVars = {
    bgColor,
    fontColor,
    borderColor,
    cursor: Cursor({ disabled }),
    opacity: Opacity({ disabled }),
    opacityHover: Opacity({ hover: true })
  };

  const dispatch = createEventDispatcher();

  const onClick = e => {
    if (disabled) return;

    dispatch("click", e);
  };
</script>

<style>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 90px;
    height: 33px;
    font-size: 1em;
    border-radius: 20px;
    padding-top: 1px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
    color: var(--fontColor);
    background-color: var(--bgColor);
    opacity: var(--opacity);
    border: var(--borderColor);
    cursor: var(--cursor);
  }

  div:hover {
    opacity: var(--opacityHover) !important;
  }
</style>

<div on:click={onClick} use:useCssVars={cssVars}>
  <slot />
</div>
