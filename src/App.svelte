<script>
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import MdCompareArrows from "svelte-icons/md/MdCompareArrows.svelte";
  import * as ethStore from "./stores/eth";
  import { init as registryInit, tokens as tokensMap } from "./stores/registry";
  import { tokenA, tokensA, tokenB, tokensB } from "./stores/widget.js";
  import Icon from "./components/Icon.svelte";
  import Button from "./components/Button.svelte";
  import Token from "./components/Token.svelte";
  import Select from "./components/Select.svelte";
  import Colors from "./utils/Colors.js";

  export let orientation = "horizontal";
  export let theme = "light";
  export let colors = {};
  export let prefetch = true;

  colors = Colors(theme, colors);

  const containerStyle = `
    background-color: ${colors.containerBg};
    border: ${colors.containerBorder} solid 1px;
  `;

  onMount(async () => {
    const eth = await ethStore.init();

    if (prefetch) {
      registryInit(eth);
    }
  });

  const OnSelect = token => e => {
    token.update(() => $tokensMap.get(e.detail.value));
  };

  const onSwap = () => {
    const _tokenA = $tokenA;
    const _tokenB = $tokenB;

    tokenA.update(() => _tokenB);
    tokenB.update(() => _tokenA);
  };
</script>

<style>
  .container {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    border-radius: 10px;
  }

  .horizontal {
    flex-direction: row;
    width: 900px;
    height: 110px;
  }

  .vertical {
    flex-direction: column;
    width: 450px;
    height: 325px;
  }
</style>

<div class="container {orientation}" style={containerStyle}>
  <Token
    {orientation}
    {colors}
    text="SEND"
    tokens={$tokensA}
    selectedToken={$tokenA}
    on:select={OnSelect(tokenA)} />
  <Icon {orientation} color={colors.compareArrows} on:click={onSwap}>
    <MdCompareArrows />
  </Icon>
  <Token
    {orientation}
    {colors}
    text="RECEIVE"
    tokens={$tokensB}
    selectedToken={$tokenB}
    on:select={OnSelect(tokenB)} />
  <Button
    bgColor={colors.buttonBg}
    fontColor={colors.buttonFont}
    borderColor={colors.buttonBorder}>
    Convert
  </Button>
</div>
