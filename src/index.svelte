<script>
  import { onMount } from "svelte";
  import { derived, get } from "svelte/store";
  import MdCompareArrows from "svelte-icons/md/MdCompareArrows.svelte";
  import * as ethStore from "./stores/eth";
  import { init as registryInit, tokens as tokensMap } from "./stores/registry";
  import {
    loading as widgetLoading,
    tokenA as selectedTokenA,
    tokenAInput,
    tokensA,
    tokenB as selectedTokenB,
    tokenBInput,
    tokensB,
    convert,
    pairsAreSelected
  } from "./stores/widget.js";
  import Icon from "./components/Icon.svelte";
  import Button from "./components/Button.svelte";
  import Token from "./components/Token.svelte";
  import Select from "./components/Select.svelte";
  import Colors from "./utils/Colors.js";

  export let orientation = "horizontal";
  export let theme = "light";
  export let colors = {};
  export let prefetch = true;
  export let tokenA = "ETH";
  export let tokenB = "BNT";

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

  const gettingSelectedTokens = derived(tokensMap, _tokensMap => {
    if (get(pairsAreSelected)) return false;

    const tokens = Array.from(_tokensMap.values());

    const foundA = tokens.find(t => t.symbol === tokenA);
    const foundB = tokens.find(t => t.symbol === tokenB);

    if (foundA) {
      selectedTokenA.update(() => foundA);
    }
    if (foundB) {
      selectedTokenB.update(() => foundB);
    }

    return !(foundA && foundB);
  });

  const loading = derived([gettingSelectedTokens, widgetLoading], ([a, b]) => {
    return a || b;
  });

  const OnSelect = token => e => {
    token.update(() => $tokensMap.get(e.detail.value));
  };

  const OnChange = tokenInput => e => {
    tokenInput.update(() => e.target.value);
  };

  const onSwap = () => {
    const _selectedTokenA = $selectedTokenA;
    const _selectedTokenB = $selectedTokenB;

    selectedTokenA.update(() => _selectedTokenB);
    selectedTokenB.update(() => _selectedTokenA);
  };

  const onConvert = e => {
    convert();
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
    selectedToken={$selectedTokenA}
    loading={$loading}
    disabled={$loading}
    on:select={OnSelect(selectedTokenA)}
    value={$tokenAInput}
    on:change={OnChange(tokenAInput)} />
  <Icon
    {orientation}
    color={colors.compareArrows}
    on:click={onSwap}
    disabled={$loading}>
    <MdCompareArrows />
  </Icon>
  <Token
    {orientation}
    {colors}
    text="RECEIVE"
    tokens={$tokensB}
    selectedToken={$selectedTokenB}
    loading={$loading}
    disabled={$loading}
    on:select={OnSelect(selectedTokenB)}
    value={$tokenBInput}
    on:change={OnChange(tokenBInput)} />
  <Button
    bgColor={colors.buttonBg}
    fontColor={colors.buttonFont}
    borderColor={colors.buttonBorder}
    on:click={onConvert}
    disabled={$loading}>
    Convert
  </Button>
</div>
