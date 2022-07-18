import Realm from "realm";
import { aggregate } from "..";
import { expenses, expenseSchema } from "./sample-data";

const ObjectId = Realm.BSON.ObjectId;

describe("aggregate function", () => {
  let realm: Realm;

  beforeAll(() => {
    realm = new Realm({
      schema: [expenseSchema],
      deleteRealmIfMigrationNeeded: true,
    });

    realm.write(() => {
      realm.deleteAll();
      expenses.forEach((expense) => realm.create("Expense", expense));
    });
  });
  afterAll(() => {
    realm.close();
  });
  it("given an empty array returns original data", () => {
    const data = aggregate([], realm, "Expense");
    expect(data.length).toEqual(expenses.length);
  });
  describe("aggregation array", () => {
    it("allows $match", () => {
      const pipeline = [{ $match: { amount: { $gt: 1000 } } }];
      const data = aggregate(pipeline, realm, "Expense");
      const expectedOutput = [
        {
          _id: new ObjectId("6284cba31928593fbc555ba6"),
          mode: "UPI",
          title: "Flights",
          amount: 6400,
          author: new ObjectId("624fd95c095bb869dc9700cc"),
          category: "Travel",
          createdAt: new Date("2022-05-18T10:33:59.403Z"),
        },
        {
          _id: new ObjectId("628f185884ed6cfee3302f64"),
          amount: 1024,
          author: new ObjectId("628f0b52326126f3b7203cbe"),
          category: "Transport",
          createdAt: new Date("2022-05-26T06:03:50.945Z"),
          mode: "Credit Card",
          title: "Cab",
        },
      ];
      expect(data).toEqual(expectedOutput);
    });
    it("allows $group", () => {
      const pipeline = [
        { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
      ];
      const data = aggregate(pipeline, realm, "Expense");
      const expectedOutput = [
        { _id: "Entertainment", totalAmount: 149 },
        { _id: "Food", totalAmount: 425 },
        { _id: "Beverages", totalAmount: 10 },
        { _id: "Travel", totalAmount: 6400 },
        { _id: "Education", totalAmount: 5120 },
        { _id: "Transport", totalAmount: 1024 },
        { _id: "Eating Out", totalAmount: 1000 },
      ];
      expect(data).toEqual(expectedOutput);
    });

    it("allows $match and $group together", () => {
      const pipeline = [
        { $match: { amount: { $gt: 500 } } },
        { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
      ];
      const data = aggregate(pipeline, realm, "Expense");
      const expectedOutput = [
        { _id: "Travel", totalAmount: 6400 },
        { _id: "Education", totalAmount: 5120 },
        { _id: "Transport", totalAmount: 1024 },
        { _id: "Eating Out", totalAmount: 1000 },
      ];
      expect(data).toEqual(expectedOutput);
    });
  });
});
