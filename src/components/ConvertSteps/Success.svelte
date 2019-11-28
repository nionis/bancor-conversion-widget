<script>
  /*
    SelectTokens
    A list of tokens which can be used to select a send token / receive token
  */

  import { createEventDispatcher } from "svelte";
  import useCssVars from "svelte-css-vars";
  import Select from "svelte-select";
  import MdClose from "svelte-icons/md/MdClose.svelte";
  import MdCheck from "svelte-icons/md/MdCheck.svelte";
  import Item from "../SelectTokens/Item.svelte";
  import Icon from "../Icon.svelte";
  import Required from "../../utils/Required";
  import Button from "../Button.svelte";
  import Link from "../Link.svelte";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let successColor = Required("successColor");
  export let disabledFont = Required("disabledFont");
  export let buttonBgColor = Required("buttonBgColor");
  export let buttonFontColor = Required("buttonFontColor");
  //   export let open = true;
  //   export let loading = false;

  const dispatch = createEventDispatcher();

  // this is a pseudo item to show "loading" withing Select
  //   const loadingItem = {
  //     value: "__LOADING",
  //     label: "loading"
  //   };

  //   const onClose = () => {
  //     open = false;

  //     dispatch("close");
  //   };
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
    <Icon color={disabledFont}>
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
    <Link url="https://etherscan.io" fontColor={disabledFont}>etherscan</Link>
  </div>

  <div class="btnContainer">
    <Button bgColor={buttonBgColor} fontColor={buttonFontColor}>Done</Button>

  </div>

</div>

<!-- example -->
<!-- <Success
    bgColor={colors.containerBg}
    fontColor={colors.containerFont}
    successColor={colors.successColor}
    disabledFont={colors.disabledFont}
    buttonBgColor={colors.buttonBg}
    buttonFontColor={colors.buttonFont} /> -->
