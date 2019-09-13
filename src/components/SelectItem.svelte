<script>
  /*
    Used by "Select" component's list
  */
  import useCssVars from "svelte-css-vars";
  import Required from "../utils/Required";
  import Loading from "./Loading.svelte";
  import { Cursor } from "../utils/Colors.js";

  export let item = Required("item");
  export let tokens = Required("tokens");
  export let backgroundColor = Required("backgroundColor");
  export let hoverColor = Required("hoverColor");
  export let fontColor = Required("fontColor");
  export let isLoading = false;

  // TODO: investigate why sometimes token is not found
  $: token = (!isLoading && tokens.get(item.value)) || {};

  $: cssVars = {
    textAlign: isLoading ? "center" : "left",
    backgroundColor,
    hoverColor: isLoading ? backgroundColor : hoverColor,
    fontColor,
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
    width: 270px;
    height: 50px;
    background-color: var(--backgroundColor);
    color: var(--fontColor);
    cursor: var(--cursor);
  }

  img {
    height: 30px;
    border-radius: 50px;
    margin: 10px;
  }

  .container:hover {
    background-color: var(--hoverColor);
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  {#if isLoading}
    <Loading color={fontColor} />
  {:else}
    <img src={token.img} alt="{token.symbol} logo" />
    <div class="label">{item.label}</div>
  {/if}
</div>
