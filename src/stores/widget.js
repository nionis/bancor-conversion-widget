/*
  A store to manage widget state
*/
import { writable, derived, get } from "svelte/store";
import { toBN, fromWei, toWei } from "web3x-es/utils";
import * as ethStore from "./eth";
import * as tokensStore from "./tokens";
import * as stepsStore from "./steps";
import Contract from "../utils/Contract";
import Required from "../utils/Required";
import derivedPluck from "../utils/derivedPluck";

const loading = writable(false); // is widget loading
const errorMsg = writable(undefined); // error message to be displayed
const tokenSend = writable(undefined);
const tokenSendInput = writable("0");
const tokenReceive = writable(undefined);
const tokenReceiveInput = writable("0");
const tokensSend = derivedPluck(tokensStore.tokens, tokenReceive); // a Map of all tokens except tokenReceive (used in "Select")
const tokensReceive = derivedPluck(tokensStore.tokens, tokenSend); // a Map of all tokens except tokenSend (used in "Select")
const pairsAreSelected = derived(
  [tokenSend, tokenReceive],
  ([_tokenSend, _tokenReceive]) => {
    return Boolean(_tokenSend && _tokenReceive);
  }
); // true if both pairs are selected
const path = derived(
  [tokenSend, tokenReceive],
  ([_tokenSend, _tokenReceive]) => {
    if (!get(pairsAreSelected)) return [];

    const _bntToken = get(tokensStore.tokens).get(
      get(tokensStore.bntToken).address
    );
    const oneIsEth = _tokenSend.isEth || _tokenReceive.isEth;
    const oneIsBNT = _tokenSend.isBNT || _tokenReceive.isBNT;

    if (oneIsEth && oneIsBNT) {
      if (_tokenSend.isEth) {
        return [_tokenSend.address, _tokenReceive.relay, _tokenReceive.address];
      } else {
        return [_tokenSend.address, _tokenSend.relay, _tokenReceive.address];
      }
    } else if (oneIsBNT) {
      if (_tokenSend.isBNT) {
        return [_tokenSend.address, _tokenReceive.relay, _tokenReceive.address];
      } else {
        return [_tokenSend.address, _tokenSend.relay, _tokenReceive.address];
      }
    } else if (oneIsEth) {
      if (_tokenSend.isEth) {
        return [
          _tokenSend.address,
          _bntToken.relay,
          _bntToken.address,
          _tokenReceive.relay,
          _tokenReceive.address
        ];
      } else {
        return [
          _tokenSend.address,
          _tokenSend.relay,
          _bntToken.address,
          _bntToken.relay,
          _tokenReceive.address
        ];
      }
    } else {
      return [
        _tokenSend.address,
        _tokenSend.relay,
        _bntToken.address,
        _tokenReceive.relay,
        _tokenReceive.address
      ];
    }
  }
); // BancorNetwork path to be used for exchanging

// reset both inputs
const resetInputs = () => {
  tokenSendInput.update(() => "0");
  tokenReceiveInput.update(() => "0");
};

// update the other input with convert amount
const updateReturn = async o => {
  const _selected = get(pairsAreSelected);
  if (!_selected) return;

  const sendAmount = toWei(get(o.inputSend)) || "0";
  if (sendAmount === "0") {
    return resetInputs();
  }

  loading.update(() => true);

  const _path = get(path);
  const currentPath =
    get(o.tokenSend).address === get(tokenSend).address
      ? _path
      : _path.reverse();

  const _bancorNetwork = get(tokensStore.bancorNetwork);

  const { receiveAmount = "0", fee = "0" } = await _bancorNetwork.methods
    .getReturnByPath(currentPath, sendAmount)
    .call()
    .then(res => ({
      receiveAmount: fromWei(res["0"], "ether"),
      fee: res["1"]
    }))
    .catch(error => {
      console.error(error);
      resetInputs();

      return {};
    });

  o.inputReceive.update(() => receiveAmount);
  loading.update(() => false);
};

// convert tokens
const convert = async (amount = Required("amount")) => {
  // if steps are already created, switch to steps view
  if (get(stepsStore.steps).length > 1) {
    stepsStore.open();
    return;
  }

  errorMsg.update(() => undefined);
  amount = toWei(amount) || "0";

  const _eth = get(ethStore.eth);
  if (!_eth) {
    throw Error("eth does not exist");
  }

  const _tokenSend = get(tokenSend);
  const _tokenReceive = get(tokenReceive);
  if (!_tokenSend || !_tokenReceive) {
    throw Error("pairs not selected");
  }

  let _account = get(ethStore.account);
  if (!_account) {
    await ethStore.getAccept();
    _account = get(ethStore.account);
  }
  if (!_account) {
    throw Error("account not accepted");
  }

  const _bancorNetwork = get(tokensStore.bancorNetwork);

  loading.update(() => true);

  const token = await Contract(
    _eth,
    _tokenSend.isEth ? "EtherToken" : "ERC20Token",
    _tokenSend.address
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
    (!enoughBalance && !_tokenSend.isEth) ||
    (!enoughBalance && _tokenSend.isEth && !enoughEthBalance);

  loading.update(() => false);

  // insufficient funds
  if (insufficientBalance) {
    errorMsg.update(() => "Insufficient funds.");
    return;
  }

  const steps = [];

  if (!enoughBalance && _tokenSend.isEth) {
    steps.push(
      stepsStore.Step({
        text: "Deposit ETH.",
        fn: stepsStore.SyncStep(async () => {
          return token.methods.deposit().send({
            from: _account,
            value: amount
          });
        })
      })
    );
  }

  if (!isAllowed && !toBN(allowance).isZero()) {
    steps.push(
      stepsStore.Step({
        text: "Reset token allowance to 0.",
        fn: stepsStore.SyncStep(async () => {
          return token.methods.approve(_bancorNetwork.address, 0).send({
            from: _account
          });
        })
      })
    );
  }

  if (!isAllowed) {
    steps.push(
      stepsStore.Step({
        text: "Approve token withdrawal.",
        fn: stepsStore.SyncStep(async () => {
          return token.methods.approve(_bancorNetwork.address, amount).send({
            from: _account
          });
        })
      })
    );
  }

  steps.push(
    stepsStore.Step({
      text: "Convert.",
      fn: stepsStore.SyncStep(async () => {
        return _bancorNetwork.methods
          .claimAndConvert(get(path), amount, 1)
          .send({
            from: _account
          });
      })
    })
  );

  stepsStore.addSteps(steps);

  // if only one step is required, don't switch to steps view
  if (steps.length !== 1) {
    stepsStore.open();
  }
};

export {
  loading,
  errorMsg,
  tokenSend,
  tokenSendInput,
  tokenReceive,
  tokenReceiveInput,
  tokensSend,
  tokensReceive,
  pairsAreSelected,
  path,
  resetInputs,
  updateReturn,
  convert
};
