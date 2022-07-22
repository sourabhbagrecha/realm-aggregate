import { computeAccumulator } from "../utils";

const applyGroupStage = (query: any, data: any) => {
  const results: any[] = [];
  const { _id, ...groupFields } = query;
  for (let item of data) {
    const identifier = _id ? item[_id.slice(1)] : null;
    let currentItem = results.find((r) => r._id === identifier);

    if (!currentItem) {
      currentItem = { _id: identifier, __originalItems: [item] };
      results.push(currentItem);
    } else {
      currentItem.__originalItems.push(item);
    }
  }
  for (const [fieldName, accumulatorObject] of Object.entries(groupFields) as any) {
    for (let group of results) {
      group[fieldName] = computeAccumulator(accumulatorObject, group.__originalItems);
    }
  }
  results.forEach((result) => delete result.__originalItems);
  return results;
};

export { applyGroupStage };
