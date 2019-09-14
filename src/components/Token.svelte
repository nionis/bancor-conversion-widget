<script>
  /*
    Using NumberInput, OpenSelect, Select
    to represent one token
  */

  import { createEventDispatcher } from "svelte";
  import Label from "./Label.svelte";
  import NumberInput from "./NumberInput.svelte";
  import OpenSelect from "./OpenSelect.svelte";
  import Select from "./Select.svelte";
  import Required from "../utils/Required";

  export let orientation = Required("orientation");
  export let colors = Required("colors");
  export let text = Required("text");
  export let tokens = Required("tokens");
  export let value = Required("value");
  export let loading = false;
  export let fetchingTokens = false;
  export let disabled = false;
  export let message = "⠀";
  // default selected token (should never show)
  export let selectedToken = {
    name: "?",
    symbol: "?",
    img: ""
  };

  let open = false;

  const dispatch = createEventDispatcher();

  const onOpen = () => {
    open = true;

    dispatch("open");
  };

  const onClose = () => {
    open = false;

    dispatch("close");
  };

  const onSelect = e => {
    onClose();
    dispatch("select", e.detail);
  };
</script>

<style>
  .message {
    text-align: center;
  }
</style>

<Label {orientation} color={colors.containerFont} {text}>
  {#if !open}
    <NumberInput
      bgColor={colors.inputBg}
      fontColor={colors.inputFont}
      borderColor={colors.inputBorder}
      {value}
      {disabled}
      on:change>
      <OpenSelect
        bgColor={colors.selectBg}
        fontColor={colors.selectFont}
        borderColor={colors.selectBorder}
        arrowColor={colors.selectArrow}
        token={selectedToken}
        {loading}
        {disabled}
        on:click={onOpen} />
    </NumberInput>
  {:else}
    <Select
      {tokens}
      bgColor={colors.selectBg}
      fontColor={colors.selectFont}
      borderColor={colors.inputBorder}
      listBgColor={colors.inputBg}
      hoverBackgroundColor={colors.selectBg}
      loading={fetchingTokens}
      on:focus={onOpen}
      on:blur={onClose}
      on:select={onSelect} />
  {/if}
  {#if message}
    <div class="message">{message}</div>
  {/if}
</Label>
