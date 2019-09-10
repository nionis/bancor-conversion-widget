<script>
  import { createEventDispatcher } from "svelte";
  import Required from "../utils/Required";

  export let color = Required("color");
  export let orientation = Required("orientation");
  export let size = "40px";
  export let disabled = false;

  const iconStyle = `
    width: ${size};
    height: ${size};
    color: ${color};
    cursor: ${disabled ? "default" : "pointer"};
  `;

  const dispatch = createEventDispatcher();

  const onClick = e => {
    if (disabled) return;

    dispatch("click", e);
  };
</script>

<style>
  .vertical {
    transform: rotate(-90deg);
  }
</style>

<div class={orientation} style={iconStyle} on:click={onClick}>
  <slot />
</div>
