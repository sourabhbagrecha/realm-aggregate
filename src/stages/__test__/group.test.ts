import { applyGroupStage } from "../group";

describe("Applying group stage", () => {
  it("supports grouping by string property", () => {
    const data = [
      { _id: 1, category: "a" },
      { _id: 2, category: "a" },
      { _id: 3, category: "b" },
      { _id: 4, category: "b" },
    ];
    const result = applyGroupStage({ _id: "$category" }, data);

    const expectedOutput = [{ _id: "a" }, { _id: "b" }];

    expect(result).toEqual(expectedOutput);
  });
  it("count using $sum", () => {
    const data = [{ a: 1 }, { a: 1 }, { a: 1 }, { a: 1 }, { a: 1 }, { a: 1 }, { a: 2 }, { a: 2 }];
    const output = applyGroupStage({ _id: "$a", count: { $sum: 1 } }, data);
    const expectedOutput = [
      { _id: 1, count: 6 },
      { _id: 2, count: 2 },
    ];
    expect(output).toEqual(expectedOutput);
  });
  it("supports $sum", () => {
    const data = [
      { category: "a", value: 1, otherValue: 4 },
      { category: "a", value: 2, otherValue: 3 },
      { category: "b", value: 3, otherValue: 2 },
      { category: "b", value: 4, otherValue: 1 },
    ];
    let result = applyGroupStage({ _id: "$category", total: { $sum: "$value" } }, data);

    let expectedOutput = [
      { _id: "a", total: 3 },
      { _id: "b", total: 7 },
    ];

    expect(result).toEqual(expectedOutput);
  });
  it("supports $sum with $add", () => {
    const data = [
      { _id: 1, category: "a", value: 1, otherValue: 4 },
      { _id: 2, category: "a", value: 2, otherValue: 3 },
      { _id: 3, category: "b", value: 3, otherValue: 2 },
      { _id: 4, category: "b", value: 4, otherValue: 1 },
    ];
    let result = applyGroupStage(
      { _id: "$category", total: { $sum: { $add: ["$value", 1] } } },
      data,
    );

    let expectedOutput = [
      { _id: "a", total: 5 },
      { _id: "b", total: 9 },
    ];

    expect(result).toEqual(expectedOutput);
  });
  it("supports $sum with $multiply", () => {
    const data = [
      { category: "a", value: 1, othVal: 4 },
      { category: "a", value: 2, othVal: 3 },
      { category: "b", value: 3, othVal: 2 },
      { category: "b", value: 4, othVal: 1 },
    ];
    let result = applyGroupStage(
      { _id: "$category", total: { $sum: { $multiply: ["$value", 2] } } },
      data,
    );

    let expectedOutput = [
      { _id: "a", total: 6 },
      { _id: "b", total: 14 },
    ];

    expect(result).toEqual(expectedOutput);
  });
  it("supports supports $min and $max", () => {
    const data = [
      { _id: 1, category: "a", value: -1000, quantity: 1 },
      { _id: 2, category: "a", value: 2, quantity: 2 },
      { _id: 3, category: "b", value: 3, quantity: 3 },
      { _id: 4, category: "b", value: 4, quantity: 3 },
    ];

    let result = applyGroupStage({ _id: "$category", result: { $min: "$value" } }, data);

    let expectedOutput: { _id: string; result: number | null }[] = [
      { _id: "a", result: -1000 },
      { _id: "b", result: 3 },
    ];

    expect(result).toEqual(expectedOutput);

    result = applyGroupStage({ _id: "$category", result: { $max: "$value" } }, data);

    expectedOutput = [
      { _id: "a", result: 2 },
      { _id: "b", result: 4 },
    ];

    expect(result).toEqual(expectedOutput);
  });
  it("supports supports $push", () => {
    const data = [
      { _id: 1, category: "a", value: 1, quantity: 1 },
      { _id: 2, category: "a", value: 2, quantity: 2 },
      { _id: 3, category: "b", value: 3, quantity: 3 },
      { _id: 4, category: "b", value: 4, quantity: 3 },
    ];

    let result = applyGroupStage({ _id: "$category", values: { $push: "$value" } }, data);

    let expectedOutput: { _id: string; values: any[] }[] = [
      { _id: "a", values: [1, 2] },
      { _id: "b", values: [3, 4] },
    ];

    expect(result).toEqual(expectedOutput);

    result = applyGroupStage({ _id: "$category", values: { $push: "$missing" } }, data);

    expectedOutput = [
      { _id: "a", values: [] },
      { _id: "b", values: [] },
    ];

    expect(result).toEqual(expectedOutput);

    result = applyGroupStage({ _id: "$category", values: { $push: "someString" } }, data);

    expectedOutput = [
      { _id: "a", values: ["someString", "someString"] },
      { _id: "b", values: ["someString", "someString"] },
    ];

    expect(result).toEqual(expectedOutput);
  });
  it("supports $avg with $divide", () => {
    const data = [
      { name: "Soaps Set", category: "Cleaning", totalCost: 9000, totalItems: 6 },
      { name: "Towels", category: "Cleaning", totalCost: 9000, totalItems: 3 },
      { name: "Cooker", category: "Cooking", totalCost: 1000, totalItems: 2 },
      { name: "Plates", category: "Cooking", totalCost: 1000, totalItems: 4 },
    ];
    let result = applyGroupStage(
      {
        _id: "$category",
        avgItemCostInThisCategory: { $avg: { $divide: ["$totalCost", "$totalItems"] } },
      },
      data,
    );

    let expectedOutput = [
      { _id: "Cleaning", avgItemCostInThisCategory: 2250 },
      { _id: "Cooking", avgItemCostInThisCategory: 375 },
    ];

    expect(result).toEqual(expectedOutput);
  });
  it.skip("supports supports $addToSet", () => {
    const data = [
      {
        _id: 1,
        category: "a",
        value: 2,
        quantity: 2,
        object: {
          foo: "bar",
          fizz: "buzz",
        },
      },
      {
        _id: 2,
        category: "a",
        value: 2,
        quantity: 2,
        object: {
          foo: "bar",
          fizz: "buzz",
        },
      },
      {
        _id: 3,
        category: "b",
        value: 3,
        quantity: 3,
        object: {
          foo: "bar",
          fizz: "buzz",
        },
      },
      {
        _id: 4,
        category: "b",
        value: 3,
        quantity: 3,
        object: {
          foo: "bar",
          fizz: "buzz",
        },
      },
    ];

    let result = applyGroupStage({ _id: "$category", values: { $addToSet: "$value" } }, data);

    let expectedOutput: { _id: string; values: any[] }[] = [
      { _id: "a", values: [2] },
      { _id: "b", values: [3] },
    ];

    expect(result).toEqual(expectedOutput);

    result = applyGroupStage({ _id: "$category", values: { $addToSet: "$missing" } }, data);

    expectedOutput = [
      { _id: "a", values: [] },
      { _id: "b", values: [] },
    ];

    expect(result).toEqual(expectedOutput);

    result = applyGroupStage({ _id: "$category", values: { $addToSet: "someString" } }, data);

    expectedOutput = [
      { _id: "a", values: ["someString"] },
      { _id: "b", values: ["someString"] },
    ];

    expect(result).toEqual(expectedOutput);

    result = applyGroupStage({ _id: "$category", values: { $addToSet: "$object" } }, data);

    expectedOutput = [
      {
        _id: "a",
        values: [
          { fizz: "buzz", foo: "bar" },
          { fizz: "buzz", foo: "bar" },
        ],
      },
      {
        _id: "b",
        values: [
          { fizz: "buzz", foo: "bar" },
          { fizz: "buzz", foo: "bar" },
        ],
      },
    ];

    expect(result).toEqual(expectedOutput);

    result = applyGroupStage({ _id: "$category", values: { $addToSet: "$object.fizz" } }, data);

    expectedOutput = [
      {
        _id: "a",
        values: ["buzz"],
      },
      {
        _id: "b",
        values: ["buzz"],
      },
    ];

    expect(result).toEqual(expectedOutput);
  });
  it("supports nested operator expressions", () => {
    const sampleData = [{ a: 1 }, { a: 1 }];
    const data = applyGroupStage(
      { _id: null, totalSum: { $sum: { $add: [{ $multiply: [3, 4] }] } } },
      sampleData,
    );
    const expectedData = [{ _id: null, totalSum: 24 }];
    expect(data).toEqual(expectedData);
  });
});
