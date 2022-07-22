import { extractOpAndCalExpr } from "./utils";

type Accumulator = "$sum" | "$avg" | "$min" | "$max" | "$push";
const supportedAccumulators: Accumulator[] = ["$sum", "$avg", "$min", "$max", "$push"];

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

const runAccumulatorExpressions = {
  $sum: (items: any[], expression: any): number => {
    return items.reduce((acc: any, item) => {
      return acc + extractOpAndCalExpr(expression, item) ?? 0;
    }, 0);
  },
  $avg: (items: any[], expression: string): number => {
    return (
      items.reduce((acc: any, item) => {
        return acc + extractOpAndCalExpr(expression, item) ?? 0;
      }, 0) / items.length
    );
  },
  $min: (items: any[], expression: string): number => {
    return items.reduce((acc: any, item) => {
      const value = extractOpAndCalExpr(expression, item);
      return value < acc ? value : acc;
    }, Infinity);
  },
  $max: (items: any[], expression: string): number => {
    return items.reduce((acc: any, item) => {
      const value = extractOpAndCalExpr(expression, item);
      return value > acc ? value : acc;
    }, -Infinity);
  },
  $push: (items: any[], expression: string): any[] => {
    return items.map((item) => {
      return extractOpAndCalExpr(expression, item);
    });
  },
};

const computeAccumulator = (
  accumulatorObject: any,
  items: any[],
): number | string | any[] | any => {
  const accumulatorName = Object.keys(accumulatorObject as any)[0] as Accumulator;
  const expression = accumulatorObject[accumulatorName];

  if (supportedAccumulators.includes(accumulatorName)) {
    const typeOfExpression = typeof expression;
    if (["string", "number", "object"].includes(typeOfExpression)) {
      return runAccumulatorExpressions[accumulatorName](items, expression);
    }
    throw new Error(`Invalid expression ${expression} given for accumulator ${accumulatorName}`);
  } else {
    throw new Error(`${accumulatorName} is not supported!`);
  }
};

export { applyGroupStage };
