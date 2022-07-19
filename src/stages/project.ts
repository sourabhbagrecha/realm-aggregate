const applyProjectStage = (query: any, data: any) => {
  const { _id, ...queryApartFromId } = query;
  const projectEntries = Object.entries(queryApartFromId);
  const projectValues = Object.values(queryApartFromId);
  let exclusionsExists = projectValues.includes(0) || projectValues.includes(false);
  let inclusionsExists =
    projectValues.includes(1) ||
    projectValues.includes(true) ||
    projectValues.includes((v: any) => typeof v === "string" || typeof v === "object");
  if (exclusionsExists && inclusionsExists) {
    throw new Error("$project does not support exclusions & inclusions together.");
  }
  if (inclusionsExists) {
    return data.map((item: any) => {
      const result: any = {};
      for (let [key, value] of projectEntries) {
        if (value === 1 || value === true) result[key] = item[key];
        else if (typeof value === "string") result[key] = item[value.slice(1)];
        else throw new Error(`Project with value: ${value} is not supported`);
      }
      return result;
    });
  } else {
    return data.map((item: any) => {
      const result = item;
      for (let [key, value] of projectEntries) {
        if (value === 0 || value === false) delete result[key];
      }
      return result;
    });
  }
};

export { applyProjectStage };
