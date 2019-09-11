<script>
  import { onMount } from "svelte";
  import Select from "svelte-select";
  import Required from "../utils/Required";
  import SelectItem from "./SelectItem.svelte";

  export let listBgColor = Required("listBgColor");
  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let borderColor = Required("borderColor");
  export let hoverBackgroundColor = Required("hoverBackgroundColor");
  export let tokens = Required("tokens");
  export let open = false;

  $: items = Array.from(tokens.values()).map(token => ({
    value: token.address,
    label: token.name
  }));

  class Item extends SelectItem {
    constructor(ops) {
      super({
        ...ops,
        props: {
          item: ops.props.item,
          tokens,
          backgroundColor: listBgColor,
          hoverColor: hoverBackgroundColor,
          fontColor
        }
      });
    }
  }

  let elem;

  onMount(() => {
    // focus select
    elem.$$.ctx.container.click();
  });

  const style = `
    width: 236px;
    color: ${fontColor};
    border-radius: 5px;
    border: ${borderColor} solid 1px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
    background: ${listBgColor};
    --inputColor: ${fontColor};
    --placeholderColor: ${fontColor};
    --listBackground: ${listBgColor};
    --itemActiveBackground: ${listBgColor};
    --itemHoverBG: ${hoverBackgroundColor};
    --itemIsActiveBG: ${listBgColor};
    --itemIsActiveColor: ${fontColor};
    --clearSelectColor: ${fontColor};
    --clearSelectHoverColor: ${fontColor};
  `;
</script>

<Select
  {items}
  containerStyles={style}
  listOpen={open}
  isFocused={open}
  bind:this={elem}
  {Item}
  on:select />
