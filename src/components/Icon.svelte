<script>
  /*
    Icon wrapper
    Gives icon's functionality like onClick and orientation
  */

  import { createEventDispatcher } from "svelte";
  import useCssVars from "svelte-css-vars";
  import Required from "../utils/Required";
  import { Cursor, Opacity } from "../utils/Colors.js";

  export let color = Required("color");
  export let orientation = Required("orientation");
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

  .vertical {
    transform: rotate(-90deg);
    margin-left: 100px;
  }
</style>

<div class={orientation} on:click={onClick} use:useCssVars={cssVars}>
  <slot />
</div>
