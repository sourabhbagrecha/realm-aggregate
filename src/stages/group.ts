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
    return items.reduce((acc: any, item) => (acc += expToVal(expression, item) ?? 0), 0);
  },
  $avg: (items: any[], expression: string): number => {
    return (
      items.reduce((acc: any, item) => (acc += expToVal(expression, item) ?? 0), 0) /
        items.length || 0
    );
  },
  $multiply: (items: any[], expression: string): number => {
    return items.reduce((acc: any, item) => {
      const value = expToVal(expression, item) ?? 0;
      acc === 0 ? value : (acc *= value);
    }, 0);
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

const accumulatorArrayOperations = {
  $sum: (items: any[], expressionSet: string[]): number[] => {
    return items.map((item) => {
      return expressionSet.reduce((acc, expression) => {
        return (acc += expToVal(expression, item) ?? 0);
      }, 0);
    });
  },
  $avg: (items: any[], expressionSet: string[]): number[] => {
    return items.map((item) => {
      return (
        expressionSet.reduce((acc, expression) => {
          return (acc += expToVal(expression, item) ?? 0);
        }, 0) / expressionSet.length || 0
      );
    });
  },
  $multiply: (items: any[], expressionSet: string[]): number[] => {
    return items.map((item) => {
      return expressionSet.reduce((acc, expression) => {
        const value = expToVal(expression, item) ?? 0;
        return acc === 0 ? value : (acc *= value);
      }, 0);
    });
  },
  $min: (items: any[], expressionSet: string[]): number[] => {
    return items.map((item) => {
      return expressionSet.reduce((acc, expression) => {
        const value = expToVal(expression, item) ?? null;
        return isNaN(acc) ? value : value < acc ? value : acc;
      }, NaN);
    });
  },
  $max: (items: any[], expressionSet: string[]): number[] => {
    return items.map((item) => {
      return expressionSet.reduce((acc, expression) => {
        const value = expToVal(expression, item) ?? null;
        return isNaN(acc) ? value : value > acc ? value : acc;
      }, NaN);
    });
  },
  $push: (items: any[], expressionSet: string[]): number => {
    throw new Error("The $push accumulator is a unary operator");
  },
  $addToSet: (items: any[], expressionSet: string[]): number => {
    throw new Error("The $addToSet accumulator is a unary operator");
  },
};

const accumulatorResultsOperations = {
  $sum: (results: number[]): number => {
    return results.reduce((acc: any, result) => (acc += result), 0);
  },
  $avg: (results: number[]): number => {
    return results.reduce((acc: any, result) => (acc += result), 0) / results.length || 0;
  },
  $multiply: (results: number[]): number => {
    return results.reduce((acc: any, result) => (acc === 0 ? result : (acc *= result)), 0);
  },
  $min: (results: number[]): number => {
    return results.reduce(
      (acc: any, result) => (acc === NaN ? result : result < acc ? result : acc),
      NaN,
    );
  },
  $max: (results: number[]): number => {
    return results.reduce(
      (acc: any, result) => (acc === NaN ? result : result > acc ? result : acc),
      NaN,
    );
  },
  $push: (results: any[]): any[] => {
    return results;
  },
  $addToSet: (results: any[]): any[] => {
    const set = new Set(results);
    return Array.from(set);
  },
};

const computeOperator = (
  operator: any,
  items: any[],
  isFirstRun?: boolean,
): number | number[] | string[] | string => {
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
      const result: number | number[] | string | string[] = computeOperator(expression, items);
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
