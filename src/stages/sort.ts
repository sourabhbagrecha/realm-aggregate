enum SortOrder {
  Ascending = 1,
  Descending = -1,
}

const applySortStage = (query: any, data: any) => {
  const field = Object.keys(query as any)[0];
  const order: SortOrder = query[field];
  const ascendingSort = (a: any, b: any) => {
    if (a[field] < b[field]) {
      return -1;
    }
    if (a[field] > b[field]) {
      return 1;
    }
    return 0;
  };
  const descendingSort = (a: any, b: any) => {
    if (a[field] > b[field]) {
      return -1;
    }
    if (a[field] < b[field]) {
      return 1;
    }
    return 0;
  };
  const sortFunction = order === SortOrder.Ascending ? ascendingSort : descendingSort;
  return data.sort(sortFunction);
};

export { applySortStage };
