<script>
  /*
    Label wrapper
    Adds a label to a component
  */

  import useCssVars from "svelte-css-vars";
  import Required from "../utils/Required";

  export let orientation = Required("orientation");
  export let color = Required("color");
  export let text;

  $: cssVars = {
    spanColor: color
  };
</script>

<style>
  span {
    font-size: calc(14px + 0.35vw);
    color: var(--spanColor);
  }

  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .horizontal {
    flex-direction: column;
    padding-bottom: 18px;
  }

  .vertical {
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    text-align: center;
  }

  .vertical > span {
    width: 140px;
  }

  .childrenContainer {
    width: 272px;
    height: 47px;
  }
</style>

<div class="container {orientation}" use:useCssVars={cssVars}>
  {#if text}
    <span>{text}</span>
  {/if}
  <div class="childrenContainer">
    <slot />
  </div>
</div>
