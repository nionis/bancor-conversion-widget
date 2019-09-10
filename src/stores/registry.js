import { bufferToHex } from "web3x-es/utils";
import { writable } from "svelte/store";
import safeFetch from "../utils/safeFetch";
import Contract from "../utils/Contract";
import { addresses } from "../env";

const registry = writable(undefined);
const numberOfTokens = writable(0);
const tokens = writable(new Map());

const getTokenData = async (eth, address) => {
  const token = await Contract(eth, "ERC20Token", address);

  const [name, symbol] = await Promise.all([
    token.methods.name().call(),
    token.methods.symbol().call()
  ]);

  const img = await safeFetch(
    `https://api.bancor.network/0.1/currencies/${symbol}`
  ).then(res => {
    const imgFile = res.data.primaryCommunityImageName || "";
    const [name, ext] = imgFile.split(".");

    return `https://storage.googleapis.com/bancor-prod-file-store/images/communities/cache/${name}_200w.${ext}`;
  });

  return {
    address,
    name,
    symbol,
    img
  };
};

const init = async eth => {
  const name = "BancorConverterRegistry";
  const address = addresses["1"][name];

  const _registry = await Contract(eth, name, address);
  registry.update(() => _registry);

  const _numberOfTokens = await _registry.methods.tokenCount().call();
  numberOfTokens.update(() => _numberOfTokens);

  let i = Number(_numberOfTokens);
  while (--i >= 0) {
    const address = await _registry.methods
      .tokens(i)
      .call()
      .then(res => bufferToHex(res.buffer));

    const data = await getTokenData(eth, address);

    tokens.update(v => {
      v.set(address, data);

      return v;
    });
  }
};

export { registry, numberOfTokens, tokens, init };
