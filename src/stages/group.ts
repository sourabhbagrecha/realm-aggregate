type Accumulator = "$sum" | "$avg" | "$min" | "$max" | "$push" | "$addToSet";
const supportedAccumulators: Accumulator[] = ["$sum", "$avg", "$min", "$max", "$push", "$addToSet"];

const applyGroupStage = (query: any, data: any) => {
  const results: any[] = [];
  const { _id, ...groupFields } = query;
  for (let item of data) {
    const identifier = item[_id.slice(1)];
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
      const result = computeAccumulator(accumulatorObject, group.__originalItems);
      group[fieldName] = result;
    }
  }

  results.forEach((result) => delete result.__originalItems);
  return results;
};

const runAccumulatorExpressions = {
  $sum: (items: any[], expression: any): number => {
    return items.reduce((acc: any, item) => {
      if (typeof expression === "object") {
        const operatorName = Object.keys(expression)[0];
        return acc + computeOperatorExpression[operatorName](expression[operatorName], item);
      } else {
        return acc + expToVal(expression, item) ?? 0;
      }
    }, 0);
  },
  $avg: (items: any[], expression: string): number => {
    return (
      items.reduce((acc: any, item) => {
        if (typeof expression === "object") {
          const operatorName = Object.keys(expression)[0];
          return acc + computeOperatorExpression[operatorName](expression[operatorName], item);
        } else {
          return acc + expToVal(expression, item) ?? 0;
        }
      }, 0) / items.length
    );
  },
  $min: (items: any[], expression: string): number => {
    return items.reduce((acc: any, item) => {
      const value = expToVal(expression, item) ?? null;
      return isNaN(acc) ? value : value < acc ? value : acc;
    }, NaN);
  },
  $max: (items: any[], expression: string): number => {
    return items.reduce((acc: any, item) => {
      const value = expToVal(expression, item) ?? null;
      return isNaN(acc) ? value : value > acc ? value : acc;
    }, NaN);
  },
  $push: (items: any[], expression: string): any[] => {
    return items.map((item) =>
      expToVal(expression, item, { returnString: true, returnObject: true }),
    );
  },
  $addToSet: (items: any[], expression: string): any[] => {
    const result = items.map((item) =>
      expToVal(expression, item, { returnString: true, returnObject: true }),
    );
    const set = new Set(result);
    return Array.from(set);
  },
};

const expToVal = (
  expression: string | number,
  item: any,
  config?: { returnString?: boolean; returnObject?: boolean },
) => {
  const { returnString, returnObject } = config ?? {};

  if (typeof expression === "number") {
    return expression;
  }
  if (expression.charAt(0) === "$") {
    if (expression.includes(".")) {
      const propertyNesting = expression.slice(1).split(".");
      const result = propertyNesting.reduce((acc, property) => acc?.[property], item);
      return result;
    }
    return item?.[expression.slice(1)];
  } else if (returnString) {
    return expression;
  }

  if (typeof expression === "object" && returnObject) {
    return expression;
  }

  return undefined;
};

// Generic compute-expression function will be extended
// to other stages like $project, $addFields etc. later on
const computeOperatorExpression: any = {
  $add: (args: any[], item: any) => {
    return args.reduce((runningTotal: number, arg: number) => {
      if (typeof arg === "number") {
        return runningTotal + arg;
      } else {
        const resolvedValue = expToVal(arg, item);
        if (typeof resolvedValue === "number") {
          return runningTotal + resolvedValue;
        }
        throw Error(`${arg} does not resolve to a number therefore can't be used with $add.`);
      }
    }, 0);
  },
  $multiply: (args: any[], item: any) => {
    return args.reduce((runningTotal: number, arg: number) => {
      if (typeof arg === "number") {
        return runningTotal * arg;
      } else {
        const resolvedValue = expToVal(arg, item);
        if (typeof resolvedValue === "number") {
          return runningTotal * resolvedValue;
        }
        throw Error(`${arg} does not resolve to a number therefore can't be used with $multiply.`);
      }
    }, 1);
  },
  $divide: (args: any[], item: any) => {
    if (args.length !== 2) throw "$divide takes 2 arguments only";
    const [numeratorRaw, denominatorRaw] = args;
    const [numerator, denominator] = [expToVal(numeratorRaw, item), expToVal(denominatorRaw, item)];
    if (typeof numerator === "number" || typeof denominator === "number") {
      if (denominator !== 0) {
        return numerator / denominator;
      }
      throw Error(`Denominator can't be 0.`);
    } else {
      throw Error("Only numbers can be divided.");
    }
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
