const rSingle = async ({ id, fn }) => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({
        id,
        fn,
        success: false,
        result: undefined,
      });
    }, 5e3);

    fn()
      .then((result) => {
        clearTimeout(timer);

        resolve({
          id,
          fn,
          success: true,
          result,
        });
      })
      .catch((error) => {
        console.error(error);
        clearTimeout(timer);

        resolve({
          id,
          fn,
          success: false,
          result: undefined,
        });
      });
  });
};

export default rSingle;
