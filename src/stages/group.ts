const applyGroupStage = (query: any, data: any) => {
  const results: any[] = [];
  for (let item of data) {
    const { _id, ...accumulators } = query;
    const identifier = item[_id.slice(1)];
    let currentItem = results.find((r) => r._id === identifier);
    if (!currentItem) {
      currentItem = { _id: identifier };
      results.push(currentItem);
    }
    for (const [key, value] of Object.entries(accumulators) as any) {
      const expression = Object.keys(value as any)[0];
      const expressionValue = value[expression];
      switch (expression) {
        case "$sum":
          if (!currentItem[key]) {
            currentItem[key] = 0;
          }
          currentItem[key] += item[expressionValue.slice(1)];
          break;
        default: {
          throw new Error(`The expression: ${expression} has no implementation.`);
        }
      }
    }
  }
  return results;
};

export { applyGroupStage };
