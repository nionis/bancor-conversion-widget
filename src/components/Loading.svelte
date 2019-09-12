<script>
  import useCssVars from "svelte-css-vars";

  export let color = Required("color");

  $: cssVars = {
    color
  };
</script>

<style>
  @keyframes lds-rolling {
    0% {
      -webkit-transform: translate(-50%, -50%) rotate(0deg);
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      -webkit-transform: translate(-50%, -50%) rotate(360deg);
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
  @-webkit-keyframes lds-rolling {
    0% {
      -webkit-transform: translate(-50%, -50%) rotate(0deg);
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      -webkit-transform: translate(-50%, -50%) rotate(360deg);
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
  .lds-rolling {
    position: relative;
  }
  .lds-rolling div,
  .lds-rolling div:after {
    position: absolute;
    width: 100px;
    height: 100px;
    border: 14px solid var(--color);
    border-top-color: transparent;
    border-radius: 50%;
  }
  .lds-rolling div {
    -webkit-animation: lds-rolling 1.3s linear infinite;
    animation: lds-rolling 1.3s linear infinite;
    top: 100px;
    left: 100px;
  }
  .lds-rolling div:after {
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
  }
  .lds-rolling {
    width: 24px !important;
    height: 24px !important;
    -webkit-transform: translate(-12px, -12px) scale(0.12) translate(12px, 12px);
    transform: translate(-12px, -12px) scale(0.12) translate(12px, 12px);
  }
  .loadingContainer {
    border: none;
    background-color: transparent;
    width: 85px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

<div class="loadingContainer" use:useCssVars={cssVars}>
  <div class="lds-css ng-scope">
    <div style="width:100%;height:100%" class="lds-rolling">
      <div />
    </div>
  </div>
</div>
