import realm from "realm";
import sift from "sift";

const aggregate = (aggregationPipeline: any[], realm: realm, model: string) => {
  let data = realm.objects(model).toJSON();
  aggregationPipeline.forEach((aggregation) => {
    data = applyAggregation(aggregation, data);
  });
  return data;
};

const applyAggregation = (aggregation: any, data: any) => {
  for (const stage in aggregation) {
    const query = aggregation[stage];
    switch (stage) {
      case "$match":
        return applyMatchStage(query, data);
      case "$group":
        return applyGroupStage(query, data);
      case "$project":
        return applyProjectStage(query, data);
      default: {
        throw new Error(`The stage parameter ${stage} has no implementation.`);
      }
    }
  }
};

const applyMatchStage = (query: any, data: any) => {
  return data.filter(sift(query));
};

const applyGroupStage = (query: any, data: any) => {
  const results: any[] = [];
  for (let item of data) {
    const { _id, ...accumulators } = query;
    const identifier = item[_id.slice(1)];
    let currentItem = results.find((r) => r._id === identifier);
    if (!currentItem) {
      currentItem = { _id: identifier };
      results.push(currentItem);
    }
    for (const [key, value] of Object.entries(accumulators) as any) {
      // key: totalAmount
      // value: { $sum: "$amount" }
      const expression = Object.keys(value as any)[0];
      const expressionValue = value[expression];
      switch (expression) {
        case "$sum":
          if (!currentItem[key]) {
            currentItem[key] = 0;
          }
          currentItem[key] += item[expressionValue.slice(1)];
          break;
        default: {
          throw new Error(
            `The expression: ${expression} has no implementation.`
          );
        }
      }
    }
  }
  return results;
};

const applyProjectStage = (query: any, data: any) => {
  const { _id, ...queryApartFromId } = query;
  const projectEntries = Object.entries(queryApartFromId);
  const projectValues = Object.values(queryApartFromId);
  let exclusionsExists =
    projectValues.includes(0) || projectValues.includes(false);
  let inclusionsExists =
    projectValues.includes(1) ||
    projectValues.includes(true) ||
    projectValues.includes(
      (v: any) => typeof v === "string" || typeof v === "object"
    );
  if (exclusionsExists && inclusionsExists) {
    throw new Error(
      "$project does not support exclusions & inclusions together."
    );
  }
  if (inclusionsExists) {
    return data.map((item: any) => {
      const result: any = {};
      for (let [key, value] of projectEntries) {
        if (value === 1 || value === true) result[key] = item[key];
        else if (typeof value === "string") result[key] = item[value.slice(1)];
        else throw new Error(`Project with value: ${value} is not supported`);
      }
      return result;
    });
  } else {
    return data.map((item: any) => {
      const result = item;
      for (let [key, value] of projectEntries) {
        if (value === 0 || value === false) delete result[key];
      }
      return result;
    });
  }
};

export { aggregate };
