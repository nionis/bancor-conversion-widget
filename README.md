# Bancor Conversion Widget

An open sourced widget that uses Bancor's smart contracts to allow a user to convert tokens or ethereum.

### Features
* 🚴 Fast
* ⚡ Less than `70kb` gzipped
* 🔧 Customizable
* 🙂 Simple usage

### Installing and usage:

```
npm install bancor-conversion-widget --save
```

#### in vanilla
``` html
<script src="https://unpkg.com/:package@:version/:file"></script>

<body onload="render()">
  <script>
    const render = () => {
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

<SvelteComponent
  this={BancorConversionWidget}
/>
```

#### in svelte
```html
<script>
  import BancorConversionWidget from "bancor-conversion-widget";
</script>

<BancorConversionWidget/>
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
* [vanilla](https://github.com/nionis/bancor-conversion-widget/blob/master/example/index.html)
* [react](https://codesandbox.io/s/svelte-custom-element-react-wmj7w?fontsize=14&view=preview)
* [svelte](https://codesandbox.io/s/svelte-custom-element-react-wmj7w?fontsize=14&view=preview)