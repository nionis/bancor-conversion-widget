/*
  A store that fetches and stores all tokens in a converterRegistry
*/

import { writable, get } from "svelte/store";
import { bufferToHex, utf8ToHex } from "web3x-es/utils";
import * as ethStore from "./eth";
import safeFetch from "../utils/safeFetch";
import Contract from "../utils/Contract";
import resolve from "../utils/resolve";
import { fromDecimals, toDecimals } from "../utils/eth";

export const contractRegistry = writable(undefined); // contractRegistry instance
export const converterRegistry = writable(undefined); // converterRegistry instance
export const bancorNetwork = writable(undefined); // bancorNetwork instance
export const bntToken = writable(undefined); // bancorNetwork's token instance
export const bntConverter = writable(undefined); // bancorNetwork's token converter instance
export const fetchingTokens = writable(false); // are we currently fetching tokens
export const tokens = writable(new Map()); // all tokens keyed by address

// using Bancor's API, get token's img url
export const getTokenImg = async symbol => {
  return safeFetch(`https://api.bancor.network/0.1/currencies/${symbol}`).then(
    res => {
      if (!res || !res.data) return;

      const imgFile = res.data.primaryCommunityImageName || "";
      const [name, ext] = imgFile.split(".");

      return `https://storage.googleapis.com/bancor-prod-file-store/images/communities/cache/${name}_200w.${ext}`;
    }
  );
};

// get relevant token data
export const getTokenData = async (eth, address) => {
  const _bancorNetwork = get(bancorNetwork);
  const _bntToken = get(bntToken);
  const _converter = get(converterRegistry);

  let relay = address;

  const tokenConverterCount = await _converter.methods
    .converterCount(address)
    .call();

  if (Number(tokenConverterCount) > 0) {
    const tokenConverterAddress = await _converter.methods
      .converterAddress(address, String(Number(tokenConverterCount) - 1))
      .call()
      .then(res => bufferToHex(res.buffer));

    const tokenConverter = await Contract(
      eth,
      "BancorConverter",
      tokenConverterAddress
    );

    relay = await tokenConverter.methods
      .token()
      .call()
      .then(res => bufferToHex(res.buffer));
  }

  const token = await Contract(eth, "ERC20Token", address);

  const [name, symbol, decimals = 18, isEth, isBNT] = await Promise.all([
    token.methods.name().call(),
    token.methods.symbol().call(),
    token.methods.decimals().call(),
    _bancorNetwork.methods.etherTokens(token.address).call(),
    token.address === _bntToken.address
  ]);

  const img = await getTokenImg(symbol);

  return {
    address,
    name,
    symbol,
    decimals,
    toSmallestAmount: amount => toDecimals(amount, decimals),
    toDisplayAmount: amount => fromDecimals(amount, decimals),
    relay,
    isEth,
    isBNT,
    isRelay: relay === address,
    img
  };
};

export const init = async (eth, { showRelayTokens = false, addresses = {} }) => {
  tokens.update(() => new Map());

  const _networkId = get(ethStore.networkId);
  // only mainnet or localhost
  if (!addresses[_networkId]) return;

  const ContractRegistryAddr = addresses[_networkId];

  // initialize contracts
  const _contractRegistry = await Contract(
    eth,
    "ContractRegistry",
    ContractRegistryAddr
  );
  contractRegistry.update(() => _contractRegistry);

  // get other contract's addresses using contractRegistry
  const [
    BancorNetworkAddr,
    BNTTokenAddr,
    BNTConverterAddr,
    ConverterRegistryAddr
  ] = await Promise.all([
    _contractRegistry.methods
      .addressOf(utf8ToHex("BancorNetwork"))
      .call()
      .then(res => bufferToHex(res.buffer)),
    _contractRegistry.methods
      .addressOf(utf8ToHex("BNTToken"))
      .call()
      .then(res => bufferToHex(res.buffer)),
    _contractRegistry.methods
      .addressOf(utf8ToHex("BNTConverter"))
      .call()
      .then(res => bufferToHex(res.buffer)),
    _contractRegistry.methods
      .addressOf(utf8ToHex("BancorConverterRegistry"))
      .call()
      .then(res => bufferToHex(res.buffer))
  ]);

  const _bancorNetwork = await Contract(
    eth,
    "BancorNetwork",
    BancorNetworkAddr
  );
  bancorNetwork.update(() => _bancorNetwork);

  const _bntToken = await Contract(eth, "SmartToken", BNTTokenAddr);
  bntToken.update(() => _bntToken);

  const _bntConverter = await Contract(
    eth,
    "BancorConverter",
    BNTConverterAddr
  );
  bntConverter.update(() => _bntConverter);

  const _converterRegistry = await Contract(
    eth,
    "BancorConverterRegistry",
    ConverterRegistryAddr
  );
  converterRegistry.update(() => _converterRegistry);

  // get and add ETH
  _bntConverter.methods
    .connectorTokens(0)
    .call()
    .then(res => bufferToHex(res.buffer))
    .then(async address => {
      const data = await getTokenData(eth, address);

      tokens.update(v => {
        v.set(address, data);

        return v;
      });
    });

  // add BNT
  getTokenData(eth, _bntToken.address).then(data => {
    tokens.update(v => {
      v.set(_bntToken.address, data);

      return v;
    });
  });

  // add tokens registered in converter
  _converterRegistry.methods
    .tokenCount()
    .call()
    .then(count => {
      fetchingTokens.update(() => true);

      return resolve(
        Array.from(Array(Number(count))).map((v, i) => ({
          id: i,
          fn: async () => {
            const tokenAddress = await _converterRegistry.methods
              .tokens(String(i))
              .call()
              .then(res => bufferToHex(res.buffer));

            const data = await getTokenData(eth, tokenAddress);

            // hide relay tokens
            if (!showRelayTokens && data.isRelay) return;

            tokens.update(v => {
              v.set(tokenAddress, data);

              return v;
            });
          }
        }))
      );
    })
    .finally(() => {
      fetchingTokens.update(() => false);
    });
};