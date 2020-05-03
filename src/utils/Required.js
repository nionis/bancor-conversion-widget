const Required = (name) => {
  throw new Error(`prop ${name} not provided`);
};

export default Required;
