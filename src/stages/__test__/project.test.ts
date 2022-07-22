import { applyProjectStage } from "../project";
import Realm from "realm";

const ObjectId = Realm.BSON.ObjectId;

describe("Applying $project stage", () => {
  const sampleData = [
    {
      _id: new ObjectId("61dbca296ce5d97556e52b18"),
      category: "a",
      date: new Date("2022-01-10T06:22:29.000Z"),
      amount: 2,
    },
    {
      _id: new ObjectId("6261210156de4a9f7e8a6ab9"),
      category: "b",
      date: new Date("2022-05-24T11:46:53.000Z"),
      amount: 1,
    },
    {
      _id: new ObjectId("6261269356de4a9f7e8f893b"),
      category: "c",
      date: new Date("2022-05-24T11:47:01.000Z"),
      amount: 4,
    },
    {
      _id: new ObjectId("6284cba31928593fbc555ba6"),
      category: "c",
      date: new Date("2022-05-18T10:33:59.403Z"),
      amount: 3,
    },
  ];

  it("allows $project", () => {
    const output = applyProjectStage({ amount: 1, categoryName: "$category" }, sampleData);
    const expectedOutput: any[] = [
      {
        _id: new ObjectId("61dbca296ce5d97556e52b18"),
        amount: 2,
        categoryName: "a",
      },
      {
        _id: new ObjectId("6261210156de4a9f7e8a6ab9"),
        amount: 1,
        categoryName: "b",
      },
      {
        _id: new ObjectId("6261269356de4a9f7e8f893b"),
        amount: 4,
        categoryName: "c",
      },
      {
        _id: new ObjectId("6284cba31928593fbc555ba6"),
        amount: 3,
        categoryName: "c",
      },
    ];
    expect(output).toEqual(expectedOutput);
  });

  it("allows $project with excluded _id", () => {
    const output = applyProjectStage({ amount: 1, _id: 0, categoryName: "$category" }, sampleData);
    const expectedOutput: any[] = [
      {
        amount: 2,
        categoryName: "a",
      },
      {
        amount: 1,
        categoryName: "b",
      },
      {
        amount: 4,
        categoryName: "c",
      },
      {
        amount: 3,
        categoryName: "c",
      },
    ];
    expect(output).toEqual(expectedOutput);
  });

  it("allows $project with exclusions", () => {
    const output = applyProjectStage({ date: 0 }, sampleData);
    const expectedOutput = [
      {
        _id: new ObjectId("61dbca296ce5d97556e52b18"),
        category: "a",
        amount: 2,
      },
      {
        _id: new ObjectId("6261210156de4a9f7e8a6ab9"),
        category: "b",
        amount: 1,
      },
      {
        _id: new ObjectId("6261269356de4a9f7e8f893b"),
        category: "c",
        amount: 4,
      },
      {
        _id: new ObjectId("6284cba31928593fbc555ba6"),
        category: "c",
        amount: 3,
      },
    ];
    expect(output).toEqual(expectedOutput);
  });
  it("allows nested expression operations", () => {
    const data = [
      { _id: new ObjectId("62d9a81b480af01d2f752ea8"), a: 1 },
      { _id: new ObjectId("62d9a81b480af01d2f752ea9"), a: 2 },
    ];
    const output = applyProjectStage({ nested: { deeplyNested: { $add: ["$a", 1] } } }, data);

    const expectedOutput = [
      {
        _id: new ObjectId("62d9a81b480af01d2f752ea8"),
        nested: { deeplyNested: 2 },
      },
      {
        _id: new ObjectId("62d9a81b480af01d2f752ea9"),
        nested: { deeplyNested: 3 },
      },
    ];
    expect(output).toEqual(expectedOutput);
  });
  it("allows nested expression with embedded dot notation", () => {
    const data = [
      { _id: new ObjectId("62d9a81b480af01d2f752ea8"), a: 1 },
      { _id: new ObjectId("62d9a81b480af01d2f752ea9"), a: 2 },
    ];
    const output = applyProjectStage({ "nested.deeplyNested": { $add: ["$a", 1] } }, data);

    const expectedOutput = [
      {
        _id: new ObjectId("62d9a81b480af01d2f752ea8"),
        nested: { deeplyNested: 2 },
      },
      {
        _id: new ObjectId("62d9a81b480af01d2f752ea9"),
        nested: { deeplyNested: 3 },
      },
    ];
    expect(output).toEqual(expectedOutput);
  });
  it("allows nested reference with embedded dot notation", () => {
    const data = [
      { _id: new ObjectId("62d9a81b480af01d2f752ea8"), a: 1 },
      { _id: new ObjectId("62d9a81b480af01d2f752ea9"), a: 2 },
    ];
    const output = applyProjectStage({ "nested.deeplyNested.deepestNested": "$a" }, data);

    const expectedOutput = [
      {
        _id: new ObjectId("62d9a81b480af01d2f752ea8"),
        nested: { deeplyNested: { deepestNested: 1 } },
      },
      {
        _id: new ObjectId("62d9a81b480af01d2f752ea9"),
        nested: { deeplyNested: { deepestNested: 2 } },
      },
    ];
    expect(output).toEqual(expectedOutput);
  });
  it("includes embedded fields", () => {
    const data = [
      { _id: new ObjectId("62d9a81b480af01d2f752ea8"), a: { foo: 1, bar: 3 } },
      { _id: new ObjectId("62d9a81b480af01d2f752ea9"), a: { foo: 2, bar: 4 } },
    ];
    const output = applyProjectStage({ "a.foo": 1 }, data);

    const expectedOutput = [
      {
        _id: new ObjectId("62d9a81b480af01d2f752ea8"),
        a: { foo: 1 },
      },
      {
        _id: new ObjectId("62d9a81b480af01d2f752ea9"),
        a: { foo: 2 },
      },
    ];
    expect(output).toEqual(expectedOutput);
  });
});
