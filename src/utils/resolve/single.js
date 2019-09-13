const rSingle = async ({ id, fn }) => {
  return fn()
    .then(result => ({
      id,
      success: true,
      result
    }))
    .catch(err => {
      console.log(err);

      return {
        id,
        success: false,
        result: undefined
      };
    });
};

export default rSingle;
