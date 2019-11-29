<script>
  /*
    Summary
    Show the summary of the conversion
  */

  import Required from "../utils/Required";

  export let amount = Required("amount");
  export let symbol = Required("symbol");
  export let fee = Required("fee");

  $: feeDisplay =
    fee === "0" || Number(fee) > 0.001 ? Number(fee).toFixed(5) : "<0.001";
</script>

<style>
  div {
    background-color: transparent;
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
</style>

<div class="container">
  <h1>Summary</h1>
  <div class="alignRow">
    <div>Amount</div>
    <div>{amount} ({symbol})</div>
  </div>
  <div class="alignRow">
    <div>Fee</div>
    <div>{feeDisplay} (BNT)</div>
  </div>
  <div class="alignRow">
    <div>Total Cost</div>
    <div>{amount} ({symbol})</div>
  </div>
</div>
