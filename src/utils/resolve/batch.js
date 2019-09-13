import rSingle from "./single";

const rBatch = batch => {
  return Promise.all(
    batch.map(item => {
      return rSingle(item);
    })
  );
};

export default rBatch;
