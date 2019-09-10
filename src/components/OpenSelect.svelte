<script>
  import { createEventDispatcher } from "svelte";
  import Select from "svelte-select";
  import MdArrowDropDown from "svelte-icons/md/MdArrowDropDown.svelte";
  import Required from "../utils/Required";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let borderColor = Required("borderColor");
  export let arrowColor = Required("arrowColor");
  export let token = Required("token");
  export let disabled = false;

  const customSelectStyle = `
    background-color: ${bgColor};
    border: ${borderColor} solid 1px;
    opacity: ${disabled ? 0.75 : 1}
  `;

  const selectArrowStyle = `
    color: ${arrowColor};
  `;

  const dispatch = createEventDispatcher();

  const onClick = e => {
    if (disabled) return;

    dispatch("click", e);
  };
</script>

<style>
  img {
    border-radius: 50px;
    height: 25px;
    margin: 4px;
  }

  .container {
    height: 30px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 6px;
    cursor: pointer;
  }

  .button {
    border: none;
    background-color: transparent;
    padding: 0;
    margin: 0;
    width: 85px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .arrowContainer {
    height: 21px;
    width: 16px;
  }
</style>

<div class="container" style={customSelectStyle} on:click={onClick}>
  <div class="button">
    <img src={token.img} alt="{token.symbol} logo" />
    <div style="color: {fontColor};">{token.symbol}</div>
    <div class="arrowContainer" style={selectArrowStyle}>
      <MdArrowDropDown />
    </div>
  </div>
</div>
