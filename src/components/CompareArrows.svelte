<script>
  import MdCompareArrows from "svelte-icons/md/MdCompareArrows.svelte";
  import { lightTheme } from "../Colors";

  export let orientation = "horizontal";
  export let colors = {};

  const { compareArrows = lightTheme.compareArrows } = colors;
  console.log("compareArrows", compareArrows, lightTheme.compareArrows, colors);
  const arrowStyle = `color: ${compareArrows}`;
</script>

<style>
  .horizontal {
    width: 40px;
    height: 40px;
  }
  .vertical {
    width: 40px;
    height: 40px;
    transform: rotate(-90deg);
  }
</style>

<div class="icon">
  <div class={orientation} style={arrowStyle}>
    <MdCompareArrows />
  </div>
</div>
