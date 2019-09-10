<script>
  import { createEventDispatcher } from "svelte";
  import Required from "../utils/Required";

  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let borderColor = Required("borderColor");
  export let disabled = false;

  const buttonStyle = `
    color: ${fontColor};
    background-color: ${bgColor};
    opacity: ${disabled ? 0.75 : 1};
    border: ${borderColor} solid 1px;
    cursor: ${disabled ? "default" : "pointer"};
  `;

  const dispatch = createEventDispatcher();

  const onClick = e => {
    if (disabled) return;

    dispatch("click", e);
  };
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
