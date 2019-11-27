<script>
  import useCssVars from "svelte-css-vars";
  import MdCheck from "svelte-icons/md/MdCheck.svelte";
  import Button from "../Button.svelte";
  import Link from "../Link.svelte";
  import { emptyChar } from "../../utils";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let buttonBgColor = Required("buttonBgColor");
  export let buttonFontColor = Required("buttonFontColor");
  export let disabledFont = Required("disabledFont");
  export let step = Required("step");
  export let position = Required("position");
  export let active = Required("active");

  $: cssVars = {
    fontColor: active ? fontColor : disabledFont
  };

  $: disabled = !active || $step.success || $step.pending;
</script>

<style>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    flex-grow: 1;
    color: var(--fontColor);
    width: 100%;
    border-top: 1px solid #e1e1e1;
    padding-left: 20px;
    padding-right: 20px;
    box-sizing: border-box;
  }

  .step {
    color: var(--fontColor);
    display: flex;
    flex-direction: row;
    padding-top: 25px;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    font-size: calc(24px + 0.35vw);
  }

  .icon {
    color: #0ead00;
    width: 40px;
    height: 40px;
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  <div class="step">
    <div class="text">{position}: {$step.text}</div>
    {#if $step.success}
      <div class="icon">
        <MdCheck />
      </div>
    {/if}
  </div>
  {#if active}
    <Button
      bgColor={buttonBgColor}
      fontColor={buttonFontColor}
      loading={$step.pending}
      {disabled}
      on:click={$step.fn}>
      Accept
      <span slot="message">
        {#if $step.txHash}
          <Link url="https://etherscan.io/tx/{$step.txHash}" {fontColor}>
            etherscan
          </Link>
        {/if}
      </span>
    </Button>
  {/if}
</div>
