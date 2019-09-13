<script>
  import PopUpStep from "./PopUpStep.svelte";
  import useCssVars from "svelte-css-vars";

  export let colors;

  export let bgColor = "white";
  export let fontColor = "black";
  export let borderColor = "grey";
  $: cssVars = {
    borderColor: colors.containerBorder,
    bgColor: colors.containerBg
  };
</script>

<style>
  /* .container {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: black;
    background-color: rgba(0, 0, 0, 0.48);
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    z-index: 5;
  } */
  .popup {
    border-radius: 10px;
    background-color: var(--bgColor);
    border: var(--borderColor) solid 3px;
    flex-direction: column;
    width: 375px;
    height: 325px;
    display: flex;
    position: absolute;
  }
</style>

<!-- <div class="container"> -->
<div class="popup" use:useCssVars={cssVars}>
  <PopUpStep {colors} done={true} />
  <PopUpStep {colors} />
  <PopUpStep {colors} active={false} />
  <PopUpStep {colors} active={false} border={false} />
</div>
<!-- </div> -->
