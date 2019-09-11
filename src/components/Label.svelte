<script>
  import Required from "../utils/Required";

  export let orientation = Required("orientation");
  export let color = Required("color");
  export let text = "";
</script>

<style>
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
</style>

<div class="container {orientation}">
  {#if text}
    <span style="color: {color};">{text}</span>
  {/if}
  <slot />
</div>
