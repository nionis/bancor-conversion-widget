import { writable, derived, get } from "svelte/store";
import { eth, account, getAccept } from "./eth";
import {
  tokens as tokensMap,
  bancorNetwork,
  bntConverterRegistry,
  nonStandardTokenRegistry
} from "./registry";

const derivedPluck = (tokens, token) => {
  return derived([tokens, token], ([tokens, token]) => {
    const newTokens = new Map(tokens);

    if (token) {
      newTokens.delete(token.address);
    }

    return newTokens;
  });
};

const tokenA = writable(undefined);
const tokenB = writable(undefined);
const tokensA = derivedPluck(tokensMap, tokenB);
const tokensB = derivedPluck(tokensMap, tokenA);

const convert = async (amount = "1") => {
  const _eth = get(eth);
  if (!_eth) {
    throw Error("eth does not exist");
  }

  const _tokenA = get(tokenA);
  const _tokenB = get(tokenB);
  if (!_tokenA || !_tokenB) {
    throw Error("pairs not selected");
  }

  let _account = get(account);
  if (!_account) {
    await getAccept();
    _account = get(account);
  }
  if (!_account) {
    throw Error("account not accepted");
  }

  const _bancorNetwork = get(bancorNetwork);
  const _bntConverterRegistry = get(bntConverterRegistry);
  const _nonStandardTokenRegistry = get(nonStandardTokenRegistry);

  const [tokenAIsEth, tokenBIsEth, tokenAIsNS, tokenBIsNS] = await Promise.all([
    _bancorNetwork.methods.etherTokens(_tokenA.address).call(),
    _bancorNetwork.methods.etherTokens(_tokenB.address).call(),
    _nonStandardTokenRegistry.methods.listedAddresses(_tokenA.address).call(),
    _nonStandardTokenRegistry.methods.listedAddresses(_tokenB.address).call()
  ]);

  console.log({
    tokenA: _tokenA.address,
    tokenB: _tokenB.address
  });

  console.log({ tokenAIsEth, tokenBIsEth, tokenAIsNS, tokenBIsNS });

  return _bancorNetwork.methods
    .convert([_tokenA.address, _tokenB.address, _tokenB.address], amount, 1)
    .send({
      from: _account,
      value: tokenAIsEth ? amount : 0
    });

  // if (tokenAIsEth) {
  //   return _bancorNetwork.methods
  //     .convert([_tokenA.address, _tokenB.address, _tokenB.address], amount, 1)
  //     .send({
  //       from: _account,
  //       value: tokenAIsEth ? amount : 0
  //     });
  // } else {
  //   return _bntConverterRegistry.methods
  //     .quickConvert(
  //       [_tokenA.address, _tokenB.address, _tokenB.address],
  //       amount,
  //       1
  //     )
  //     .send({
  //       from: _account,
  //       value: tokenAIsEth ? amount : 0
  //     });
  // }
};

export { tokenA, tokensA, tokenB, tokensB, convert };
