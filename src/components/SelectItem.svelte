<script>
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

  // TODO: investigate
  $: token = (!isLoading && tokens.get(item.value)) || {};

  $: cssVars = {
    backgroundColor,
    hoverColor: isLoading ? backgroundColor : hoverColor,
    fontColor,
    textAlign: isLoading ? "center" : "left",
    cursor: Cursor({ loading: isLoading })
  };
</script>

<style>
  .container {
    background-color: var(--backgroundColor);
    width: 270px;
    height: 50px;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    display: flex;
    text-align: var(--textAlign);
    color: var(--fontColor);
    cursor: var(--cursor);
  }

  img {
    border-radius: 50px;
    height: 30px;
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
