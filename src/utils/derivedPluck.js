// removes specified token from within map and returns the rest

import { derived } from "svelte/store";

const derivedPluck = (tokens, token) => {
  return derived([tokens, token], ([tokens, token]) => {
    const newTokens = new Map(tokens);

    if (token) {
      newTokens.delete(token.address);
    }

    return newTokens;
  });
};

export default derivedPluck;
