import { applyGroupStage } from "../group";

describe("Applying $group stage", () => {
  it("supports grouping by string property", () => {
    const data = [
      {
        _id: 1,
        category: "a",
      },
      {
        _id: 2,
        category: "a",
      },
      {
        _id: 3,
        category: "b",
      },
      {
        _id: 4,
        category: "b",
      },
    ];
    const result = applyGroupStage({ _id: "$category" }, data);

    const expectedOutput = [{ _id: "a" }, { _id: "b" }];

    expect(result).toEqual(expectedOutput);
  }),
    it("supports $sum", () => {
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
      let result = applyGroupStage({ _id: "$category", total: { $sum: "$value" } }, data);

      let expectedOutput = [
        { _id: "a", total: 3 },
        { _id: "b", total: 7 },
      ];

      expect(result).toEqual(expectedOutput);
    }),
    it("supports nested expressions", () => {
      const data = [
        {
          _id: 1,
          category: "a",
          value: 1,
          quantity: 1,
        },
        {
          _id: 2,
          category: "a",
          value: 2,
          quantity: 2,
        },
        {
          _id: 3,
          category: "b",
          value: 3,
          quantity: 3,
        },
        {
          _id: 4,
          category: "b",
          value: 4,
          quantity: 3,
        },
      ];
      let result = applyGroupStage(
        { _id: "$category", total: { $sum: { $multiply: ["$value", "$quantity"] } } },
        data,
      );

      let expectedOutput = [
        { _id: "a", total: 5 },
        { _id: "b", total: 21 },
      ];

      expect(result).toEqual(expectedOutput);
    });
});
