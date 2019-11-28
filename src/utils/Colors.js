/*
  our default colors and some style related utils
*/

export const colors = {
  containerBg: "white",
  containerFont: "black",
  topTokenBg: "#0D1A2C",
  topTokenFont: "white",
  bottomTokenBg: "white",
  bottomTokenFont: "black",
  summaryBg: "#E1E1E1",
  selectBorder: "#E1E1E1",
  summaryFont: "black",
  disabledFont: "#787878",
  buttonBg: "#0D1A2C",
  buttonFont: "white",
  compareArrows: "black",
  hoverBackgroundColor: "#EDEDED",
  successColor: "#0EAD00"
};

export const Cursor = ({ disabled, loading }) => {
  if (disabled || loading) return "default";

  return "pointer";
};

export const Opacity = ({ disabled, hover }) => {
  if (disabled || hover) return 0.75;

  return 1;
};

export const Colors = _colors => ({
  ...colors,
  ..._colors
});

export default Colors;
