import { writable, derived } from "svelte/store";
import { tokens as tokensMap } from "./registry";

const toItems = tokens => {
  return Array.from(tokens.values()).map(token => ({
    value: token.address,
    label: token.name
  }));
};

const derivedPluck = (tokens, token) => {
  return derived([tokens, token], ([tokens, token]) => {
    if (token) {
      tokens.delete(token.address);
    }

    return toItems(tokens);
  });
};

const tokenA = writable(undefined);
const tokenB = writable(undefined);
const tokensA = derivedPluck(tokensMap, tokenB);
const tokensB = derivedPluck(tokensMap, tokenA);

export { tokenA, tokensA, tokenB, tokensB };
