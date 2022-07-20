import { applyLimitStage } from "../limit";

describe("allows $limit", () => {
  const sampleData = [
    {
      _id: 1,
      category: "a",
      value: 1,
      otherValue: 4,
    },
    {
      _id: 2,
      category: "a",
      value: 2,
      otherValue: 3,
    },
    {
      _id: 3,
      category: "b",
      value: 3,
      otherValue: 2,
    },
    {
      _id: 4,
      category: "b",
      value: 4,
      otherValue: 1,
    },
  ];
  it("with valid input", () => {
    const output = applyLimitStage(1, sampleData);
    const expectedOutput = [{ _id: 1, category: "a", value: 1, otherValue: 4 }];
    expect(output).toEqual(expectedOutput);
  });
  it("throws on invalid input", () => {
    const output = applyLimitStage.bind(null, -1, sampleData);
    expect(output).toThrow();
  });
});
