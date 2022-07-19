import sift from "sift";

const applyMatchStage = (query: any, data: any) => {
  return data.filter(sift(query));
};

export { applyMatchStage };
