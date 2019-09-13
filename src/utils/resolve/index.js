import chunk from "lodash/chunk";
import flatten from "lodash/flatten";
import rBatches from "./batches";

const recursiveOps = {
  maxTries: 2,
  chunkSize: 5
};

const recursive = (
  items,
  {
    maxTries = recursiveOps.maxTries,
    chunkSize = recursiveOps.chunkSize
  } = recursiveOps
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
      return recursive(newItems, {
        maxTries: --maxTries,
        chunkSize
      });
    return resultItems;
  });
};

export default recursive;
