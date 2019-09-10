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
  export let tokens = Required("items");
  export let open = false;
  export let selectedToken = {
    name: "?",
    symbol: "?",
    img: ""
  };

  const dispatch = createEventDispatcher();

  const onSelect = e => {
    open = false;
    dispatch("select", e.detail);
  };
</script>

<Label {orientation} color={colors.containerFont} {text}>
  {#if !open}
    <NumberInput
      bgColor={colors.inputBg}
      fontColor={colors.inputFont}
      borderColor={colors.inputBorder}>
      <OpenSelect
        bgColor={colors.selectBg}
        fontColor={colors.selectFont}
        borderColor={colors.selectBorder}
        arrowColor={colors.selectArrow}
        token={selectedToken}
        on:click={() => (open = true)} />
    </NumberInput>
  {:else}
    <Select
      items={tokens}
      bgColor={colors.selectBg}
      fontColor={colors.selectFont}
      borderColor={colors.selectBorder}
      listBgColor={colors.inputBg}
      on:select={onSelect}
      {open} />
  {/if}
</Label>
