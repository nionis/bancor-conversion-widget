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
  export let loading = true;

  const customSelectStyle = `
    background-color: ${bgColor};
    border: ${borderColor} solid 1px;
    opacity: ${disabled ? 0.75 : 1};
    ${!loading ? "cursor: pointer" : null};
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
  }

  .container:hover {
    opacity: 0.7 !important;
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

  @keyframes lds-rolling {
    0% {
      -webkit-transform: translate(-50%, -50%) rotate(0deg);
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      -webkit-transform: translate(-50%, -50%) rotate(360deg);
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
  @-webkit-keyframes lds-rolling {
    0% {
      -webkit-transform: translate(-50%, -50%) rotate(0deg);
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      -webkit-transform: translate(-50%, -50%) rotate(360deg);
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
  .lds-rolling {
    position: relative;
  }
  .lds-rolling div,
  .lds-rolling div:after {
    position: absolute;
    width: 100px;
    height: 100px;
    border: 14px solid black;
    border-top-color: transparent;
    border-radius: 50%;
  }
  .lds-rolling div {
    -webkit-animation: lds-rolling 1.3s linear infinite;
    animation: lds-rolling 1.3s linear infinite;
    top: 100px;
    left: 100px;
  }
  .lds-rolling div:after {
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
  }
  .lds-rolling {
    width: 24px !important;
    height: 24px !important;
    -webkit-transform: translate(-12px, -12px) scale(0.12) translate(12px, 12px);
    transform: translate(-12px, -12px) scale(0.12) translate(12px, 12px);
  }
  .loadingContainer {
    border: none;
    background-color: transparent;
    width: 85px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

<div
  class="container"
  style={customSelectStyle}
  on:click={!loading ? onClick : null}>

  {#if !loading}
    <div class="button">
      <img src={token.img} alt="{token.symbol} logo" />
      <div style="color: {fontColor};">{token.symbol}</div>
      <div class="arrowContainer" style={selectArrowStyle}>
        <MdArrowDropDown />
      </div>
    </div>
  {:else}
    <div class="loadingContainer">
      <div class="lds-css ng-scope">
        <div style="width:100%;height:100%" class="lds-rolling">
          <div />
        </div>
      </div>
    </div>
  {/if}

</div>
