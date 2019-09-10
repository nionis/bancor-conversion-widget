import Eth from "ethjs";
import { writable, derived, get } from "svelte/store";

const eth = writable(null);
const installed = writable(false);
const accepted = writable(false);
const account = writable(null);
const networkId = writable(null);
const isLoggedIn = derived(account, v => !!v);

const accept = () => {
  return new Promise(resolve => {
    if (window.ethereum) {
      console.log("Requesting accept.");

      return window.ethereum
        .enable()
        .then(() => {
          console.log(`Accepted.`);

          resolve(true);
        })
        .catch(err => {
          console.error(err);
          console.log(`Rejected.`);

          resolve(false);
        });
    }

    resolve(true);
  });
};

const getEthFromWindow = async () => {
  let _eth = null;

  if (window.ethereum) {
    console.log(`Injected ethereum detected.`);
    _eth = new Eth(window.ethereum);
  } else if (window.web3) {
    console.log(`Injected web3 detected.`);
    _eth = new Eth(window.web3.currentProvider);
  }

  return _eth;
};

const getAccount = async () => {
  const accounts = (await get(eth).accounts()) || [];

  return accounts[0] || null;
};

const getNetworkId = async () => {
  const networkId = get(eth).currentProvider.networkVersion;

  return networkId;
};

const sync = async () => {
  const _account = await getAccount();
  account.update(() => _account);

  const _networkId = await getNetworkId();
  networkId.update(() => _networkId);
};

const init = async () => {
  const [_eth, _accepted] = await Promise.all([getEthFromWindow(), accept()]);

  if (_eth) {
    eth.update(() => _eth);
    installed.update(() => true);
  }

  if (_accepted) {
    accepted.update(() => true);
  }

  await sync();

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", accounts => {
      account.update(() => accounts[0] || null);
    });

    window.ethereum.on("networkChanged", _networkId => {
      networkId.update(() => _networkId);
    });
  } else {
    setInterval(sync, 1e3);
  }
};

export { eth, installed, accepted, account, networkId, isLoggedIn, init };
