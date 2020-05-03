<script>
  /*
    Our widget component
  */

  import { onMount } from "svelte";
  import { writable, derived, get } from "svelte/store";
  import useCssVars from "svelte-css-vars";
  import Web3 from "web3";
  import BigNumber from "bignumber.js";
  import MdCompareArrows from "svelte-icons/md/MdCompareArrows.svelte";
  import {
    init as ethStoreInit,
    networkId as ethStoreNetworkId,
    eth as ethStoreEth
  } from "./stores/eth";
  import {
    init as registryInit,
    tokens as tokensMap,
    bntToken as bntTokenInstance,
    fetchingTokens
  } from "./stores/tokens";
  import {
    loading as widgetLoading,
    tokenSend as selectedTokenSend,
    tokenSendInput,
    tokenSendBalance,
    tokensSend,
    tokenReceive as selectedTokenReceive,
    tokenReceiveInput,
    tokensReceive,
    convert,
    pairsAreSelected,
    updateBalance,
    updateReturn,
    errorMsg as widgetErrorMsg,
    affiliate as widgetAffiliate,
    affiliateFee,
    success
  } from "./stores/widget.js";
  import {
    isOpen as isStepsOpen,
    open as openSteps,
    close as closeSteps,
    steps,
    onStep
  } from "./stores/steps.js";
  import Icon from "./components/Icon.svelte";
  import Button from "./components/Button.svelte";
  import Token from "./components/Token.svelte";
  import SelectTokens from "./components/SelectTokens/index.svelte";
  import ConvertSteps from "./components/ConvertSteps/index.svelte";
  import Success from "./components/ConvertSteps/Success.svelte";
  import Summary from "./components/Summary.svelte";
  import Link from "./components/Link.svelte";
  import Initializing from "./components/Initializing.svelte";
  import Colors, { colors as defaultColors } from "./utils/Colors.js";
  import { emptyChar } from "./utils";
  import { fromDecimals } from "./utils/eth";
  import { addresses as defaultAddresses } from "./env";

  export let tokenSend = "ETH";
  export let tokenReceive = "BNT";
  export let colors = defaultColors;
  export let showRelayTokens = false;
  export let addresses = defaultAddresses;
  export let affiliate = undefined;
  export let onChange = undefined;

  // merge provided colors with default colors
  colors = Colors(colors);

  // validate affiliate data
  if (affiliate) {
    const { account, fee } = affiliate;

    if (typeof account !== "string" || !Web3.utils.isAddress(account)) {
      throw Error(`affiliate account '${account}' is not a valid address`);
    } else if (typeof fee !== "number" || fee > 3) {
      throw Error(`affiliate fee '${fee}' is not a valid fee, max 3%`);
    }

    widgetAffiliate.update(() => affiliate);
  }

  onMount(async () => {
    // when network changes, reinitialize
    ethStoreNetworkId.subscribe(_networkId => {
      if (_networkId) {
        registryInit(get(ethStoreEth), {
          showRelayTokens,
          addresses
        });
      }
    });

    // initialize ethStore
    await ethStoreInit();
  });

  // true once default selected tokens are found
  const gettingSelectedTokens = derived(tokensMap, _tokensMap => {
    if ($pairsAreSelected) return false;

    const tokens = Array.from(_tokensMap.values());
    const foundSendToken = tokens.find(t => t.symbol === tokenSend);
    const foundReceiveToken = tokens.find(t => t.symbol === tokenReceive);

    if (foundSendToken) {
      selectedTokenSend.update(() => foundSendToken);
      updateBalance(selectedTokenSend);
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
      return $loading || !$tokenSendInput || $tokenSendInput === "0";
    }
  );

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

    // update tokenSend's balance
    updateBalance(selectedTokenSend);

    // emit changes
    if (onChange) {
      onChange({
        tokenSend: get(selectedTokenSend),
        tokenReceive: get(selectedTokenReceive)
      });
    }

    closeSelect();
  };

  $: bntToken = $bntTokenInstance && $tokensMap.get($bntTokenInstance.address);

  // called when user updates amount input
  const OnAmount = ({
    tokenSend,
    tokenReceive,
    inputSend,
    inputReceive
  }) => e => {
    const rawAmount = e.detail;
    if (!rawAmount) return;

    const amount = new BigNumber(rawAmount).toString();
    const smallest = get(tokenSend).toSmallestAmount(amount);
    const isValid = new BigNumber(smallest).gt("1");
    if (!isValid) return;

    inputSend.update(() => rawAmount);

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

    // emit changes
    if (onChange) {
      onChange({
        tokenSend: _selectedTokenReceive,
        tokenReceive: _selectedTokenSend
      });
    }

    updateReturn({
      tokenSend: selectedTokenSend,
      tokenReceive: selectedTokenReceive,
      inputSend: tokenSendInput,
      inputReceive: tokenReceiveInput
    });

    // update tokenSend's balance
    updateBalance(selectedTokenSend);
  };

  const onConvert = async () => {
    await convert(get(tokenSendInput));

    if (get(steps).length === 1) {
      const step = get(steps)[0];
      get(step).fn();
    }
  };

  let firstStep;
  let lastStep;
  let firstStepSub;
  let lastStepSub;
  let isSingleStep = false;
  let firstStepIsPending = writable(false);
  let lastStepTxHash = writable(undefined);
  let lastStepError = writable(undefined);

  steps.subscribe($steps => {
    const hasSteps = $steps.length > 0;
    isSingleStep = $steps.length === 1;
    const _firstStep = hasSteps ? $steps[0] : undefined;
    const _lastStep = hasSteps ? $steps[$steps.length - 1] : undefined;

    if (!firstStep || firstStep != _firstStep) {
      firstStep = _firstStep;

      if (firstStepSub) {
        firstStepSub();
        firstStepSub = undefined;
      }
    }
    if (!lastStep || lastStep != _lastStep) {
      lastStep = _lastStep;

      if (lastStepSub) {
        lastStepSub();
        lastStepSub = undefined;
      }
    }

    if (!firstStepSub && firstStep) {
      firstStepSub = firstStep.subscribe($step => {
        firstStepIsPending.update(() => $step.pending);
      });
    }

    if (!lastStepSub && lastStep) {
      lastStepSub = lastStep.subscribe($step => {
        lastStepTxHash.update(() => $step.txHash);
        lastStepError.update(() => $step.error);
      });
    }
  });

  const buttonDisabled = derived(
    [disabledConvert, firstStepIsPending],
    ([$disabledConvert, $firstStepIsPending]) => {
      return $disabledConvert || ($firstStepIsPending && isSingleStep);
    }
  );

  const buttonError = derived(
    [widgetErrorMsg, lastStepError],
    ([$widgetErrorMsg, $lastStepError]) => {
      if ($widgetErrorMsg) return $widgetErrorMsg;
      if ($lastStepError) return $lastStepError.message;

      return undefined;
    }
  );

  const onSuccessClose = () => {
    success.update(() => false);
    closeSteps();
  };

  $: cssVars = {
    containerBg: colors.containerBg,
    summaryBg: colors.summaryBg,
    textAlign: "0px",
    margin: "19px"
  };
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

  .btnContainer {
    margin-bottom: 24px;
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  {#if $ethStoreNetworkId === undefined || $ethStoreNetworkId !== 1}
    <Initializing
      bgColor="black"
      fontColor={colors.buttonFont}
      status={$ethStoreNetworkId === undefined ? 'initializing' : 'wrong_networkId'} />
  {/if}

  {#if $success}
    <Success
      bgColor={colors.containerBg}
      fontColor={colors.containerFont}
      successColor={colors.successColor}
      disabledFont={colors.disabledFont}
      buttonBgColor={colors.buttonBg}
      buttonFontColor={colors.buttonFont}
      on:close={onSuccessClose}
      txHash={$lastStepTxHash} />
  {:else if $isStepsOpen}
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
        balance={$tokenSendBalance}
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
        })}
        on:selectBalance={OnAmount({
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

      <Summary
        fontColor={colors.bottomTokenFont}
        amount={$tokenSendInput}
        sendSymbol={$selectedTokenSend && $selectedTokenSend.symbol}
        receiveSymbol={$selectedTokenReceive && $selectedTokenReceive.symbol}
        fee={bntToken && bntToken.toDisplayAmount($affiliateFee)} />

      <div class="btnContainer">
        <Button
          bgColor={colors.buttonBg}
          fontColor={colors.buttonFont}
          on:click={onConvert}
          loading={$firstStepIsPending && isSingleStep}
          disabled={$buttonDisabled}>
          Convert
          <span slot="message">
            {#if $lastStepTxHash}
              <Link
                url={`https://etherscan.io/tx/${$lastStepTxHash}`}
                fontColor={colors.bottomTokenFont}>
                etherscan
              </Link>
            {:else if $buttonError}
              <span>{$buttonError}</span>
            {/if}
          </span>
        </Button>
      </div>
    </div>
  {/if}
</div>
