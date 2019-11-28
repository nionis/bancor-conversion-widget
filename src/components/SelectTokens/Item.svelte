<script>
  import useCssVars from "svelte-css-vars";
  import Loading from "../Loading.svelte";
  import { Cursor } from "../../utils/Colors.js";
  import Required from "../../utils/Required";

  export let item = Required("item");
  export let tokens = Required("tokens");
  export let backgroundColor = Required("backgroundColor");
  export let hoverColor = Required("hoverColor");
  export let fontColor = Required("fontColor");
  export let selectBorder = Required("selectBorder");
  export let disabledFont = Required("fontColor");
  export let isLoading = true;

  $: token = (!isLoading && tokens.get(item.value)) || {};

  $: cssVars = {
    textAlign: isLoading ? "center" : "left",
    backgroundColor,
    hoverColor: isLoading ? backgroundColor : hoverColor,
    fontColor,
    selectBorder,
    disabledFont,
    cursor: Cursor({ loading: isLoading })
  };
</script>

<style>
  .container {
    display: flex;
    justify-content: flex-start;
    flex-direction: row;
    align-items: center;
    text-align: var(--textAlign);
    width: 100%;
    height: 50px;
    background-color: var(--backgroundColor);
    color: var(--fontColor);
    cursor: var(--cursor);
    border-bottom: 1px solid var(--selectBorder);
  }

  .container:hover {
    background-color: var(--hoverColor);
  }

  .imgContainer {
    border-radius: 50px;
    padding-left: 10px;
    padding-right: 10px;
  }

  img {
    height: 30px;
    border-radius: 50px;
    margin: 10px;
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  {#if isLoading}
    <Loading color={fontColor} />
  {:else}
    <div class="imgContainer">
      <img src={token.img} alt="{token.symbol} logo" />
    </div>
    <div class="label">{item.label}</div>
  {/if}
</div>
