const applyAddFieldsStage = (query: any, data: any) => {
  const addFieldsEntries = Object.entries(query);
  return data.map((item: any) => {
    const result: any = item;
    for (let [key, value] of addFieldsEntries) {
      if (typeof value === "string") {
        if (value[0] === "$") {
          result[key] = item[value.slice(1)];
        } else {
          result[key] = value;
        }
      } else throw new Error(`Project with value: ${value} is not supported`);
    }
    return result;
  });
};

export { applyAddFieldsStage };
