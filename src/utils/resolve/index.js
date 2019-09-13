/*
  recursively resolve promises in batches
  until it's all done or reaches max tries
*/
import chunk from "lodash/chunk";
import flatten from "lodash/flatten";
import rBatches from "./batches";

const ops = {
  maxTries: 2,
  chunkSize: 5
};

const resolve = (
  items,
  { maxTries = ops.maxTries, chunkSize = ops.chunkSize } = ops
) => {
  if (maxTries === 0) return [];

  const batches = chunk(items, chunkSize);

  return rBatches(batches).then(results => {
    const resultItems = flatten(results);

    const newItems = resultItems.reduce((result, item) => {
      if (item.success) return result;

      result.push({
        id: item.id,
        fn: item.fn
      });

      return result;
    }, []);

    if (newItems.length)
      return resolve(newItems, {
        maxTries: --maxTries,
        chunkSize
      });
    return resultItems;
  });
};

export default resolve;
