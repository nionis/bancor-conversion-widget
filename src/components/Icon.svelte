<script>
  /*
    Icon
    Turn an icon into a button
  */

  import { createEventDispatcher } from "svelte";
  import useCssVars from "svelte-css-vars";
  import { Cursor, Opacity } from "../utils/Colors.js";
  import Required from "../utils/Required";

  export let color = Required("color");
  export let size = "40px";
  export let disabled = false;

  $: cssVars = {
    color,
    size,
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
    height: var(--size);
    width: var(--size);
    min-width: 40px;
    color: var(--color);
    cursor: var(--cursor);
    opacity: var(--opacity);
  }

  div:hover {
    opacity: var(--opacityHover) !important;
  }

  .container {
    transform: rotate(90deg);
  }
</style>

<div class="container" use:useCssVars={cssVars} on:click={onClick}>
  <slot />
</div>
