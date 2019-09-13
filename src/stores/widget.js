import { writable, derived, get } from "svelte/store";
import { fromWei, toWei } from "web3x-es/utils";
import { eth, account, getAccept } from "./eth";
import { tokens as tokensMap, bancorNetwork, bntToken } from "./registry";
import Required from "../utils/Required";

const derivedPluck = (tokens, token) => {
  return derived([tokens, token], ([tokens, token]) => {
    const newTokens = new Map(tokens);

    if (token) {
      newTokens.delete(token.address);
    }

    return newTokens;
  });
};

const loading = writable(false);
const tokenA = writable(undefined);
const tokenAInput = writable("0");
const tokenB = writable(undefined);
const tokenBInput = writable("0");
const tokensA = derivedPluck(tokensMap, tokenB);
const tokensB = derivedPluck(tokensMap, tokenA);
const pairsAreSelected = derived([tokenA, tokenB], ([_tokenA, _tokenB]) => {
  return Boolean(_tokenA && _tokenB);
});
const path = derived([tokenA, tokenB], ([_tokenA, _tokenB]) => {
  if (!get(pairsAreSelected)) return [];

  const _bntToken = get(tokensMap).get(get(bntToken).address);
  const oneIsEth = _tokenA.isEth || _tokenB.isEth;
  const oneIsBNT = _tokenA.isBNT || _tokenB.isBNT;

  if (oneIsEth && oneIsBNT) {
    if (_tokenA.isEth) {
      return [_tokenA.address, _tokenB.relay, _tokenB.address];
    } else {
      return [_tokenA.address, _tokenA.relay, _tokenB.address];
    }
  } else if (oneIsBNT) {
    if (_tokenA.isBNT) {
      return [_tokenA.address, _tokenB.relay, _tokenB.address];
    } else {
      return [_tokenA.address, _tokenA.relay, _tokenB.address];
    }
  } else if (oneIsEth) {
    if (_tokenA.isEth) {
      return [
        _tokenA.address,
        _bntToken.relay,
        _bntToken.address,
        _tokenB.relay,
        _tokenB.address
      ];
    } else {
      return [
        _tokenA.address,
        _tokenA.relay,
        _bntToken.address,
        _bntToken.relay,
        _tokenB.address
      ];
    }
  } else {
    return [
      _tokenA.address,
      _tokenA.relay,
      _bntToken.address,
      _tokenB.relay,
      _tokenB.address
    ];
  }
});

const updateReturn = async o => {
  const _selected = get(pairsAreSelected);
  if (!_selected) return;

  const sendAmount = toWei(get(o.inputA), "ether");
  loading.update(() => true);

  const _path = get(path);
  const currentPath =
    get(o.tokenA).address === get(tokenA).address ? _path : _path.reverse();

  const _bancorNetwork = get(bancorNetwork);
  const { receiveAmount, fee } = await _bancorNetwork.methods
    .getReturnByPath(currentPath, sendAmount)
    .call()
    .then(res => ({
      receiveAmount: fromWei(res["0"], "ether"),
      fee: res["1"]
    }));

  o.inputB.update(() => receiveAmount);
  loading.update(() => false);
};

const convert = async (amount = Required("amount")) => {
  amount = toWei(amount, "ether");

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

  return _bancorNetwork.methods.convert(get(path), amount, 1).send({
    from: _account,
    value: _tokenA.isEth ? amount : 0
  });
};

export {
  loading,
  tokenAInput,
  tokenA,
  tokensA,
  tokenB,
  tokenBInput,
  tokensB,
  convert,
  pairsAreSelected,
  updateReturn
};
