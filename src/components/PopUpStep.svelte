<script>
  import Button from "./Button.svelte";
  import useCssVars from "svelte-css-vars";
  import MdCheck from "svelte-icons/md/MdCheck.svelte";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let borderColor = Required("borderColor");
  export let buttonBgColor = Required("buttonBgColor");
  export let buttonFontColor = Required("buttonFontColor");
  export let buttonBorderColor = Required("buttonBorderColor");
  export let step = Required("step");
  export let position = Required("position");
  export let active = Required("active");
  export let border = true;

  $: cssVars = {
    borderColor,
    fontColor,
    border: border ? "3px" : "0px",
    opacity: active || $step.pending ? 1 : 0.5,
    iconColor: buttonBgColor
  };

  $: disabled = !active || $step.success;
</script>

<style>
  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-grow: 1;
    border-bottom: var(--borderColor) solid var(--border);
    color: var(--fontColor);
    opacity: var(--opacity);
    padding-left: 20px;
    padding-right: 20px;
  }
  .step {
    max-height: 30px;
    width: 30px;
    text-align: left;
    padding-right: 0;
    color: var(--fontColor);
  }

  .icon {
    color: var(--iconColor);
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  <div class="step">
    {#if $step.success}
      <div class="icon">
        <MdCheck />
      </div>
    {:else}{position}{/if}
  </div>
  <div class="text">{$step.text}</div>
  <Button
    bgColor={buttonBgColor}
    fontColor={buttonFontColor}
    borderColor={buttonBorderColor}
    loading={$step.pending}
    {disabled}
    on:click={$step.fn}>
    Accept
  </Button>
</div>
