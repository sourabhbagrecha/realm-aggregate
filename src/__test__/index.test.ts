import Realm from "realm";
import { aggregate } from "..";
import { expenses, expenseSchema } from "./sample-data";

describe("Integration Test for:\x1b[33m $match, $group, $sort, $skip, $limit, $addFields & $project \x1b[0m", () => {
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
  it("Runs all the stages together", () => {
    const output = aggregate(
      [
        { $match: { amount: { $gt: 50 } } },
        { $group: { _id: "$mode", totalAmount: { $sum: "$amount" } } },
        { $sort: { totalAmount: -1 } },
        { $addFields: { amount: "$totalAmount" } },
        { $project: { mode: "$_id", amount: 1, _id: 0 } },
      ],
      realm.objects("Expense"),
    );
    const expectedOutput = [
      { mode: "UPI", amount: 7400 },
      { mode: "Credit Card", amount: 6269 },
      { mode: "Cash", amount: 300 },
      { mode: "Axis CC", amount: 149 },
    ];
    expect(output).toEqual(expectedOutput);
  });
});
