import { extractOpAndCalExpr } from "../utils";

const applyProjectStage = (query: any, data: any) => {
  const { _id, ...queryApartFromId } = query;
  const projectEntries = Object.entries(queryApartFromId);
  const projectValues = Object.values(queryApartFromId);

  // TODO: check for nested exclusion
  let exclusionsExists = projectValues.includes(0) || projectValues.includes(false);

  // TODO: check for next inclusion
  let inclusionsExists =
    projectValues.includes(1) ||
    projectValues.includes(true) ||
    projectValues.includes((v: any) => typeof v === "string" || typeof v === "object");
  if (exclusionsExists && inclusionsExists) {
    throw new Error("$project does not support exclusions & inclusions together.");
  }

  if (exclusionsExists) {
    return data.map((item: any) => {
      const result = item;
      for (let [key, value] of projectEntries) {
        if (value === 0 || value === false) delete result[key];
        // TODO: Nested exclusion
      }
      return result;
    });
  } else {
    return data.map((item: any) => {
      const keysUsed: string[] = [];
      const result: any = {};
      for (let [key, value] of projectEntries) {
        if (keysUsed.includes(key)) {
          throw new Error(`Collision detection: the following key has already been used: ${key}`);
        }
        keysUsed.push(key);
        if (key.includes(".")) {
          const propertyNesting = key.split(".");
          const firstKey = propertyNesting.shift();
          if (keysUsed.includes(propertyNesting[0])) {
            throw new Error(`Collision detection: the following key has already been used: ${key}`);
          }
          keysUsed.push(propertyNesting[0]);
          if (value === 1 || value === true) {
            if (firstKey) {
              result[firstKey] = propertyNesting.reduce(
                (acc, property) => ({ [property]: acc?.[property] }),
                item[firstKey],
              );
            }
          } else if (typeof value === "string" && !value.includes(".")) {
            const refValue = item[value.slice(1)];
            if (firstKey) {
              result[firstKey] = propertyNesting.reverse().reduce((acc, property, index) => {
                if (index === 0) {
                  return { [property]: refValue };
                }
                return { [property]: acc };
              }, {} as any);
            }
          } else if (typeof value === "object" && !Array.isArray(value)) {
            const refValue = computeNestedOperation(value, item);
            if (firstKey) {
              result[firstKey] = propertyNesting.reverse().reduce((acc, property, index) => {
                if (index === 0) {
                  return { [property]: refValue };
                }
                return { [property]: acc };
              }, {} as any);
            }
          }
        } else if (value === 1 || value === true) result[key] = item[key];
        else if (typeof value === "string" && !value.includes("."))
          result[key] = item[value.slice(1)];
        else if (typeof value === "object" && !Array.isArray(value)) {
          const x = computeNestedOperation(value, item);
          result[key] = x;
        } else throw new Error(`Project with value: ${value} is not supported`);
      }
      if (!_id && _id !== 0) {
        result._id = item._id;
      }

      return result;
    });
  }
};

const computeNestedOperation = (value: any, item: any): any => {
  const fieldName = Object.keys(value as any)[0];
  const expression = value[fieldName];
  if (fieldName.charAt(0) === "$") {
    return extractOpAndCalExpr({ [fieldName]: expression }, item);
  } else if (typeof expression === "object" && !Array.isArray(expression)) {
    return { [fieldName]: computeNestedOperation(expression, item) };
  } else if (expression === 1) {
    //TODO: Determine how to include or exclude here
  } else {
    throw new Error(`Invalid expression encountered: {${fieldName}: ${expression}}`);
  }
  return {};
};

export { applyProjectStage };
