<script>
  /*
    Token
    The token component is used for displaying tokenSend and tokenReceive,
    it handles selecting a new token and changing a token's amount.
  */

  import { createEventDispatcher } from "svelte";
  import useCssVars from "svelte-css-vars";
  import Input from "./Input.svelte";
  import OpenSelect from "./SelectTokens/Open.svelte";
  import Required from "../utils/Required";
  import { emptyChar } from "../utils";
  import { toFixed } from "../utils/eth";

  export let title = Required("title");
  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let loading = false;
  export let disabled = false;
  export let message = emptyChar;
  export let token = {};
  export let balance = undefined;
  export let amount = undefined;

  const dispatch = createEventDispatcher();

  const onOpen = () => {
    dispatch("open");
  };

  const onAmount = e => {
    dispatch("amount", e.target.value);
  };

  const onSelectBalance = e => {
    dispatch("selectBalance", token.toDisplayAmount(balance));
  };

  $: cssVars = {
    bgColor,
    fontColor
  };
</script>

<style>
  .container {
    display: flex;
    width: 100%;
    height: 150px;
    padding: 20px;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    background-color: var(--bgColor);
    box-sizing: border-box;
  }

  .headerContainer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .title {
    font-size: calc(26px + 0.35vw);
    font-weight: lighter;
    color: var(--fontColor);
  }

  .balance {
    font-size: calc(15px + 0.35vw);
    font-weight: lighter;
    color: var(--fontColor);
  }

  .selectBalance:hover {
    text-decoration: underline;
    cursor: pointer;
  }

  .contentContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }

  .message {
    text-align: center;
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  <div class="headerContainer">
    <span class="title">{title}</span>
    {#if balance}
      <span class="balance">
        Balance:
        <span class="selectBalance" on:click={onSelectBalance}>
          {toFixed(token.toDisplayAmount(balance))}
        </span>
      </span>
    {/if}
  </div>
  <div class="contentContainer">
    <Input {fontColor} value={amount} {disabled} on:change={onAmount} />
    <OpenSelect {token} {fontColor} {loading} {disabled} on:click={onOpen} />
    {#if message}
      <div class="message">{message}</div>
    {/if}
  </div>
</div>
