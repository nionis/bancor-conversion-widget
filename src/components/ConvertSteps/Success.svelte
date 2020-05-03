<script>
  /*
    Success
    A success view once the conversion is complete.
  */

  import { createEventDispatcher } from "svelte";
  import useCssVars from "svelte-css-vars";
  import MdClose from "svelte-icons/md/MdClose.svelte";
  import MdCheck from "svelte-icons/md/MdCheck.svelte";
  import Icon from "../Icon.svelte";
  import Button from "../Button.svelte";
  import Link from "../Link.svelte";
  import Required from "../../utils/Required";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let successColor = Required("successColor");
  export let disabledFont = Required("disabledFont");
  export let buttonBgColor = Required("buttonBgColor");
  export let buttonFontColor = Required("buttonFontColor");
  export let txHash = Required("txHash");

  const dispatch = createEventDispatcher();

  const onClose = () => {
    dispatch("close");
  };

  $: cssVars = {
    bgColor,
    disabledFont,
    successColor,
    fontColor
  };
</script>

<style>
  .container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    box-sizing: border-box;
    justify-content: space-between;
    height: 100%;
    width: 100%;
    background: var(--bgColor);
  }

  .closeContainer {
    display: flex;
    width: 100%;
    justify-content: flex-end;
  }

  .iconContainer {
    width: 100px;
    border: 7px solid var(--successColor);
    border-radius: 100px;
    height: 100px;
    justify-content: center;
    align-items: center;
    display: flex;
    transform: rotate(270deg);
    margin-bottom: 40px;
  }

  h1 {
    font-weight: normal;
    color: var(--fontColor);
  }

  .btnContainer {
    margin-bottom: 24px;
  }

  .textAndIcon {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
</style>

<div class="container" use:useCssVars={cssVars}>
  <div class="closeContainer">
    <Icon color={disabledFont} on:click={onClose}>
      <MdClose />
    </Icon>
  </div>
  <div class="textAndIcon">
    <div class="iconContainer">
      <Icon color={successColor} size="70px">
        <MdCheck />
      </Icon>
    </div>
    <h1>Conversion</h1>
    <h1>Successful!</h1>
    <Link url="https://etherscan.io/tx/{txHash}" fontColor={disabledFont}>
      etherscan
    </Link>
  </div>
  <div class="btnContainer">
    <Button
      bgColor={buttonBgColor}
      fontColor={buttonFontColor}
      on:click={onClose}>
      Done
    </Button>
  </div>
</div>
