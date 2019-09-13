/*
  A store to manage widget state
*/
import { writable, derived, get } from "svelte/store";
import { toBN, fromWei, toWei } from "web3x-es/utils";
import * as ethStore from "./eth";
import * as tokensStore from "./tokens";
import Contract from "../utils/Contract";
import Required from "../utils/Required";
import derivedPluck from "../utils/derivedPluck";

const loading = writable(false); // is widget loading
const errorMsg = writable(undefined); // error message to be displayed
const tokenA = writable(undefined);
const tokenAInput = writable("0");
const tokenB = writable(undefined);
const tokenBInput = writable("0");
const tokensA = derivedPluck(tokensStore.tokens, tokenB); // a Map of all tokens except tokenB (used in "Select")
const tokensB = derivedPluck(tokensStore.tokens, tokenA); // a Map of all tokens except tokenA (used in "Select")
const pairsAreSelected = derived([tokenA, tokenB], ([_tokenA, _tokenB]) => {
  return Boolean(_tokenA && _tokenB);
}); // true if both pairs are selected
const path = derived([tokenA, tokenB], ([_tokenA, _tokenB]) => {
  if (!get(pairsAreSelected)) return [];

  const _bntToken = get(tokensStore.tokens).get(
    get(tokensStore.bntToken).address
  );
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
}); // BancorNetwork path to be used for exchanging

// reset both inputs
const resetInputs = () => {
  tokenAInput.update(() => "0");
  tokenBInput.update(() => "0");
};

// update the other input with exchange amount
const updateReturn = async o => {
  const _selected = get(pairsAreSelected);
  if (!_selected) return;

  const sendAmount = toWei(get(o.inputA)) || "0";
  if (sendAmount === "0") {
    return resetInputs();
  }

  loading.update(() => true);

  const _path = get(path);
  const currentPath =
    get(o.tokenA).address === get(tokenA).address ? _path : _path.reverse();

  const _bancorNetwork = get(tokensStore.bancorNetwork);

  const { receiveAmount = "0", fee = "0" } = await _bancorNetwork.methods
    .getReturnByPath(currentPath, sendAmount)
    .call()
    .then(res => ({
      receiveAmount: fromWei(res["0"], "ether"),
      fee: res["1"]
    }))
    .catch(err => {
      console.error(err);
      resetInputs();

      return {};
    });

  o.inputB.update(() => receiveAmount);
  loading.update(() => false);
};

// exchange tokens
const convert = async (amount = Required("amount")) => {
  errorMsg.update(() => undefined);
  amount = toWei(amount) || "0";

  const _eth = get(eth);
  if (!_eth) {
    throw Error("eth does not exist");
  }

  const _tokenA = get(tokenA);
  const _tokenB = get(tokenB);
  if (!_tokenA || !_tokenB) {
    throw Error("pairs not selected");
  }

  let _account = get(ethStore.account);
  if (!_account) {
    await getAccept();
    _account = get(ethStore.account);
  }
  if (!_account) {
    throw Error("account not accepted");
  }

  const _bancorNetwork = get(tokensStore.bancorNetwork);

  const token = await Contract(
    _eth,
    _tokenA.isEth ? "EtherToken" : "ERC20Token",
    _tokenA.address
  );

  // TODO: error msgs
  const [balance, ethBalance, allowance] = await Promise.all([
    token.methods.balanceOf(_account).call(),
    _eth.getBalance(_account),
    token.methods.allowance(_account, _bancorNetwork.address).call()
  ]);

  const enoughBalance = toBN(balance).gte(toBN(amount));
  const enoughEthBalance = toBN(ethBalance).gte(toBN(amount));
  const isAllowed = toBN(allowance).gte(toBN(amount));
  const insufficientBalance =
    (!enoughBalance && !_tokenA.isEth) ||
    (!enoughBalance && _tokenA.isEth && !enoughEthBalance);

  console.log({
    ethBalance,
    balance,
    enoughBalance,
    insufficientBalance,
    allowance,
    isAllowed
  });

  // insufficient funds
  if (insufficientBalance) {
    errorMsg.update(() => "Insufficient funds.");
    return;
  }

  if (!enoughBalance && _tokenA.isEth) {
    console.log("depositing eth");
    return token.methods.deposit().send({
      from: _account,
      value: amount
    });
  } else if (!isAllowed && !toBN(allowance).isZero()) {
    console.log("reset approve");
    return token.methods.approve(_bancorNetwork.address, 0).send({
      from: _account
    });
  } else if (!isAllowed) {
    console.log("approve amount");
    return token.methods.approve(_bancorNetwork.address, amount).send({
      from: _account
    });
  } else {
    console.log("claim and convert");
    return _bancorNetwork.methods.claimAndConvert(get(path), amount, 1).send({
      from: _account
    });
  }
};

export {
  loading,
  errorMsg,
  tokenA,
  tokenAInput,
  tokenB,
  tokenBInput,
  tokensA,
  tokensB,
  pairsAreSelected,
  path,
  resetInputs,
  updateReturn,
  convert
};
