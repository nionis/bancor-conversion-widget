<script>
  import { createEventDispatcher } from "svelte";
  import useCssVars from "svelte-css-vars";
  import MdKeyboardArrowDown from "svelte-icons/md/MdKeyboardArrowDown.svelte";
  import Loading from "../Loading.svelte";
  import { Cursor, Opacity } from "../../utils/Colors.js";
  import Required from "../../utils/Required";

  export let fontColor = Required("fontColor");
  export let token = Required("token");
  export let disabled = false;
  export let loading = false;

  $: cssVars = {
    fontColor,
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
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 30px;
    min-width: 85px;
    font-size: calc(30px + 0.35vw);
    opacity: var(--opacity);
    cursor: var(--cursor);
  }

  .container:hover {
    opacity: var(--opacityHover) !important;
  }

  .button {
    display: flex;
    align-items: center;
    padding: 0;
    margin: 0;
    border: none;
    background-color: transparent;
  }

  .arrowContainer {
    height: 40px;
    width: 40px;
    color: var(--fontColor);
  }
</style>

<div class="container" use:useCssVars={cssVars} on:click={onClick}>
  {#if loading}
    <Loading color={fontColor} />
  {:else}
    <div class="button">
      <div style="color: {fontColor};">{token.symbol}</div>
      <div class="arrowContainer">
        <MdKeyboardArrowDown />
      </div>
    </div>
  {/if}
</div>
