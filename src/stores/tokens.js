/*
  A store that fetches and stores all tokens in a converterRegistry
*/

import { writable, get } from "svelte/store";
import Web3 from "web3";
import * as ethStore from "./eth";
import safeFetch from "../utils/safeFetch";
import Contract from "../utils/Contract";
import resolve from "../utils/resolve";
import { fromDecimals, toDecimals, toChecksumAddress } from "../utils/eth";

const { toHex } = Web3.utils;

export const contractRegistry = writable(undefined); // contractRegistry instance
export const converterRegistry = writable(undefined); // converterRegistry instance
export const bancorNetwork = writable(undefined); // bancorNetwork instance
export const bntToken = writable(undefined); // bancorNetwork's token instance
export const fetchingTokens = writable(false); // are we currently fetching tokens
export const tokens = writable(new Map()); // all tokens keyed by address

// using Bancor's API, get token's img url
export const getTokenImgByBancor = async (symbol) => {
  return safeFetch(`https://api.bancor.network/0.1/currencies/${symbol}`).then(
    (res) => {
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

  const token = await Contract(eth, "ERC20Token", address);

  const [name, symbol, decimals = 18, isEth, isBNT] = await Promise.all([
    token.methods.name().call(),
    token.methods.symbol().call(),
    token.methods.decimals().call(),
    _bancorNetwork.methods.etherTokens(token.options.address).call(),
    token.options.address === _bntToken.options.address,
  ]);

  // const img = await getTokenImgByBancor(symbol);
  const img = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
    token.options.address
  )}/logo.png`;

  return {
    address,
    name,
    symbol,
    img,
    decimals,
    toSmallestAmount: (amount) => toDecimals(amount, decimals),
    toDisplayAmount: (amount) => fromDecimals(amount, decimals),
    isEth,
    isBNT,
  };
};

export const init = async (
  eth,
  { showRelayTokens = false, addresses = {} }
) => {
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
    ConverterRegistryAddr,
  ] = await Promise.all([
    _contractRegistry.methods.addressOf(toHex("BancorNetwork")).call(),
    _contractRegistry.methods.addressOf(toHex("BNTToken")).call(),
    _contractRegistry.methods
      .addressOf(toHex("BancorConverterRegistry"))
      .call()
      .then((res) => {
        // TODO: remove hardcoded address
        return "0xf6E2D7F616B67E46D708e4410746E9AAb3a4C518";
      }),
  ]);

  const _bancorNetwork = await Contract(
    eth,
    "BancorNetwork",
    BancorNetworkAddr
  );
  bancorNetwork.update(() => _bancorNetwork);

  const _bntToken = await Contract(eth, "SmartToken", BNTTokenAddr);
  bntToken.update(() => _bntToken);

  const _converterRegistry = await Contract(
    eth,
    "BancorConverterRegistry",
    ConverterRegistryAddr
  );
  converterRegistry.update(() => _converterRegistry);

  try {
    fetchingTokens.update(() => true);

    // fetch all erc20 tokens
    let tokensAddress = await _converterRegistry.methods
      .getConvertibleTokens()
      .call()
      .then((res) => {
        return res.reverse();
      });

    // fetch all relay tokens
    if (showRelayTokens) {
      tokensAddress = tokensAddress.concat(
        await _converterRegistry.methods.getSmartTokens().call()
      );
    }

    return resolve(
      tokensAddress.map((tokenAddress, i) => ({
        id: i,
        fn: async () => {
          try {
            const data = await getTokenData(eth, tokenAddress);

            tokens.update((v) => {
              v.set(tokenAddress, data);

              return v;
            });
          } catch (err) {
            console.error("error while getting token data", err, tokenAddress);
          }
        },
      }))
    );
  } catch (error) {
    console.error(error);
  } finally {
    fetchingTokens.update(() => false);
  }
};
