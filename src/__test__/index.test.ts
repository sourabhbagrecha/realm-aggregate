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
  });
});
