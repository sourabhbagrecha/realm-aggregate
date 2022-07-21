import Realm from "realm";
import { applySortStage } from "../sort";

const ObjectId = Realm.BSON.ObjectId;

describe("allows $sort", () => {
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

  it("sorts by number", () => {
    const outputI = applySortStage({ amount: 1 }, sampleData);
    const expectedOutputI: any[] = [
      {
        _id: new ObjectId("6261210156de4a9f7e8a6ab9"),
        category: "b",
        date: new Date("2022-05-24T11:46:53.000Z"),
        amount: 1,
      },
      {
        _id: new ObjectId("61dbca296ce5d97556e52b18"),
        category: "a",
        date: new Date("2022-01-10T06:22:29.000Z"),
        amount: 2,
      },
      {
        _id: new ObjectId("6284cba31928593fbc555ba6"),
        category: "c",
        date: new Date("2022-05-18T10:33:59.403Z"),
        amount: 3,
      },
      {
        _id: new ObjectId("6261269356de4a9f7e8f893b"),
        category: "c",
        date: new Date("2022-05-24T11:47:01.000Z"),
        amount: 4,
      },
    ];

    expect(outputI).toEqual(expectedOutputI);

    const outputD = applySortStage({ amount: -1 }, sampleData);

    const expectedOutputD: any[] = [
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
    ];

    expect(outputD).toEqual(expectedOutputD);
  });
  it("sorts by string", () => {
    const outputI = applySortStage({ category: 1 }, sampleData);

    const expectedOutputI = [
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

    expect(outputI).toEqual(expectedOutputI);

    const outputD = applySortStage({ category: -1 }, sampleData);

    const expectedOutputD = [
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
      {
        _id: new ObjectId("6261210156de4a9f7e8a6ab9"),
        category: "b",
        date: new Date("2022-05-24T11:46:53.000Z"),
        amount: 1,
      },
      {
        _id: new ObjectId("61dbca296ce5d97556e52b18"),
        category: "a",
        date: new Date("2022-01-10T06:22:29.000Z"),
        amount: 2,
      },
    ];

    expect(outputD).toEqual(expectedOutputD);
  });
});
