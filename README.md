# Bancor Conversion Widget

An open sourced widget that uses Bancor's smart contracts to allow a user to convert tokens or ethereum.

### Features

- 🚴 Fast
- 🔧 Customizable
- 🙂 Simple usage

### Installing and usage:

```
npm install bancor-conversion-widget --save
```

#### in vanilla

```html
<script src="https://unpkg.com/bancor-conversion-widget@latest"></script>

<body onload="render()">
  <script>
    const render = () => {
      // render it
      new BancorConversionWidget({
        target: document.body,
        props: {}
      });
    };
  </script>
</body>
```

#### in react

```
npm install react-svelte --save
```

```javascript
import SvelteComponent from "react-svelte";
import BancorConversionWidget from "bancor-conversion-widget";

// render it
<SvelteComponent this={BancorConversionWidget} />;
```

#### in svelte

```html
<script>
  import BancorConversionWidget from "bancor-conversion-widget";
</script>

<!-- render it -->
<BancorConversionWidget />
```

### Available properties:

| Name              | Description                       | Type      | Default                        |
| ----------------- | --------------------------------- | --------- | ------------------------------ |
| tokenSend         | initial "send" token              | `string`  | `"ETH"`                        |
| tokenReceive      | initial "receive" token           | `string`  | `"BNT"`                        |
| colors            | custom colors                     | `object`  | [src](/src/utils/Colors.js#L5) |
| showRelayTokens   | show or hide relay tokens         | `boolean` | `false`                        |
| addresses         | custom registry addresses         | `object`  | [src](/src/env.js#L4)          |
| affiliate.account | affiliate ethereum address        | `string`  | `undefined`                    |
| affiliate.fee     | affiliate fee percentage (max 3%) | `number`  | `undefined`                    |

### Live examples:

- [vanilla](https://codesandbox.io/s/bancor-conversion-widget-in-vanilla-2q28g?fontsize=14&hidenavigation=1&theme=dark)
- [react](https://codesandbox.io/s/awesome-grass-e12df?fontsize=14&hidenavigation=1&theme=dark)
- [svelte](https://codesandbox.io/s/musing-dirac-8zmr9?fontsize=14&hidenavigation=1&theme=dark)
