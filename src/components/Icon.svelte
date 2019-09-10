<script>
  export let size = "40px";
  export let color = "white";
  export let orientation = "horizontal";

  const iconStyle = `
    width: ${size};
    height: ${size};
    color: ${color};
  `;
</script>

<style>
  .vertical {
    transform: rotate(-90deg);
  }
</style>

<div class={orientation} style={iconStyle}>
  <slot />
</div>
