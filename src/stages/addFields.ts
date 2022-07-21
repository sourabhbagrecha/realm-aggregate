const recursiveFieldAddition = (query: any, originalDocument: any) => {
  const result: any = {};
  for (let [key, value] of Object.entries(query)) {
    if (typeof value === "string") {
      if (value[0] === "$") {
        result[key] = originalDocument[value.slice(1)];
      } else {
        result[key] = value;
      }
    } else if (typeof value === "number") {
      result[key] = value;
    } else if (typeof value === "object") {
      result[key] = recursiveFieldAddition(value, originalDocument);
    } else throw new Error(`Project with value: ${value} is not supported`);
  }
  return result;
};

const applyAddFieldsStage = (query: any, data: any) => {
  if (!query || typeof query !== "object") {
    throw new Error(`$addFields stage needs a query object.`);
  }
  const addFieldsEntries = Object.entries(query);
  return data.map((item: any) => {
    const result: any = { ...item };
    for (let [key, value] of addFieldsEntries) {
      if (typeof value === "string") {
        if (value[0] === "$") {
          result[key] = item[value.slice(1)];
        } else {
          result[key] = value;
        }
      } else if (typeof value === "number") {
        result[key] = value;
      } else if (typeof value === "object") {
        result[key] = recursiveFieldAddition(value, item);
      } else throw new Error(`Project with value: ${value} is not supported`);
    }
    return result;
  });
};

export { applyAddFieldsStage };
