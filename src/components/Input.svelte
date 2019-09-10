<script>
  import Select from "svelte-select";
  import MdArrowDropDown from "svelte-icons/md/MdArrowDropDown.svelte";
  import { lightTheme } from "../Colors";

  export let colors = {};
  export let orientation = "horizontal";
  export let disabled = false;
  export let text = "";
  export let items = ["BTC", "ETH", "BNC"];

  const {
    inputBg = lightTheme.inputBg,
    inputFont = lightTheme.inputFont,
    inputBorder = lightTheme.inputBorder,
    selectBg = lightTheme.selectBg,
    selectFont = lightTheme.selectFont,
    selectBorder = lightTheme.selectBorder,
    selectArrow = lightTheme.selectArrow
  } = colors;

  let selectOpen = false;
  let number = 0;
  let src = "https://www.bancor.network/static/images/og_image.jpg";
  let selected = "ETH";

  $: inputContainerStyle = `
    border: ${inputBorder} solid 1px;
    background-color: ${inputBg}
  `;

  $: selectContainerStyle = `
    display: ${selectOpen ? "initial" : "none"};
  `;

  $: selectStyle = `
    border: none;
    border-radius: 10px;
    width: 236px;
    color: ${selectFont};
    height: 41px; background: ${inputBg};
    --inputColor: ${selectFont};
    --placeholderColor: ${selectFont};
    --listBackground: ${inputBg};
    --itemActiveBackground: ${selectBg};
    --itemHoverBG: ${selectBg};
    --itemIsActiveBG: ${selectBg};
    --itemIsActiveColor: ${selectFont};
    --clearSelectColor: ${selectFont};
    --clearSelectHoverColor: ${selectFont};
  `;

  $: customSelectStyle = `
    background-color: ${selectBg};
    border: ${selectBorder} solid 1px;
    opacity: ${disabled ? 0.75 : 1}
  `;

  $: selectArrowStyle = `
    color: ${selectArrow};
  `;

  const onSelectClick = () => {
    selectOpen = true;
  };

  const onSelect = e => {
    selectOpen = false;
    selected = items[e.detail.index];
  };
</script>

<style>
  input {
    height: 41px;
    width: 175px;
    border: none;
    border-radius: 5px;
    margin: 0;
    outline: none;
    background-color: transparent;
    text-align: center;
  }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  img {
    border-radius: 50px;
    height: 25px;
    margin: 4px;
  }

  .container {
    display: flex;
    align-items: center;
  }

  .horizontal {
    justify-content: center;
    flex-direction: column;
    height: 45px;
  }

  .vertical {
    justify-content: flex-start;
    flex-direction: row;
    height: 65px;
    width: 100%;
  }

  .textContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 150px;
  }

  .inputContainer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 45px;
    width: 270px;
    border-radius: 5px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
  }

  .selectContainer {
    position: absolute;
    height: 42px;
    width: 270px;
    border-radius: 5px;
    z-index: 3;
  }

  .customSelectContainer {
    height: 30px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 6px;
    cursor: pointer;
  }

  .btn {
    border: none;
    background-color: transparent;
    padding: 0;
    margin: 0;
    width: 85px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .selectArrowContainer {
    height: 21px;
    width: 16px;
  }
</style>

<div class="container {orientation}">
  <div class="textContainer">
    <div class="text" style="color: {inputFont};">{text}</div>
  </div>

  <div class="inputContainer" style={inputContainerStyle}>
    <div class="selectContainer" style={selectContainerStyle}>
      <Select
        {items}
        containerStyles={selectStyle}
        listOpen={selectOpen}
        isFocused={selectOpen}
        on:select={onSelect} />
    </div>

    <input
      type="number"
      style="color: {inputFont};"
      bind:value={number}
      min="0" />

    <div
      class="customSelectContainer"
      style={customSelectStyle}
      on:click={onSelectClick}>
      <div class="btn">
        <img {src} alt="bancor logo" />
        <div style="color: {selectFont};">{selected}</div>
        <div class="selectArrowContainer" style={selectArrowStyle}>
          <MdArrowDropDown />
        </div>
      </div>
    </div>
  </div>
</div>
