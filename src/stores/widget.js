/*
  A store to manage widget state
*/
import { writable, derived, get } from "svelte/store";
import { toBN, fromWei, toWei } from "web3x-es/utils";
import * as ethStore from "./eth";
import * as tokensStore from "./tokens";
import * as stepsStore from "./steps";
import Contract from "../utils/Contract";
import { zeroAddress } from "../utils/eth";
import Required from "../utils/Required";
import derivedPluck from "../utils/derivedPluck";

const loading = writable(false); // is widget loading
const errorMsg = writable(undefined); // error message to be displayed
const tokenSend = writable(undefined);
const tokenSendInput = writable("0");
const tokenReceive = writable(undefined);
const tokenReceiveInput = writable("0");
const affiliate = writable(undefined);
const affiliateFee = writable("0");

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
  affiliateFee.update(() => "0");
};

// update the other input with convert amount
const updateReturn = async o => {
  const _selected = get(pairsAreSelected);
  if (!_selected) return;

  // reset steps
  stepsStore.clearSteps();
  // reset affiliate fee
  affiliateFee.update(() => "0");

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

  const {
    receiveAmountWei = "0",
    receiveAmount = "0"
  } = await _bancorNetwork.methods
    .getReturnByPath(currentPath, sendAmount)
    .call()
    .then(res => ({
      receiveAmountWei: res["0"],
      receiveAmount: fromWei(res["0"], "ether"),
      fee: res["1"]
    }))
    .catch(error => {
      console.error(error);
      resetInputs();

      return {};
    });

  // update fees
  if (!get(o.tokenReceive).isEth) {
    affiliateFee.update(() => {
      const $affiliate = get(affiliate);

      return $affiliate
        ? toBN(receiveAmountWei)
          .mul(toBN($affiliate.fee))
          .div(toBN(100))
          .toString()
        : 0;
    });
  }

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

  if (!_tokenSend.isEth && !isAllowed && !toBN(allowance).isZero()) {
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

  if (!_tokenSend.isEth && !isAllowed) {
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
        const fn = _tokenSend.isEth ? "convert2" : "claimAndConvert2";
        const ethAmount = _tokenSend.isEth ? amount : undefined;
        const $affiliate = get(affiliate);
        const $affiliateFee = get(affiliateFee);

        const affiliateAccount = $affiliate ? $affiliate.account : zeroAddress;
        const affiliateFeePPM = $affiliateFee
          ? toBN($affiliateFee)
            .mul(toBN(1e6))
            .div(toBN(100))
            .toString()
          : "0";

        console.log({
          affiliateAccount,
          affiliateFeePPM
        });

        return _bancorNetwork.methods[fn](
          get(path),
          amount,
          1,
          affiliateAccount,
          affiliateFeePPM
        ).send({
          from: _account,
          value: ethAmount
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
  affiliate,
  affiliateFee,
  tokensSend,
  tokensReceive,
  pairsAreSelected,
  path,
  resetInputs,
  updateReturn,
  convert
};
