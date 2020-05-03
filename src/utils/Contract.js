/*
  create a contract instance of name and address
  abi is downloaded from Bancor's github
  abi is cached
*/

import safeFetch from "../utils/safeFetch";
import { commit } from "../env";

const abis = {};

const Contract = async (web3, name, address) => {
  if (!abis[name]) {
    const url = `https://rawcdn.githack.com/bancorprotocol/contracts/${commit}/solidity/build/${name}.abi`;
    abis[name] = await safeFetch(url);
  }

  return new web3.eth.Contract(abis[name], address);
};

export default Contract;
