type Accumulator = "$sum" | "$multiply" | "$avg" | "$min" | "$max" | "$push" | "$addToSet";
const supportedAccumulators: Accumulator[] = [
  "$sum",
  "$multiply",
  "$avg",
  "$min",
  "$max",
  "$push",
  "$addToSet",
];

const applyGroupStage = (query: any, data: any) => {
  const results: any[] = [];
  const { _id, ...operators } = query;
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

  for (const [key, value] of Object.entries(operators) as any) {
    const fieldName = key;
    const operator = value;
    for (let group of results) {
      const result = computeOperator(operator, group.__originalItems, true);
      group[fieldName] = result;
    }
  }

  results.forEach((result) => delete result.__originalItems);
  return results;
};

const accumulatorSingleOperations = {
  $sum: (items: any[], expression: string): number => {
    if (expression.charAt(0) === "$") {
      // just apply
      return items.reduce((acc: any, item) => (acc += item[expression.slice(1)]), 0);
    }
    return 0;
  },
  $avg: (items: any[], expression: string): number => {
    return 0;
  },
  $multiply: (items: any[], expression: string): number => {
    if (expression.charAt(0) === "$") {
      // just apply
      return items.reduce(
        (acc: any, item) =>
          acc === 0 ? item[expression.slice(1)] : (acc *= item[expression.slice(1)]),
        0,
      );
    }
    return 0;
  },
  $min: (items: any[], expression: string): number => {
    return 0;
  },
  $max: (items: any[], expression: string): number => {
    return 0;
  },
  $push: (items: any[], expression: string): number => {
    return 0;
  },
  $addToSet: (items: any[], expression: string): number => {
    return 0;
  },
};

const accumulatorArrayOperations = {
  $sum: (items: any[], expressionSet: string[]): number[] => {
    return items.map((item) => {
      return expressionSet.reduce((acc, expression) => {
        if (expression.charAt(0) === "$") {
          return (acc += item[expression.slice(1)]);
        } else {
          return 0;
        }
      }, 0);
    });
  },
  $avg: (items: any[], expressionSet: string[]): number => {
    return 0;
  },
  $multiply: (items: any[], expressionSet: string[]): number[] => {
    return items.map((item) => {
      return expressionSet.reduce((acc, expression) => {
        if (expression.charAt(0) === "$") {
          return acc === 0 ? item[expression.slice(1)] : (acc *= item[expression.slice(1)]);
        } else {
          return 0;
        }
      }, 0);
    });
  },
  $min: (items: any[], expressionSet: string[]): number => {
    return 0;
  },
  $max: (items: any[], expressionSet: string[]): number => {
    return 0;
  },
  $push: (items: any[], expressionSet: string[]): number => {
    return 0;
  },
  $addToSet: (items: any[], expressionSet: string[]): number => {
    return 0;
  },
};

const accumulatorResultsOperations = {
  $sum: (results: number[]): number => {
    return results.reduce((acc: any, result) => (acc += result), 0);
  },
  $avg: (results: number[]): number => {
    return 0;
  },
  $multiply: (results: number[]): number => {
    return results.reduce((acc: any, result) => (acc === 0 ? result : (acc *= result)), 0);
  },
  $min: (results: number[]): number => {
    return 0;
  },
  $max: (results: number[]): number => {
    return 0;
  },
  $push: (results: number[]): number => {
    return 0;
  },
  $addToSet: (results: number[]): number => {
    return 0;
  },
};

const computeOperator = (operator: any, items: any[], isFirstRun?: boolean): number | number[] => {
  const accumulator = Object.keys(operator as any)[0] as Accumulator;
  const expression = operator[accumulator];

  if (supportedAccumulators.includes(accumulator)) {
    if (typeof expression === "string") {
      return accumulatorSingleOperations[accumulator](items, expression);
    } else if (Array.isArray(expression)) {
      if (isFirstRun) {
        throw new Error("No arrays allowed for first level accumulator");
      }
      const expressionSet = expression;
      return accumulatorArrayOperations[accumulator](items, expressionSet);
    } else if (typeof expression === "object") {
      const result: number | number[] = computeOperator(expression, items);
      if (Array.isArray(result)) {
        const results = result as number[];
        return accumulatorResultsOperations[accumulator](results);
      }
      return result;
    } else {
      throw new Error(`Invalid expression ${expression} given for accumulator ${accumulator}`);
    }
  } else {
    throw new Error(`${accumulator} is not supported!`);
  }
};

export { applyGroupStage };
