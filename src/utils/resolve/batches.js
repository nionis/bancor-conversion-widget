import rBatch from "./batch";

const rBatches = async (batches) => {
  const results = [];

  let batch;
  while ((batch = batches.pop())) {
    results.push(await rBatch(batch));
  }

  return results;
};

export default rBatches;
