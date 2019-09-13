import { derived } from "svelte/store";

// removes specified token from within map and returns the rest
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
