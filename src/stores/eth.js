/*
  A store to initialize and listen to ethereum events.
  Account and network changes all dynamically updated.
*/

import { Eth } from "web3x-es/eth";
import { LegacyProviderAdapter } from "web3x-es/providers";
import { writable, derived, get } from "svelte/store";

const eth = writable(undefined); // ethereum instance
const installed = writable(false); // metamask is installed on user's browser
const accepted = writable(false); // user has accepted this website on metamask
const account = writable(undefined); // current account address
const networkId = writable(undefined); // current networkId
const isLoggedIn = derived(account, v => !!v); // is user logged in (account exists)

const getEth = async () => {
  let _eth = undefined;

  if (window.ethereum) {
    console.log(`Injected ethereum detected.`);
    _eth = new Eth(new LegacyProviderAdapter(window.ethereum));
  } else if (window.web3) {
    console.log(`Injected web3 detected.`);
    _eth = new Eth(new LegacyProviderAdapter(window.web3.currentProvider));
  }

  if (_eth) {
    eth.update(() => _eth);
    installed.update(() => true);
  }

  return _eth;
};

const getNetworkId = async () => {
  const _eth = get(eth);
  if (!_eth) return undefined;

  return _eth.getId();
};

const getAccept = async () => {
  const _accepted = await new Promise(resolve => {
    if (window.ethereum) {
      console.log("Requesting accept.");

      return window.ethereum
        .enable()
        .then(() => {
          console.log(`Accepted.`);

          resolve(true);
        })
        .catch(error => {
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

const getAccount = async () => {
  const accounts = (await get(eth).getAccounts()) || [];

  return accounts[0] || undefined;
};

// check and update data
const sync = async () => {
  const _networkId = await getNetworkId();
  networkId.update(() => _networkId);

  const _account = await getAccount();
  account.update(() => _account);
};

// initialize and subscribe to ethereum events
const init = async () => {
  const _eth = await getEth();
  await sync();

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", accounts => {
      account.update(() => accounts[0] || undefined);
    });

    window.ethereum.on("networkChanged", _networkId => {
      networkId.update(() => _networkId);
    });
  } else {
    setInterval(sync, 1e3);
  }

  return _eth;
};

export {
  eth,
  installed,
  accepted,
  account,
  networkId,
  isLoggedIn,
  getEth,
  getNetworkId,
  getAccept,
  getAccount,
  sync,
  init
};
