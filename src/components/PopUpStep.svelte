<script>
  import Button from "./Button.svelte";
  import useCssVars from "svelte-css-vars";
  import MdCheck from "svelte-icons/md/MdCheck.svelte";

  export let colors;
  export let border = true;
  export let active = true;
  export let done = false;

  let buttonBg = colors.buttonBg;
  let buttonFont = colors.buttonFont;
  let buttonBorder = colors.buttonBorder;

  $: cssVars = {
    borderColor: colors.containerBorder,
    fontColor: colors.containerFont,
    border: border ? "3px" : "0px",
    opacity: active ? 1 : 0.5,
    iconColor: colors.buttonBg
  };
</script>

<style>
  .container {
    border-bottom: var(--borderColor) solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-grow: 1;
    padding-right: 20px;
    color: var(--fontColor);
    opacity: var(--opacity);
  }
  .step {
    padding: 20px;
    padding-right: 0;
    color: var(--fontColor);
    text-align: center;
    width: 30px;
    max-height: 30px;
  }
  .icon {
    color: var(--iconColor);
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  <div class="step">
    {#if done}
      <div class="icon">
        <MdCheck />
      </div>
    {:else}1{/if}

  </div>
  <div class="text">This is the question?</div>
  <Button bgColor={buttonBg} fontColor={buttonFont} borderColor={buttonBorder}>
    Accept
  </Button>
</div>
