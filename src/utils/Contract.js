/*
  create a contract instance of name and address
  abi is downloaded from Bancor's github
  abi is cached
*/

import { Contract as EthContract, ContractAbi } from "web3x-es/contract";
import safeFetch from "../utils/safeFetch";
import { commit } from "../env";

const abis = {};

const Contract = async (eth, name, address) => {
  if (!abis[name]) {
    const url = `https://rawcdn.githack.com/bancorprotocol/contracts/${commit}/solidity/build/${name}.abi`;

    abis[name] = await safeFetch(url).then(abi => new ContractAbi(abi));
  }

  return new EthContract(eth, abis[name], address, {});
};

export default Contract;
