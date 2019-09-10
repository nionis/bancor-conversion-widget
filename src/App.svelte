<script>
  import { onMount } from "svelte";
  import MdCompareArrows from "svelte-icons/md/MdCompareArrows.svelte";
  import * as ethStore from "./stores/eth";
  import { init as registryInit, tokens as tokensMap } from "./stores/registry";
  import { tokenA, tokensA, tokenB, tokensB } from "./stores/widget.js";
  import Icon from "./components/Icon.svelte";
  import Button from "./components/Button.svelte";
  import Input from "./components/Input.svelte";
  import Colors from "./utils/Colors.js";

  export let orientation = "horizontal";
  export let theme = "light";
  export let colors = {};
  export let prefetch = true;

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

  onMount(async () => {
    const eth = await ethStore.init();

    if (prefetch) {
      registryInit(eth);
    }
  });
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
  <div class={alignInputs}>
    <Input {orientation} {colors} tokens={tokensA} text="SEND" />
  </div>
  <div class={arrowsContainer}>
    <Icon {orientation} color={colors.compareArrows}>
      <MdCompareArrows />
    </Icon>
  </div>
  <div class={alignInputs}>
    <Input {orientation} {colors} tokens={tokensB} text="RECEIVE" />
  </div>
  <Button {colors}>Convert</Button>
</div>
