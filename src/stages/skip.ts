const applySkipStage = (query: any, data: any[]) => {
  if (typeof query === "number" && query > 0) {
    return data.slice(query);
  } else {
    throw new Error("The argument to $skip stage must be a positive integer.");
  }
};

export { applySkipStage };
