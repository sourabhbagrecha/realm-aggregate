import { extractOpAndCalExpr } from "./operators";

type Accumulator = "$sum" | "$avg" | "$min" | "$max" | "$push";
const supportedAccumulators: Accumulator[] = ["$sum", "$avg", "$min", "$max", "$push"];

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

export const computeAccumulator = (
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
