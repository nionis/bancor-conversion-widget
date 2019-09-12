import { writable, get } from "svelte/store";
import { bufferToHex, utf8ToHex } from "web3x-es/utils";
import { networkId } from "./eth";
import safeFetch from "../utils/safeFetch";
import Contract from "../utils/Contract";
import { addresses } from "../env";

const contractRegistry = writable(undefined);
const converterRegistry = writable(undefined);
const bancorNetwork = writable(undefined);
const bntToken = writable(undefined);
const bntConverter = writable(undefined);
const nonStandardTokenRegistry = writable(undefined);
const tokens = writable(new Map());

const getTokenImg = async symbol => {
  return safeFetch(`https://api.bancor.network/0.1/currencies/${symbol}`).then(
    res => {
      if (!res || !res.data) return;

      const imgFile = res.data.primaryCommunityImageName || "";
      const [name, ext] = imgFile.split(".");

      return `https://storage.googleapis.com/bancor-prod-file-store/images/communities/cache/${name}_200w.${ext}`;
    }
  );
};

const getTokenData = async (eth, address) => {
  const token = await Contract(eth, "ERC20Token", address);

  const _bancorNetwork = get(bancorNetwork);
  const _nonStandardTokenRegistry = get(nonStandardTokenRegistry);

  const [name, symbol, isEth, isNSToken] = await Promise.all([
    token.methods.name().call(),
    token.methods.symbol().call(),
    _bancorNetwork.methods.etherTokens(token.address).call(),
    _nonStandardTokenRegistry.methods.listedAddresses(token.address).call()
  ]);

  const img = await getTokenImg(symbol);

  return {
    address,
    name,
    symbol,
    isEth,
    isNSToken,
    img
  };
};

const init = async eth => {
  const _contractRegistry = await Contract(
    eth,
    "ContractRegistry",
    addresses[get(networkId)].ContractRegistry
  );
  contractRegistry.update(() => _contractRegistry);

  const _converterRegistry = await Contract(
    eth,
    "BancorConverterRegistry",
    addresses[get(networkId)].ConverterRegistry
  );
  converterRegistry.update(() => _converterRegistry);

  const [
    BancorNetworkAddr,
    BNTTokenAddr,
    BNTConverterAddr,
    NonStandardTokenRegistryAddr
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
      .addressOf(utf8ToHex("NonStandardTokenRegistry"))
      .call()
      .then(res => bufferToHex(res.buffer))
  ]);

  console.log({
    ContractRegistry: _contractRegistry.address,
    ConverterRegistry: _converterRegistry.address,
    BancorNetworkAddr,
    BNTTokenAddr,
    BNTConverterAddr,
    NonStandardTokenRegistryAddr
  });

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

  const _nonStandardTokenRegistry = await Contract(
    eth,
    "NonStandardTokenRegistry",
    NonStandardTokenRegistryAddr
  );
  nonStandardTokenRegistry.update(() => _nonStandardTokenRegistry);

  // add eth
  const ethAddress = await _bntConverter.methods
    .connectorTokens(0)
    .call()
    .then(res => bufferToHex(res.buffer));
  const ethTokenData = await getTokenData(eth, ethAddress);
  tokens.update(v => {
    v.set(ethAddress, ethTokenData);

    return v;
  });

  // add bnt
  const bntTokenData = await getTokenData(eth, _bntToken.address);
  tokens.update(v => {
    v.set(_bntToken.address, bntTokenData);

    return v;
  });

  // add bnt connectors
  const tokenCount = await _converterRegistry.methods.tokenCount().call();

  let i = Number(tokenCount);
  while (--i >= 0) {
    const tokenAddress = await _converterRegistry.methods
      .tokens(i)
      .call()
      .then(res => bufferToHex(res.buffer));

    // const latestConverter = await _converterRegistry.methods.converterCount(tokenAddress)

    const data = await getTokenData(eth, tokenAddress);

    tokens.update(v => {
      v.set(tokenAddress, data);

      return v;
    });
  }
};

export {
  contractRegistry,
  converterRegistry,
  bancorNetwork,
  bntToken,
  bntConverter,
  nonStandardTokenRegistry,
  tokens,
  init
};
