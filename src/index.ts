import realm from "realm";
import {
  applyAddFieldsStage,
  applyGroupStage,
  applyLimitStage,
  applyMatchStage,
  applyProjectStage,
  applySkipStage,
  applySortStage,
} from "./stages";

const aggregate = (aggregationPipeline: any[], collection: Realm.Collection<unknown>) => {
  let data = collection.toJSON();
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
      case "$sort":
        return applySortStage(query, data);
      case "$project":
        return applyProjectStage(query, data);
      case "$limit":
        return applyLimitStage(query, data);
      case "$skip":
        return applySkipStage(query, data);
      case "$addFields":
        return applyAddFieldsStage(query, data);
      default: {
        throw new Error(`The stage parameter ${stage} has no implementation.`);
      }
    }
  }
};

export { aggregate };
