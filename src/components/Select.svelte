<script>
  import { onMount } from "svelte";
  import Select from "svelte-select";
  import Required from "../utils/Required";

  export let listBgColor = Required("listBgColor");
  export let bgColor = Required("bgColor");
  export let fontColor = Required("fontColor");
  export let borderColor = Required("borderColor");
  export let open = false;
  export let items = [];

  let elem;

  onMount(() => {
    // open select
    elem.$$.ctx.container.click();
  });

  const style = `
    width: 236px;
    color: ${fontColor};
    border-radius: 5px;
    border: ${borderColor} solid 1px;
    background: ${listBgColor};
    --inputColor: ${fontColor};
    --placeholderColor: ${fontColor};
    --listBackground: ${listBgColor};
    --itemActiveBackground: ${bgColor};
    --itemHoverBG: ${bgColor};
    --itemIsActiveBG: ${bgColor};
    --itemIsActiveColor: ${fontColor};
    --clearSelectColor: ${fontColor};
    --clearSelectHoverColor: ${fontColor};
  `;
</script>

<Select
  {items}
  containerStyles={style}
  listOpen={open}
  isFocused={open}
  bind:this={elem}
  on:select />
