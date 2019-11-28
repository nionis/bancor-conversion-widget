<script>
  /*
    Our widget component
  */

  import { onMount } from "svelte";
  import { derived, get } from "svelte/store";
  import useCssVars from "svelte-css-vars";
  import { Address } from "web3x-es/address";
  import { fromWei } from "web3x-es/utils";
  import MdCompareArrows from "svelte-icons/md/MdCompareArrows.svelte";
  import * as ethStore from "./stores/eth";
  import {
    init as registryInit,
    tokens as tokensMap,
    fetchingTokens
  } from "./stores/tokens";
  import {
    loading as widgetLoading,
    tokenSend as selectedTokenSend,
    tokenSendInput,
    tokensSend,
    tokenReceive as selectedTokenReceive,
    tokenReceiveInput,
    tokensReceive,
    convert,
    pairsAreSelected,
    updateReturn,
    errorMsg as widgetErrorMsg,
    affiliate as widgetAffiliate,
    affiliateFee
  } from "./stores/widget.js";
  import {
    isOpen as isStepsOpen,
    open as openSteps,
    close as closeSteps,
    steps,
    onStep,
    done
  } from "./stores/steps.js";
  import Icon from "./components/Icon.svelte";
  import Button from "./components/Button.svelte";
  import Token from "./components/Token.svelte";
  import SelectTokens from "./components/SelectTokens/index.svelte";
  import ConvertSteps from "./components/ConvertSteps/index.svelte";
  import Summary from "./components/Summary.svelte";
  import Link from "./components/Link.svelte";
  import Colors, { colors as defaultColors } from "./utils/Colors.js";
  import { emptyChar } from "./utils";
  import { addresses as defaultAddresses } from "./env";

  export let tokenSend = "ETH";
  export let tokenReceive = "BNT";
  export let colors = defaultColors;
  export let showRelayTokens = false;
  export let addresses = defaultAddresses;
  export let affiliate = undefined;

  // merge provided colors with default colors
  colors = Colors(colors);

  // validate affiliate data
  if (affiliate) {
    const { account, fee } = affiliate;

    if (typeof account !== "string" || !Address.isAddress(account)) {
      throw Error(`affiliate account '${account}' is not a valid address`);
    } else if (typeof fee !== "number" || fee > 3) {
      throw Error(`affiliate fee '${fee}' is not a valid fee, max 3%`);
    }

    widgetAffiliate.update(() => affiliate);
  }

  $: cssVars = {
    containerBg: colors.containerBg,
    summaryBg: colors.summaryBg,
    textAlign: "0px",
    margin: "19px"
  };

  onMount(async () => {
    // when network changes, reinitialize
    ethStore.networkId.subscribe(_networkId => {
      if (_networkId) {
        registryInit(get(ethStore.eth), {
          showRelayTokens,
          addresses
        });
      }
    });

    // initialize ethStore
    await ethStore.init();
  });

  // true once default selected tokens are found
  const gettingSelectedTokens = derived(tokensMap, _tokensMap => {
    if ($pairsAreSelected) return false;

    const tokens = Array.from(_tokensMap.values());
    const foundSendToken = tokens.find(t => t.symbol === tokenSend);
    const foundReceiveToken = tokens.find(t => t.symbol === tokenReceive);

    if (foundSendToken) {
      selectedTokenSend.update(() => foundSendToken);
    }
    if (foundReceiveToken) {
      selectedTokenReceive.update(() => foundReceiveToken);
    }

    return !(foundSendToken && foundReceiveToken);
  });

  const loading = derived([gettingSelectedTokens, widgetLoading], ([a, b]) => {
    return Boolean(a || b);
  });
  const disabledConvert = derived(
    [loading, tokenSendInput],
    ([$loading, $tokenSendInput]) => {
      return $loading || $tokenSendInput === "0";
    }
  );

  const swapMessage = emptyChar;

  let isSelectOpen = false;
  let selectingForTokenName = null;
  $: selectingForToken =
    selectingForTokenName === "send" ? selectedTokenSend : selectedTokenReceive;
  $: selectingList =
    selectingForTokenName === "send" ? tokensSend : tokensReceive;

  const OpenSelect = sendOrReceive => () => {
    isSelectOpen = true;
    selectingForTokenName = sendOrReceive;
  };

  const closeSelect = () => {
    isSelectOpen = false;
  };

  // called when user selects token
  const onSelect = e => {
    const value = e.detail.value;
    if (!$tokensMap.has(value)) return;

    selectingForToken.update(() => $tokensMap.get(value));

    updateReturn({
      tokenSend: selectedTokenSend,
      tokenReceive: selectedTokenReceive,
      inputSend: tokenSendInput,
      inputReceive: tokenReceiveInput
    });

    closeSelect();
  };

  // called when user updates amount input
  const OnAmount = ({
    tokenSend,
    tokenReceive,
    inputSend,
    inputReceive
  }) => e => {
    inputSend.update(() => e.detail || "0");

    updateReturn({
      tokenSend,
      tokenReceive,
      inputSend,
      inputReceive
    });
  };

  // called when user swaps tokens
  const onSwap = () => {
    const _selectedTokenSend = $selectedTokenSend;
    const _selectedTokenReceive = $selectedTokenReceive;

    selectedTokenSend.update(() => _selectedTokenReceive);
    selectedTokenReceive.update(() => _selectedTokenSend);

    updateReturn({
      tokenSend: selectedTokenSend,
      tokenReceive: selectedTokenReceive,
      inputSend: tokenSendInput,
      inputReceive: tokenReceiveInput
    });
  };

  const onConvert = async () => {
    await convert(get(tokenSendInput));

    if (get(steps).length === 1) {
      const step = get(steps)[0];
      get(step).fn();
    }
  };

  const firstStep = derived(steps, $steps => {
    if ($steps.length === 1) return get($steps[0]);
    return undefined;
  });
  const buttonLoading = derived(firstStep, $firstStep => {
    if ($firstStep) return $firstStep.pending;
    return false;
  });
  const buttonDisabled = derived(
    [buttonLoading, disabledConvert],
    ([$buttonLoading, $disabledConvert]) => {
      return $buttonLoading || $disabledConvert;
    }
  );
  const buttonMessage = derived(
    [firstStep, widgetErrorMsg],
    ([$firstStep, $widgetErrorMsg]) => {
      if ($widgetErrorMsg)
        return {
          type: "text",
          text: $widgetErrorMsg
        };
      if ($firstStep && $firstStep.txHash)
        return {
          type: "url",
          url: `https://etherscan.io/tx/${$firstStep.txHash}`
        };

      return undefined;
    }
  );
