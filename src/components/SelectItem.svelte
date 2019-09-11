<script>
  import cssVars from "svelte-css-vars";

  export let backgroundColor = "white";
  export let hoverColor = "lightgray";
  export let fontColor = "black";

  $: backgroundColors = {
    backgroundColor,
    hoverColor,
    fontColor
  };

  let token = {
    img: "https://www.bancor.network/static/images/og_image.jpg",
    name: "Ethereum"
  };
</script>

<style>
  .container {
    background-color: var(--backgroundColor);
    width: 270px;
    height: 50px;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    display: flex;
    color: var(--fontColor);
  }
  img {
    border-radius: 50px;
    height: 30px;
    margin: 10px;
  }
  .container:hover {
    background-color: var(--hoverColor);
  }
</style>

<div class="container" use:cssVars={backgroundColors}>
  <img src={token.img} alt="{token.name} logo" />
  <div class="label">{token.name}</div>
</div>
