<script>
  /*
    Summary
    Show the summary of the conversion
  */

  import useCssVars from "svelte-css-vars";
  import Loading from "../components/Loading.svelte";
  import Required from "../utils/Required";

  export let fontColor = Required("fontColor");
  export let fee;
  export let amount;
  export let symbol;

  $: amountDisplay = !amount || Number(amount) === 0 ? "0.0" : amount;

  $: feeDisplay =
    !fee || Number(fee) === 0
      ? "0.0"
      : Number(fee) > 0.001
      ? Number(fee).toFixed(5)
      : "<0.001";

  $: cssVars = {
    fontColor
  };
</script>

<style>
  div {
    background-color: transparent;
    color: var(--fontColor);
  }

  h1 {
    font-weight: normal;
    margin-top: 5px;
    margin-bottom: 25px;
  }

  .container {
    padding: 20px;
    margin-bottom: 15px;
  }

  .alignRow {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 20px;
  }

  .loadingContainer {
    width: 50px;
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  <h1>Summary</h1>
  <div class="alignRow">
    <div>Amount</div>
    {#if symbol}
      <div>{amountDisplay} ({symbol})</div>
    {:else}
      <div class="loadingContainer">
        <Loading color={fontColor} />
      </div>
    {/if}
  </div>
  <div class="alignRow">
    <div>Fee</div>
    <div>{feeDisplay} (BNT)</div>
  </div>
  <div class="alignRow">
    <div>Total Cost</div>
    {#if symbol}
      <div>{amountDisplay} ({symbol})</div>
    {:else}
      <div class="loadingContainer">
        <Loading color={fontColor} />
      </div>
    {/if}
  </div>
</div>