</script>

<style>
  .container {
    display: flex;
    align-items: center;
    width: 450px;
    height: 600px;
    background-color: var(--summaryBg);
  }

  .tokenContainer {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: var(--summaryBg);
  }

  .positionSwap {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-right: 45px;
    box-sizing: border-box;
  }

  .swapContainer {
    height: 50px;
    width: 50px;
    display: flex;
    background: white;
    border: 2px solid #0d1a2c;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    position: absolute;
  }

  .swapText {
    width: 200px;
    margin-left: var(--textAlign);
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  {#if $isStepsOpen}
    <ConvertSteps
      bgColor={colors.containerBg}
      fontColor={colors.containerFont}
      buttonBgColor={colors.buttonBg}
      buttonFontColor={colors.buttonFont}
      disabledFont={colors.disabledFont}
      steps={$steps}
      activeIndex={$onStep}
      on:close={closeSteps} />
  {:else if isSelectOpen}
    <SelectTokens
      bgColor={colors.containerBg}
      fontColor={colors.containerFont}
      disabledFont={colors.disabledFont}
      selectBorder={colors.selectBorder}
      hoverBackgroundColor={colors.hoverBackgroundColor}
      on:close={closeSelect}
      on:select={onSelect}
      loading={$fetchingTokens}
      tokens={$selectingList} />
  {:else}
    <div class="tokenContainer">
      <Token
        title="SEND"
        amount={$tokenSendInput}
        token={$selectedTokenSend}
        bgColor={colors.topTokenBg}
        fontColor={colors.topTokenFont}
        loading={$loading}
        disabled={$loading}
        on:open={OpenSelect('send')}
        on:amount={OnAmount({
          tokenSend: selectedTokenSend,
          tokenReceive: selectedTokenReceive,
          inputSend: tokenSendInput,
          inputReceive: tokenReceiveInput
        })} />

      <div class="positionSwap">
        <div class="swapContainer">
          <Icon
            size="50px"
            color={colors.compareArrows}
            on:click={onSwap}
            disabled={$loading}>
            <MdCompareArrows />
          </Icon>
          {#if swapMessage}
            <div class="swapText">{swapMessage}</div>
          {/if}
        </div>
      </div>

      <Token
        title="RECEIVE"
        amount={$tokenReceiveInput}
        token={$selectedTokenReceive}
        bgColor={colors.bottomTokenBg}
        fontColor={colors.bottomTokenFont}
        loading={$loading}
        disabled={$loading}
        on:open={OpenSelect('receive')}
        on:amount={OnAmount({
          tokenSend: selectedTokenReceive,
          tokenReceive: selectedTokenSend,
          inputSend: tokenReceiveInput,
          inputReceive: tokenSendInput
        })} />

      <Summary amount={$tokenSendInput} fee={fromWei($affiliateFee, 'ether')} />

      <Button
        bgColor={colors.buttonBg}
        fontColor={colors.buttonFont}
        on:click={onConvert}
        disabled={$buttonDisabled}
        loading={$buttonLoading}>
        Convert
        <span slot="message">
          {#if $buttonMessage}
            {#if $buttonMessage.type == 'url'}
              <Link url={$buttonMessage.url} fontColor={colors.bottomTokenFont}>
                etherscan
              </Link>
            {:else}{$buttonMessage.text}{/if}
          {/if}
        </span>
      </Button>
    </div>
  {/if}
</div>
