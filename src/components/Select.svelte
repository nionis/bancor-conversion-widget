<script>
  /*
    Select tokens
  */
  import { onMount, createEventDispatcher } from "svelte";
  import Select from "svelte-select";
  import Required from "../utils/Required";
  import SelectItem from "./SelectItem.svelte";

  export let listBgColor = Required("listBgColor");
  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let borderColor = Required("borderColor");
  export let hoverBackgroundColor = Required("hoverBackgroundColor");
  export let tokens = Required("tokens");
  export let open = true;
  export let loading = false;

  const dispatch = createEventDispatcher();
  // this is a pseudo item to show "loading" withing Select
  const loadingItem = {
    value: "__LOADING",
    label: "loading"
  };

  // wrap SelectItem so we can provide it with custom data
  class Item extends SelectItem {
    constructor(ops) {
      super({
        ...ops,
        props: {
          item: ops.props.item,
          isLoading: ops.props.item.value === loadingItem.value,
          tokens,
          backgroundColor: listBgColor,
          hoverColor: hoverBackgroundColor,
          fontColor
        }
      });
    }
  }

  $: items = (() => {
    const _items = Array.from(tokens.values()).map(token => ({
      value: token.address,
      label: `${token.name} (${token.symbol})`
    }));

    // if we are still fetching tokens, add pseudo "loading" item
    if (loading) {
      _items.unshift(loadingItem);
    }

    return _items;
  })();

  let elem;
  let firstTime = true;

  // a workaround for an issue when opening "svelte-select"
  $: {
    const listExists = elem && !elem.$$.ctx.container.querySelector("div");

    if (firstTime && !open && listExists) {
      elem.$$.ctx.container.click();
      firstTime = false;
      dispatch("focus");
    } else if (!open && listExists) {
      dispatch("blur");
    } else if (!open && !listExists) {
      elem.$$.ctx.container.click();
    }
  }

  $: style = `
    height: 45px;
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
  {Item}
  containerStyles={style}
  bind:this={elem}
  bind:listOpen={open}
  placeholder="Search name, symbol"
  on:select />
