<script>
  import { onMount } from "svelte";
  import { derived, get } from "svelte/store";
  import useCssVars from "svelte-css-vars";
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
    pairsAreSelected,
    updateReturn
  } from "./stores/widget.js";
  import Icon from "./components/Icon.svelte";
  import Button from "./components/Button.svelte";
  import Token from "./components/Token.svelte";
  import Select from "./components/Select.svelte";
  import Colors from "./utils/Colors.js";

  export let orientation = "horizontal";
  export let theme = "light";
  export let colors = {};
  export let tokenA = "ETH";
  export let tokenB = "BNT";

  colors = Colors(theme, colors);

  $: cssVars = {
    containerBg: colors.containerBg,
    containerBorder: colors.containerBorder
  };

  onMount(async () => {
    const eth = await ethStore.init();
    registryInit(eth);
  });

  const gettingSelectedTokens = derived(tokensMap, _tokensMap => {
    if ($pairsAreSelected) return false;

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
    return Boolean(a || b);
  });

  const OnSelect = token => e => {
    token.update(() => $tokensMap.get(e.detail.value));

    updateReturn({
      tokenA: selectedTokenA,
      tokenB: selectedTokenB,
      inputA: tokenAInput,
      inputB: tokenBInput
    });
  };

  const OnChange = ({ tokenA, tokenB, inputA, inputB }) => e => {
    inputA.update(() => e.target.value);

    updateReturn({
      tokenA,
      tokenB,
      inputA,
      inputB
    });
  };

  const onSwap = () => {
    const _selectedTokenA = $selectedTokenA;
    const _selectedTokenB = $selectedTokenB;

    selectedTokenA.update(() => _selectedTokenB);
    selectedTokenB.update(() => _selectedTokenA);

    updateReturn({
      tokenA: selectedTokenA,
      tokenB: selectedTokenB,
      inputA: tokenAInput,
      inputB: tokenBInput
    });
  };

  const onConvert = e => {
    convert(get(tokenAInput));
  };
</script>

<style>
  .container {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    border-radius: 10px;
    background-color: var(--containerBg);
    border: var(--containerBorder) solid 1px;
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

<div class="container {orientation}" use:useCssVars={cssVars}>
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
    on:change={OnChange({
      tokenA: selectedTokenA,
      tokenB: selectedTokenB,
      inputA: tokenAInput,
      inputB: tokenBInput
    })} />
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
    on:change={OnChange({
      tokenA: selectedTokenB,
      tokenB: selectedTokenA,
      inputA: tokenBInput,
      inputB: tokenAInput
    })} />
  <Button
    bgColor={colors.buttonBg}
    fontColor={colors.buttonFont}
    borderColor={colors.buttonBorder}
    on:click={onConvert}
    disabled={$loading}>
    Convert
  </Button>
</div>
