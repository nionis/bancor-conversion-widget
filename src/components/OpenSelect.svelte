<script>
  /*
    Indicates which token is selected,
    when clicked it toggles "Select" component
  */
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
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 30px;
    width: 85px;
    border: var(--borderColor) solid 1px;
    background-color: var(--bgColor);
    opacity: var(--opacity);
    cursor: var(--cursor);
    border-radius: 5px;
    margin-right: 6px;
  }

  .container:hover {
    opacity: var(--opacityHover) !important;
  }

  .button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 85px;
    padding: 0;
    margin: 0;
    border: none;
    background-color: transparent;
  }

  .arrowContainer {
    height: 21px;
    width: 16px;
    color: var(--arrowColor);
  }
</style>

<div class="container" on:click={onClick} use:useCssVars={cssVars}>
  {#if loading}
    <Loading color={arrowColor} />
  {:else}
    <div class="button">
      <img src={token.img} alt="{token.symbol} logo" />
      <div style="color: {fontColor};">{token.symbol}</div>
      <div class="arrowContainer">
        <MdArrowDropDown />
      </div>
    </div>
  {/if}

</div>
