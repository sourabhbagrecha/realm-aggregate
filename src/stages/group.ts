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

const extractOpAndCalExpr = (expression: any, item: any) => {
  if (typeof expression === "object") {
    const operatorName = Object.keys(expression)[0];
    return computeOperatorExpression[operatorName](expression[operatorName], item);
  } else {
    return expToVal(expression, item);
  }
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

const expToVal = (expression: string | number | object, item: any) => {
  if (typeof expression === "string" && expression.charAt(0) === "$") {
    if (expression.includes(".")) {
      const propertyNesting = expression.slice(1).split(".");
      const result = propertyNesting.reduce((acc, property) => acc?.[property], item);
      return result;
    }
    return item?.[expression.slice(1)];
  } else {
    return expression;
  }
};

const checkAndComputeNestedExpression = (arg: any, item: any): any => {
  const argType = typeof arg;
  if (argType === "object") {
    const operatorName = Object.keys(arg)[0];
    const operatorArgs = arg[operatorName];
    return computeOperatorExpression[operatorName](operatorArgs, item);
  }
  const resolvedArg = expToVal(arg, item);
  if (typeof resolvedArg === "number") return resolvedArg;
  throw Error(`${arg} does not resolve to a number therefore can't be used this operator.`);
};

// Generic compute-expression function, will be extended
// to other stages like $project, $addFields etc. later on
const computeOperatorExpression: any = {
  $add: (args: any[], item: any) => {
    return args.reduce((runningTotal: number, arg: any) => {
      return runningTotal + checkAndComputeNestedExpression(arg, item);
    }, 0);
  },
  $subtract: (args: any[], item: any) => {
    if (args.length !== 2) throw Error("$subtract takes 2 arguments only");
    const firstNum = checkAndComputeNestedExpression(args[0], item);
    const secondNum = checkAndComputeNestedExpression(args[1], item);
    if (typeof firstNum === "number" && typeof secondNum === "number") {
      return firstNum - secondNum;
    } else {
      throw Error("Only numbers can be subtracted.");
    }
  },
  $multiply: (args: any[], item: any) => {
    return args.reduce((runningTotal: number, arg: any) => {
      return runningTotal * checkAndComputeNestedExpression(arg, item);
    }, 1);
  },
  $divide: (args: any[], item: any) => {
    if (args.length !== 2) throw Error("$divide takes 2 arguments only");
    const numerator = checkAndComputeNestedExpression(args[0], item);
    const denominator = checkAndComputeNestedExpression(args[1], item);
    if (typeof numerator === "number" && typeof denominator === "number") {
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
