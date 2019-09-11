import App from "./App.svelte";

// custom element
// export { default as App } from "./App.svelte";
// *****************************************
// * Notice that the component is not instantiated and mounted to the document <body className="">
// * Since the compiler is creating a custom element, we instead define and use the custom element
// * in the index.html file to simulate the end-user experience.
// ******************************************

const app = new App({
  target: document.body,
  props: {
    orientation: "horizontal", // horizontal, vertical
    theme: "dark", // light, dark
    colors: {},
    prefetch: true
  }
});

export default app;
