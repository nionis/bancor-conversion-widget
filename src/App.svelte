<script>
  import CompareArrows from "./components/CompareArrows.svelte";
  import Button from "./components/Button.svelte";
  import Input from "./components/Input.svelte";
  import Colors from "./Colors.js";

  export let orientation = "horizontal";
  export let theme = "light";
  export let colors = {};

  colors = Colors(theme, colors);

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
  }

  .vertical {
    width: 450px;
    height: 325px;
    flex-direction: column;
  }
</style>

<!-- 
This tells the Svelte compiler that this file is a custom element. 
We also have to include the "customElement: true" compiler setting in rollup configuration.
-->
<!-- <svelte:options tag="bancor-conversion-widget" /> -->

<div class="container {orientation}" style={backgroundStyle}>
  <Input {orientation} {colors} text="SEND" />
  <CompareArrows {orientation} {colors} />
  <Input {orientation} {colors} text="RECEIVE" />
  <Button {colors}>Convert</Button>
</div>
