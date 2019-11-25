<script>
  /*
    SelectTokens
    A list of tokens which can be used to select a send token / receive token
  */

  import { createEventDispatcher } from "svelte";
  import useCssVars from "svelte-css-vars";
  import Select from "svelte-select";
  import MdClose from "svelte-icons/md/MdClose.svelte";
  import Item from "./Item.svelte";
  import Icon from "../Icon.svelte";
  import Required from "../../utils/Required";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let disabledFont = Required("disabledFont");
  export let selectBorder = Required("selectBorder");
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

  const onClose = () => {
    open = false;

    dispatch("close");
  };

  $: cssVars = {
    bgColor,
    disabledFont
  };

  // wrap Item so we can provide it with custom data
  class WrappedItem extends Item {
    constructor(ops) {
      super({
        ...ops,
        props: {
          item: ops.props.item,
          isLoading: ops.props.item.value === loadingItem.value,
          tokens,
          backgroundColor: bgColor,
          hoverColor: hoverBackgroundColor,
          disabledFont,
          selectBorder,
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
      // ignore blur and keep it open
      // dispatch("blur");
      elem.$$.ctx.container.click();
    } else if (!open && !listExists) {
      elem.$$.ctx.container.click();
    }
  }

  $: style = `
    height: 55px;
    width: 100%;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    box-shadow: none;
    color: ${fontColor};
    background: #EDEDED;
    --inputColor: ${fontColor};
    --placeholderColor: ${fontColor};
    --listBackground: ${bgColor};
    --itemActiveBackground: ${bgColor};
    --itemHoverBG: ${hoverBackgroundColor};
    --itemIsActiveBG: ${bgColor};
    --itemIsActiveColor: ${fontColor};
    --clearSelectColor: ${fontColor};
    --clearSelectHoverColor: ${fontColor};
    --listMaxHeight: 400px;
    --listShadow: none;
    --listBorderRadius: 0px;
    --border: none;
    --indicatorColor
    --indicatorFill: pink;
    --indicatorHeight: 30px;;
    --indicatorRight: pink;
    --indicatorStroke: 1px;
    --indicatorTop: pink;
    --indicatorWidth: pink;
  `;
</script>

<style>
  .container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    box-sizing: border-box;

    height: 100%;
    width: 100%;
    background: var(--bgColor);
  }
  .selectContainer {
    padding-left: 20px;
    padding-right: 20px;
    width: 100%;
    box-sizing: border-box;
  }
  .iconContainer {
    display: flex;
    width: 100%;
    justify-content: flex-end;
  }
  h1 {
    font-weight: normal;
    padding-bottom: 20px;
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  <div class="iconContainer">
    <Icon color={disabledFont} on:click={onClose}>
      <MdClose />
    </Icon>
  </div>

  <h1>Conversion Steps</h1>
  <div class="selectContainer">
    <Select
      {items}
      Item={WrappedItem}
      containerStyles={style}
      bind:this={elem}
      bind:listOpen={open}
      placeholder="Search name, symbol"
      on:select />
  </div>
</div>
