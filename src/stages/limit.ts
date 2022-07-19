const applyLimitStage = (query: any, data: any[]) => {
  if (typeof query === "number" && query > 0) {
    return data.slice(0, query);
  } else {
    throw new Error("$limit argument must be a positive number");
  }
};

export { applyLimitStage };
