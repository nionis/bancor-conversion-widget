<script>
  /*
    Token
    The token component is used for displaying tokenSend and tokenReceive,
    it handles selecting a new token and changing a token's amount.
  */

  import { createEventDispatcher } from "svelte";
  import Label from "./Label.svelte";
  import Input from "./Input.svelte";
  import OpenSelect from "./SelectTokens/Open.svelte";
  import Required from "../utils/Required";
  import { emptyChar } from "../utils";

  export let title = Required("title");
  export let amount = Required("amount");
  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let loading = false;
  export let disabled = false;
  export let message = emptyChar;
  // default selected token (should never show)
  export let token = {
    name: "?",
    symbol: "?",
    img: ""
  };

  const dispatch = createEventDispatcher();

  const onOpen = () => {
    dispatch("open");
  };

  const onAmount = e => {
    dispatch("amount", e.target.value);
  };
</script>

<style>
  .message {
    text-align: center;
  }
</style>

<Label {bgColor} {fontColor} text={title}>
  <Input {fontColor} value={amount} {disabled} on:change={onAmount} />
  <OpenSelect {token} {fontColor} {loading} {disabled} on:click={onOpen} />
  {#if message}
    <div class="message">{message}</div>
  {/if}
</Label>
