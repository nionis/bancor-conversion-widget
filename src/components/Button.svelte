<script>
  import { createEventDispatcher } from "svelte";
  import useCssVars from "svelte-css-vars";
  import Loading from "./Loading.svelte";
  import Required from "../utils/Required";
  import { Cursor, Opacity } from "../utils/Colors.js";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let borderColor = Required("borderColor");
  export let orientation = "vertical";
  export let text = "";
  export let disabled = false;
  export let loading = false;

  $: cssVars = {
    bgColor,
    fontColor,
    borderColor,
    cursor: Cursor({ disabled }),
    opacity: Opacity({ disabled }),
    opacityHover: Opacity({ hover: true }),
    margin: orientation === "vertical" ? "0px" : "19px"
  };

  const dispatch = createEventDispatcher();

  const onClick = e => {
    if (disabled) return;

    dispatch("click", e);
  };
</script>

<style>
  .btn {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 90px;
    min-width: 90px;
    height: 33px;
    font-size: calc(14px + 0.3vw);
    border-radius: 20px;
    padding-top: 1px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
    color: var(--fontColor);
    background-color: var(--bgColor);
    opacity: var(--opacity);
    border: var(--borderColor);
    cursor: var(--cursor);
  }

  .btn:hover {
    opacity: var(--opacityHover) !important;
  }
  .underBtnText {
    width: 200px;
  }
  .btnContainer {
    height: 47px;
    justify-content: center;
    align-items: center;
    display: flex;
  }

  .centeringContainer {
    flex-direction: column;
    height: 66px;
    margin-top: var(--margin);
    justify-content: flex-end;
    align-items: center;
    display: flex;
    text-align: center;
    width: 100px;
  }
</style>

<div class="centeringContainer" use:useCssVars={cssVars}>

  <div class="btnContainer">
    <div class="btn" on:click={onClick}>
      {#if loading}
        <Loading color={fontColor} />
      {:else}
        <slot />
      {/if}
    </div>
  </div>
  {#if text}
    <div class="underBtnText">{text}</div>
  {/if}
</div>
