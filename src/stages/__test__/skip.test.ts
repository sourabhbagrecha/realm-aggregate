import { applySkipStage } from "../skip";

describe("allows $skip", () => {
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
    const output = applySkipStage(2, sampleData);
    const expectedOutput = [
      { _id: 3, category: "b", value: 3, otherValue: 2 },
      { _id: 4, category: "b", value: 4, otherValue: 1 },
    ];
    expect(output).toEqual(expectedOutput);
  });
  it("throws on invalid input", () => {
    const output = applySkipStage.bind(null, -2, sampleData);
    expect(output).toThrow();
  });
});
