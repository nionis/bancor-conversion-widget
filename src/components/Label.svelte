<script>
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
    flex-direction: row;
    width: 100%;
    text-align: center;
    justify-content: flex-start;
  }

  .vertical > span {
    width: 140px;
  }

  .childrenContainer{
    width: 272px;
    height: 47px;
  }
</style>

<div class="container {orientation}" use:useCssVars={cssVars}>
  {#if text}
    <span>{text}</span>
  {/if}
  <div class="childrenContainer"><slot /></div>
  
</div>
