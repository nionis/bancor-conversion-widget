export const lightTheme = {
  containerBg: "#FFFEFE",
  containerFont: "black",
  containerBorder: "rgba(11, 46, 87, 0.4)",
  inputBg: "#FFFEFE",
  inputFont: "black",
  inputBorder: "#0B2E57",
  selectBg: "#F0F0F0",
  selectFont: "black",
  selectBorder: "#0B2E57",
  buttonBg: "#0B2E57",
  buttonFont: "white",
  buttonBorder: "#000000",
  compareArrows: "#0B2E57",
  selectArrow: "black"
};

export const darkTheme = {
  containerBg: "#6B6B6B",
  containerFont: "white",
  containerBorder: "#A5A5A5",
  inputBg: "#353535",
  inputFont: "white",
  inputBorder: "#102644",
  selectBg: "#474747",
  selectFont: "white",
  selectBorder: "#102644",
  buttonBg: "#474747",
  buttonFont: "white",
  buttonBorder: "#363636",
  compareArrows: "white",
  selectArrow: "white"
};

export const Cursor = ({ disabled, loading }) =>
  disabled || loading ? "default" : "pointer";
export const Opacity = ({ disabled, hover }) => {
  if (disabled || hover) return 0.75;

  return 1;
};

const Colors = (theme, colors) => {
  return {
    ...(theme === "dark" ? darkTheme : lightTheme),
    ...colors
  };
};

export default Colors;
