/*
  A store that initializes and listens to ethereum events.
  Account and network changes are all dynamically updated.
*/

import Web3 from "web3";
import { writable, derived, get } from "svelte/store";
import { SDK as BancorSDK } from "bancor-sdk";

export const eth = writable(undefined); // ethereum instance
export const installed = writable(false); // metamask is installed on user's browser
export const accepted = writable(false); // user has accepted this website on metamask
export const account = writable(undefined); // current account address
export const networkId = writable(undefined); // current networkId
export const bancorSDK = writable(undefined); // bancor sdk's instance
export const isLoggedIn = derived(account, (v) => !!v); // is user logged in (account exists)

export const getEth = async () => {
  let _eth = undefined;

  if (window.ethereum) {
    console.log(`Injected ethereum detected.`);
    _eth = new Web3(window.ethereum);
  } else if (window.web3) {
    console.log(`Injected web3 detected.`);
    _eth = new Web3(window.web3.currentProvider);
  }

  if (_eth) {
    eth.update(() => _eth);
    installed.update(() => true);
  }

  return _eth;
};

export const getNetworkId = async () => {
  const _eth = get(eth);
  if (!_eth) return undefined;

  return _eth.eth.net.getId();
};

export const getAccept = async () => {
  const _accepted = await new Promise((resolve) => {
    if (window.ethereum) {
      console.log("Requesting accept.");

      return window.ethereum
        .enable()
        .then(() => {
          console.log(`Accepted.`);

          resolve(true);
        })
        .catch((error) => {
          console.error(error);
          console.log(`Rejected.`);

          resolve(false);
        });
    }

    resolve(true);
  });

  if (_accepted) {
    accepted.update(() => _accepted);
    await sync();
  }

  return _accepted;
};

export const getAccount = async () => {
  const accounts = (await get(eth).eth.getAccounts()) || [];

  return accounts[0] || undefined;
};

// check and update data
export const sync = async () => {
  const _networkId = await getNetworkId();
  networkId.update(() => _networkId);

  const _account = await getAccount();
  account.update(() => _account);
};

// initialize and subscribe to ethereum events
export const init = async () => {
  const _eth = await getEth();

  const _bancorSDK = await BancorSDK.create({
    ethereumNodeEndpoint:
      "wss://mainnet.infura.io/ws/v3/fa917c0fa5d0484bad5cb44f1205c6d6",
  });
  bancorSDK.update(() => _bancorSDK);
  await sync();

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      account.update(() => accounts[0] || undefined);
    });

    window.ethereum.on("networkChanged", (_networkId) => {
      networkId.update(() => _networkId);
    });
  } else {
    setInterval(sync, 1e3);
  }

  return _eth;
};
