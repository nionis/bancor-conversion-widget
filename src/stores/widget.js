import { writable, derived } from "svelte/store";
import { tokens as tokensMap } from "./registry";

const toItems = tokens => {
  return Array.from(tokens.values()).map(token => ({
    value: token.address,
    label: token.name
  }));
};

const pluck = (tokens, token) => {
  return derived([tokens, token], ([tokens, token]) => {
    if (token) {
      tokens.delete(token.address);
    }

    return toItems(tokens);
  });
};

const tokenA = writable(undefined);
const tokenB = writable(undefined);

const tokensA = pluck(tokensMap, tokenB);
const tokensB = pluck(tokensMap, tokenA);

export { tokenA, tokensA, tokenB, tokensB };
