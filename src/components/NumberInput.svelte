<script>
  import Required from "../utils/Required";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let borderColor = Required("borderColor");
  export let value = Required("value");

  const containerStyle = `
    background-color: ${bgColor};
    border: ${borderColor} solid 1px;
  `;

  const inputStyle = `color: ${fontColor};`;
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

  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    height: 45px;
    width: 270px;
    border-radius: 5px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
  }
</style>

<div class="container" style={containerStyle}>
  <input type="number" style={inputStyle} min="0" {value} on:change />
  <slot />
</div>
