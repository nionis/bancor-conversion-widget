import { writable } from "svelte/store";
import safeFetch from "../utils/safeFetch";
import Contract from "../utils/Contract";
import { addresses } from "../env";

const registry = writable(null);
const numberOfTokens = writable(0);
const tokens = writable(new Map());

const init = async eth => {
  const name = "BancorConverterRegistry";
  const address = addresses["1"][name];

  const _registry = await Contract(eth, name, address);
  registry.update(() => _registry);

  const _numberOfTokens = await _registry
    .tokenCount()
    .then(res => res[0].toString());
  numberOfTokens.update(() => _numberOfTokens);

  let i = Number(_numberOfTokens);
  while (--i >= 0) {
    const address = await _registry.tokens(i).then(res => {
      return res[0];
    });

    const token = await Contract(eth, "ERC20Token", address);
    const name = await token.name().then(res => res[0]);
    const symbol = await token.symbol().then(res => res[0]);
    const img = await safeFetch(
      `https://api.bancor.network/0.1/currencies/${symbol}`
    ).then(res => {
      const imgFile = res.data.primaryCommunityImageName || "";
      const [name, ext] = imgFile.split(".");

      return `https://storage.googleapis.com/bancor-prod-file-store/images/communities/cache/${name}_200w.${ext}`;
    });

    tokens.update(v => {
      v.set(address, {
        address,
        name,
        symbol,
        img
      });

      return v;
    });
  }
};

export { registry, numberOfTokens, tokens, init };
