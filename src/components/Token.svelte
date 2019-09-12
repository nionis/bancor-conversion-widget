<script>
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
  export let selectedToken = {
    name: "?",
    symbol: "?",
    img: ""
  };

  let open = false;

  const dispatch = createEventDispatcher();

  const onOpen = () => {
    console.log("open");
    open = true;
  };

  const onClose = () => {
    console.log("close");
    open = false;
  };

  const onSelect = e => {
    console.log("select");
    onClose();
    dispatch("select", e.detail);
  };
</script>

<Label {orientation} color={colors.containerFont} {text}>
  {#if !open}
    <NumberInput
      bgColor={colors.inputBg}
      fontColor={colors.inputFont}
      borderColor={colors.inputBorder}
      {value}
      on:change>
      <OpenSelect
        bgColor={colors.selectBg}
        fontColor={colors.selectFont}
        borderColor={colors.selectBorder}
        arrowColor={colors.selectArrow}
        token={selectedToken}
        {loading}
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
      on:blur={onClose}
      on:select={onSelect} />
  {/if}
</Label>
