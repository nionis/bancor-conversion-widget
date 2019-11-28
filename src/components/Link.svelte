<script>
  /*
    Link
    A simple link component that takes care of "rel"
  */

  import useCssVars from "svelte-css-vars";
  import { Opacity } from "../utils/Colors";
  import Required from "../utils/Required";

  export let url = Required("url");
  export let fontColor = Required("fontColor");

  $: cssVars = {
    color: fontColor,
    opacity: Opacity({ hover: true })
  };
</script>

<style>
  a {
    color: var(--color);
  }

  a:hover {
    opacity: var(--opacity);
  }
</style>

<div use:useCssVars={cssVars}>
  <a href={url} target="_blank" rel="noopener noreferrer">
    <slot />
  </a>
</div>
