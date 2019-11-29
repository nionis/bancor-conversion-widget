export const zeroAddress = "0x0000000000000000000000000000000000000000";

export const fromDecimals = (amount, decimals) => {
  return String(Number(amount) / 10 ** Number(decimals));
};

export const toDecimals = (amount, decimals) => {
  return String(Number(amount) * 10 ** Number(decimals));
};
