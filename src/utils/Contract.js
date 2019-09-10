import { commit } from "../env";
import safeFetch from "../utils/safeFetch";

const abis = {};

const Contract = async (eth, name, address) => {
  if (!abis[name]) {
    const url = `https://rawcdn.githack.com/bancorprotocol/contracts/${commit}/solidity/build/${name}.abi`;

    abis[name] = await safeFetch(url);
  }

  return eth.contract(abis[name]).at(address);
};

export default Contract;
