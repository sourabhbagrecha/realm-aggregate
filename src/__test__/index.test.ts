import Realm from 'realm'
import { aggregate } from ".."
import { expenses, expenseSchema} from "./sample-data"

describe("aggregate function", () => {
	let realm:Realm;

	beforeAll(() => {
		realm = new Realm({schema: [expenseSchema], deleteRealmIfMigrationNeeded: true})

		realm.write(() => {
			realm.deleteAll()
			expenses.forEach((expense) => realm.create("Expense", expense));
		})
	})
	afterAll(() => {
		realm.close()
	})
	it("given an empty array returns original data", () => {
			const data = aggregate([], realm, "Expense")
			expect(data.length).toEqual(expenses.length)
	})
	describe("aggregation array", () => {
		it("allows $match", async() => {
			const data = aggregate([{$match: "_id"}], realm, "Expense")
			await new Promise((resolve) => setTimeout(resolve, 1000))
			const expectedOutput = {
			}
			expect(data).toEqual(expectedOutput)
		})

	})
})
