import { applyMatchStage } from "../match";

describe("Apply matchStage", () => {
  it("allows $in", () => {
    const data = [
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
    let result = applyMatchStage({ _id: { $in: [1, 2] } }, data);

    let expectedOutput = [
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
    ];

    expect(result).toEqual(expectedOutput);
  });
});
