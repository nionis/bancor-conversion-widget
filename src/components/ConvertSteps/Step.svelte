<script>
  import useCssVars from "svelte-css-vars";
  import MdCheck from "svelte-icons/md/MdCheck.svelte";
  import Button from "../Button.svelte";
  import Link from "../Link.svelte";
  import { emptyChar } from "../../utils";

  export let fontColor = Required("fontColor");
  export let buttonBgColor = Required("buttonBgColor");
  export let buttonFontColor = Required("buttonFontColor");
  export let disabledFont = Required("disabledFont");
  export let step = Required("step");
  export let position = Required("position");
  export let active = Required("active");

  $: cssVars = {
    fontColor: active ? fontColor : disabledFont,
    height: active ? "auto" : "125px",
    flexGrow: active ? 1 : "unset"
  };

  $: disabled = !active || $step.success || $step.pending;
</script>

<style>
  .container {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex-direction: column;
    height: var(--height);
    flex-grow: var(--flexGrow);
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
    justify-content: space-between;
    align-items: center;
    width: 100%;
    font-size: calc(24px + 0.35vw);
  }

  .positionLink {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
  }

  .link {
    font-size: calc(14px + 0.35vw);
  }

  .icon {
    color: #0ead00;
    width: 40px;
    height: 40px;
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  <div class="step">
    <div class="positionLink">
      <div>{position}: {$step.text}</div>
      {#if $step.txHash}
        <div class="link">
          <Link
            url="https://etherscan.io/tx/{$step.txHash}"
            fontColor={active ? fontColor : disabledFont}>
            etherscan
          </Link>
        </div>
      {:else}
        <div class="link">{emptyChar}</div>
      {/if}
    </div>

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
    </Button>
  {/if}
</div>
