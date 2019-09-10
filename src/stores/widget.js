import { writable, derived } from "svelte/store";
import { tokens } from "./registry";

const unselect = (tokens, token) => {
  return derived([tokens, token], ([tokens, token]) => {
    const arr = Array.from(tokens.values());
    if (!token) return arr;

    return arr.filter(_token => _token.address !== token.address);
  });
};

const tokenA = writable(null);
const tokensA = unselect(tokens, tokenA);

const tokenB = writable(null);
const tokensB = unselect(tokens, tokenB);

export { tokenA, tokensA, tokenB, tokensB };
