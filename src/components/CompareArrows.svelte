<script>
  import MdCompareArrows from "svelte-icons/md/MdCompareArrows.svelte";
  import { lightTheme } from "../Colors";

  export let orientation = "horizontal";
  export let colors = {};

  const { compareArrowsColor = lightTheme.compareArrowsColor } = colors;
</script>

<style>
  .container {
    width: 40px;
    height: 40px;
  }

  .vertical {
    transform: rotate(-90deg);
  }
</style>

<div class="container {orientation}" style="color: {compareArrowsColor};">
  <MdCompareArrows class="icon" />
</div>
