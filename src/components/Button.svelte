<script>
  import { lightTheme } from "../utils/Colors";

  export let colors = {};
  export let disabled = false;
  export let onClick;

  const {
    buttonBg = lightTheme.buttonBg,
    buttonFont = lightTheme.buttonFont,
    buttonBorder = lightThem.buttonBorder
  } = colors;

  // disable if onClick is not provided
  disabled = disabled || !onClick;

  let buttonStyle = `
    background-color: ${buttonBg};
    color: ${buttonFont};
    opacity: ${disabled ? 0.75 : 1};
    border: ${buttonBorder} solid 1px;
    cursor: ${disabled ? "not-allowed" : "pointer"};
  `;
</script>

<style>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 90px;
    height: 33px;
    font-size: 1em;
    border-radius: 20px;
    padding-top: 1px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
  }
</style>

<div on:click={onClick} style={buttonStyle}>
  <slot />
</div>
