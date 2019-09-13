<script>
  import useCssVars from "svelte-css-vars";
  import Required from "../utils/Required";

  export let item = Required("item");
  export let tokens = Required("tokens");
  export let backgroundColor = Required("backgroundColor");
  export let hoverColor = Required("hoverColor");
  export let fontColor = Required("fontColor");

  // TODO: investigate
  $: token = tokens.get(item.value) || {};

  $: cssVars = {
    backgroundColor,
    hoverColor,
    fontColor
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
    text-align: left;
    color: var(--fontColor);
    cursor: pointer;
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
  <img src={token.img} alt="{token.symbol} logo" />
  <div class="label">{item.label}</div>
</div>
