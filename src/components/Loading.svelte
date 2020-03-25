<script>
  /*
    Loading
    A loading svg
  */

  import useCssVars from "svelte-css-vars";

  export let color = Required("color");

  $: cssVars = {
    color
  };
</script>

<style>
  .loadingContainer {
    align-items: center;
    width: 100%;
    height: 100%;
    border: none;
    background-color: transparent;
  }

  .loading {
    display: inline-block;
    text-align: center;
    vertical-align: top;
  }

  svg {
    width: 100%;
    height: 100%;
  }

  svg path {
    fill: var(--color);
  }
</style>

<div class="loadingContainer" use:useCssVars={cssVars}>
  <div class="loading" title="2">
    <svg
      version="1.1"
      id="loader-1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width="40px"
      height="40px"
      viewBox="0 0 50 50"
      style="enable-background:new 0 0 50 50;"
      xml:space="preserve">
      <path
        fill="#000"
        d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z">
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="0.6s"
          repeatCount="indefinite" />
      </path>
    </svg>
  </div>
</div>
