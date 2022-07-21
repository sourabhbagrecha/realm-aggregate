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
      { amount: 2, categoryName: "a" },
      { amount: 1, categoryName: "b" },
      { amount: 4, categoryName: "c" },
      { amount: 3, categoryName: "c" },
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
});
