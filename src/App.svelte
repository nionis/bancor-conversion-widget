<script>
  import CompareArrows from "./components/CompareArrows.svelte";
  import Button from "./components/Button.svelte";
  import Input from "./components/Input.svelte";
  import Colors from "./Colors.js";

  export let orientation = "horizontal";
  export let theme = "light";
  export let colors = {};

  colors = Colors(theme, colors);

  const arrowsContainer = orientation === "vertical" ? "arrowsContainer" : null;
  const alignInputs =
    orientation === "vertical"
      ? "alignInputs-vertical"
      : "alignInputs-horizontal";

  $: backgroundStyle = `
    background-color: ${colors.containerBg};
    border: ${colors.containerBorder} solid 1px;
  `;
</script>

<style>
  .container {
    display: flex;
    border-radius: 10px;
    justify-content: space-evenly;
    align-items: center;
  }
  .horizontal {
    width: 900px;
    height: 110px;
    flex-direction: row;
  }
  .vertical {
    width: 450px;
    height: 325px;
    flex-direction: column;
  }
  .arrowsContainer {
    padding-left: 150px;
    padding-right: 28px;
    width: 272px;
    justify-content: center;
    display: flex;
  }
  .alignInputs-horizontal {
    margin-bottom: 18px;
    /* display: inherit; */
  }
  .alignInputs-vertical {
    width: 100%;
    justify-content: flex-start;
  }
</style>

<!-- 
This tells the Svelte compiler that this file is a custom element. 
We also have to include the "customElement: true" compiler setting in rollup configuration.
-->
<!-- <svelte:options tag="bancor-conversion-widget" /> -->

<div class="container {orientation}" style={backgroundStyle}>
  <!-- <div class="alignInputs"> -->
  <div class={alignInputs}>
    <Input {orientation} {colors} text="SEND" />
  </div>
  <div class={arrowsContainer}>
    <CompareArrows {orientation} {colors} />
  </div>
  <div class={alignInputs}>
    <Input {orientation} {colors} text="RECEIVE" />
  </div>
  <!-- </div> -->
  <Button {colors}>Convert</Button>

</div>
