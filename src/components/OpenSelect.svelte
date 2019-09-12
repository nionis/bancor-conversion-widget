<script>
  import { createEventDispatcher } from "svelte";
  import useCssVars from "svelte-css-vars";
  import Select from "svelte-select";
  import MdArrowDropDown from "svelte-icons/md/MdArrowDropDown.svelte";
  import Loading from "./Loading.svelte";
  import Required from "../utils/Required";
  import { Cursor, Opacity } from "../utils/Colors.js";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let borderColor = Required("borderColor");
  export let arrowColor = Required("arrowColor");
  export let token = Required("token");
  export let disabled = false;
  export let loading = false;

  $: cssVars = {
    bgColor,
    fontColor,
    borderColor,
    arrowColor,
    cursor: Cursor({ disabled }),
    opacity: Opacity({ disabled }),
    opacityHover: Opacity({ hover: true })
  };

  const dispatch = createEventDispatcher();

  const onClick = e => {
    if (disabled) return;

    dispatch("click", e);
  };
</script>

<style>
  img {
    border-radius: 50px;
    height: 25px;
    margin: 4px;
  }

  .container {
    background-color: var(--bgColor);
    border: var(--borderColor) solid 1px;
    opacity: var(--opacity);
    cursor: var(--cursor);
    height: 30px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 6px;
  }

  .container:hover {
    opacity: var(--opacityHover) !important;
  }

  .button {
    border: none;
    background-color: transparent;
    padding: 0;
    margin: 0;
    width: 85px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .arrowContainer {
    height: 21px;
    width: 16px;
    color: var(--arrowColor);
  }
</style>

<div class="container" on:click={onClick} use:useCssVars={cssVars}>
  {#if !loading}
    <div class="button">
      <img src={token.img} alt="{token.symbol} logo" />
      <div style="color: {fontColor};">{token.symbol}</div>
      <div class="arrowContainer">
        <MdArrowDropDown />
      </div>
    </div>
  {:else}
    <Loading color={arrowColor} />
  {/if}

</div>
