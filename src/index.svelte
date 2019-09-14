<script>
  /*
    Our widget component
  */
  import { onMount } from "svelte";
  import { derived, get } from "svelte/store";
  import useCssVars from "svelte-css-vars";
  import MdCompareArrows from "svelte-icons/md/MdCompareArrows.svelte";
  import { init as ethInit } from "./stores/eth";
  import {
    init as registryInit,
    tokens as tokensMap,
    fetchingTokens
  } from "./stores/tokens";
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
  import {
    isOpen as isPopupOpen,
    close as closePopup,
    steps
  } from "./stores/popup.js";
  import Icon from "./components/Icon.svelte";
  import Button from "./components/Button.svelte";
  import Token from "./components/Token.svelte";
  import Select from "./components/Select.svelte";
  import PopUp from "./components/PopUp.svelte";
  import Colors from "./utils/Colors.js";

  export let orientation = "horizontal";
  export let theme = "light";
  export let colors = {};
  export let tokenA = "ETH";
  export let tokenB = "BNT";

  colors = Colors(theme, colors);

  $: cssVars = {
    containerBg: colors.containerBg,
    containerBorder: colors.containerBorder,
    textAlign: orientation === "vertical" ? "100px" : "0px",
    margin: orientation === "vertical" ? "0px" : "19px"
  };

  onMount(async () => {
    // initialize ethStore
    // once networkId is set
    // it will initialize tokensStore
    await ethInit();
  });

  // dynamically update orientation if screen width is less than 800
  const initialOrientation = orientation;
  let offsetWidth;
  $: {
    if (offsetWidth <= 800) {
      orientation = "vertical";
    } else if (offsetWidth > 800 && initialOrientation === "horizontal") {
      orientation = "horizontal";
    }
  }

  // true once default selected tokens are found
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
  $: disabledConvert = $loading || $tokenAInput === "0";

  const activeIndex = derived(steps, _steps => {
    return _steps.findIndex(step => {
      return get(step).success === undefined;
    });
  });

  const swapMessage = "⠀";

  // called when user selects token
  const OnSelect = token => e => {
    const value = e.detail.value;
    if (!$tokensMap.has(value)) return;

    token.update(() => $tokensMap.get(value));

    updateReturn({
      tokenA: selectedTokenA,
      tokenB: selectedTokenB,
      inputA: tokenAInput,
      inputB: tokenBInput
    });
  };

  // called when user updates amount input
  const OnChange = ({ tokenA, tokenB, inputA, inputB }) => e => {
    inputA.update(() => e.target.value || "0");

    updateReturn({
      tokenA,
      tokenB,
      inputA,
      inputB
    });
  };

  // called when user swaps tokens
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
    padding: 10px;
  }

  .horizontal {
    flex-direction: row;
    height: 110px;
  }
  .horizontal > div {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    width: 1225px;
  }

  .vertical {
    flex-direction: column;
    min-width: 375px;
    height: 325px;
    max-width: 800px;
    overflow: hidden;
  }
  .vertical > div {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    width: 450px;
    height: 325px;
  }

  .swapContainer {
    flex-direction: column;
    height: 66px;
    margin-top: var(--margin);
    justify-content: flex-end;
    align-items: center;
    display: flex;
    text-align: center;
    width: 100px;
  }

  .swapText {
    width: 200px;
    margin-left: var(--textAlign);
  }
</style>

<!-- on:close={closePopup} -->
<div bind:offsetWidth>
  {#if $isPopupOpen}
    <PopUp
      bgColor={colors.containerBg}
      fontColor={colors.containerFont}
      borderColor={colors.containerBorder}
      buttonBgColor={colors.buttonBg}
      buttonFontColor={colors.buttonFont}
      buttonBorderColor={colors.buttonBorder}
      steps={$steps}
      activeIndex={$activeIndex} />
  {/if}
  <div class="container {orientation}" use:useCssVars={cssVars}>
    <div>
      <Token
        {orientation}
        {colors}
        text="SEND"
        tokens={$tokensA}
        selectedToken={$selectedTokenA}
        loading={$loading}
        disabled={$loading}
        fetchingTokens={$fetchingTokens}
        on:select={OnSelect(selectedTokenA)}
        value={$tokenAInput}
        on:change={OnChange({
          tokenA: selectedTokenA,
          tokenB: selectedTokenB,
          inputA: tokenAInput,
          inputB: tokenBInput
        })} />
      <div class="swapContainer">
        <Icon
          {orientation}
          color={colors.compareArrows}
          on:click={onSwap}
          disabled={$loading}>
          <MdCompareArrows />

        </Icon>
        {#if swapMessage}
          <div class="swapText">{swapMessage}</div>
        {/if}
      </div>
      <Token
        {orientation}
        {colors}
        text="RECEIVE"
        tokens={$tokensB}
        selectedToken={$selectedTokenB}
        loading={$loading}
        disabled={$loading}
        fetchingTokens={$fetchingTokens}
        on:select={OnSelect(selectedTokenB)}
        value={$tokenBInput}
        on:change={OnChange({
          tokenA: selectedTokenB,
          tokenB: selectedTokenA,
          inputA: tokenBInput,
          inputB: tokenAInput
        })} />
      <Button
        {orientation}
        bgColor={colors.buttonBg}
        fontColor={colors.buttonFont}
        borderColor={colors.buttonBorder}
        on:click={onConvert}
        disabled={disabledConvert}>
        Convert
      </Button>
    </div>
  </div>
</div>
