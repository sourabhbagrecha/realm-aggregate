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
      const pipeline = [{ $group: { _id: "$category", totalAmount: { $sum: "$amount" } } }];
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

    describe("allows $sort", () => {
      it("sorts by number", () => {
        let pipeline = [{ $sort: { amount: -1 } }];

        let data = aggregate(pipeline, realm, "Expense");

        let expectedOutput = [
          {
            _id: new ObjectId("6284cba31928593fbc555ba6"),
            category: "Travel",
            mode: "UPI",
            title: "Flights",
            amount: 6400,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-18T10:33:59.403Z"),
          },
          {
            _id: new ObjectId("628f185884ed6cfee3302f64"),
            category: "Transport",
            mode: "Credit Card",
            title: "Cab",
            amount: 1024,
            author: new ObjectId("628f0b52326126f3b7203cbe"),
            createdAt: new Date("2022-05-26T06:03:50.945Z"),
          },
          {
            _id: new ObjectId("62c2d74967794830293a5613"),
            category: "Eating Out",
            mode: "UPI",
            title: "Dinner",
            amount: 1000,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-01T12:03:56.000Z"),
          },
          {
            _id: new ObjectId("628f0b5dc1b266346e4ae0d2"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("628f0b52326126f3b7203cbe"),
            createdAt: new Date("2022-05-26T05:08:39.079Z"),
          },
          {
            _id: new ObjectId("628f15bd15fabf11ae8a6c06"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("628f15b315fabf11ae8a6a1a"),
            createdAt: new Date("2022-05-26T05:52:55.758Z"),
          },
          {
            _id: new ObjectId("6291400bc1b266346ea56723"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-27T21:17:57.885Z"),
          },
          {
            _id: new ObjectId("6293c18584ed6cfee3c623f0"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("6293c177326126f3b7b872ff"),
            createdAt: new Date("2022-05-29T18:54:53.928Z"),
          },
          {
            _id: new ObjectId("6296042d15fabf11ae703ca9"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("62960423c1b266346e33e033"),
            createdAt: new Date("2022-05-31T12:03:51.337Z"),
          },
          {
            _id: new ObjectId("629a178de314081a2e0d595f"),
            category: "Education",
            mode: "Credit Card",
            title: "New Online Course",
            amount: 640,
            author: new ObjectId("629a1670c2245919332890e2"),
            createdAt: new Date("2022-06-03T14:15:37.030Z"),
          },
          {
            _id: new ObjectId("62aba0150cff5986d44b3297"),
            category: "Education",
            mode: "Credit Card",
            title: "Javascript Online Course Yeha",
            amount: 640,
            author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
            createdAt: new Date("2022-06-21T21:26:27.000Z"),
          },
          {
            _id: new ObjectId("62ac1f8354e7cc0f5b86ec33"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
            createdAt: new Date("2022-06-17T06:30:25.587Z"),
          },
          {
            _id: new ObjectId("6261210156de4a9f7e8a6ab9"),
            category: "Food",
            mode: "Cash",
            title: "Mix Veg",
            amount: 300,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-24T11:46:53.000Z"),
          },
          {
            _id: new ObjectId("61dbca296ce5d97556e52b18"),
            category: "Entertainment",
            mode: "Axis CC",
            title: "Netflix",
            amount: 149,
            author: new ObjectId("61d85eae766161a4497a6dd6"),
            createdAt: new Date("2022-01-10T06:22:29.000Z"),
          },
          {
            _id: new ObjectId("62959efa15fabf11ae5a566a"),
            category: "Food",
            mode: "Credit Card",
            title: "Mighty Fine",
            amount: 125,
            author: new ObjectId("6293c177326126f3b7b872ff"),
            createdAt: new Date("2022-05-31T04:51:46.544Z"),
          },
          {
            _id: new ObjectId("6261269356de4a9f7e8f893b"),
            category: "Beverages",
            mode: "UPI",
            title: "Tea",
            amount: 10,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-24T11:47:01.000Z"),
          },
        ];
        expect(data).toEqual(expectedOutput);

        pipeline = [{ $sort: { amount: 1 } }];

        data = aggregate(pipeline, realm, "Expense");

        expectedOutput = [
          {
            _id: new ObjectId("6261269356de4a9f7e8f893b"),
            category: "Beverages",
            mode: "UPI",
            title: "Tea",
            amount: 10,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-24T11:47:01.000Z"),
          },
          {
            _id: new ObjectId("62959efa15fabf11ae5a566a"),
            category: "Food",
            mode: "Credit Card",
            title: "Mighty Fine",
            amount: 125,
            author: new ObjectId("6293c177326126f3b7b872ff"),
            createdAt: new Date("2022-05-31T04:51:46.544Z"),
          },
          {
            _id: new ObjectId("61dbca296ce5d97556e52b18"),
            category: "Entertainment",
            mode: "Axis CC",
            title: "Netflix",
            amount: 149,
            author: new ObjectId("61d85eae766161a4497a6dd6"),
            createdAt: new Date("2022-01-10T06:22:29.000Z"),
          },
          {
            _id: new ObjectId("6261210156de4a9f7e8a6ab9"),
            category: "Food",
            mode: "Cash",
            title: "Mix Veg",
            amount: 300,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-24T11:46:53.000Z"),
          },
          {
            _id: new ObjectId("628f0b5dc1b266346e4ae0d2"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("628f0b52326126f3b7203cbe"),
            createdAt: new Date("2022-05-26T05:08:39.079Z"),
          },
          {
            _id: new ObjectId("628f15bd15fabf11ae8a6c06"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("628f15b315fabf11ae8a6a1a"),
            createdAt: new Date("2022-05-26T05:52:55.758Z"),
          },
          {
            _id: new ObjectId("6291400bc1b266346ea56723"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-27T21:17:57.885Z"),
          },
          {
            _id: new ObjectId("6293c18584ed6cfee3c623f0"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("6293c177326126f3b7b872ff"),
            createdAt: new Date("2022-05-29T18:54:53.928Z"),
          },
          {
            _id: new ObjectId("6296042d15fabf11ae703ca9"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("62960423c1b266346e33e033"),
            createdAt: new Date("2022-05-31T12:03:51.337Z"),
          },
          {
            _id: new ObjectId("629a178de314081a2e0d595f"),
            category: "Education",
            mode: "Credit Card",
            title: "New Online Course",
            amount: 640,
            author: new ObjectId("629a1670c2245919332890e2"),
            createdAt: new Date("2022-06-03T14:15:37.030Z"),
          },
          {
            _id: new ObjectId("62aba0150cff5986d44b3297"),
            category: "Education",
            mode: "Credit Card",
            title: "Javascript Online Course Yeha",
            amount: 640,
            author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
            createdAt: new Date("2022-06-21T21:26:27.000Z"),
          },
          {
            _id: new ObjectId("62ac1f8354e7cc0f5b86ec33"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
            createdAt: new Date("2022-06-17T06:30:25.587Z"),
          },
          {
            _id: new ObjectId("62c2d74967794830293a5613"),
            category: "Eating Out",
            mode: "UPI",
            title: "Dinner",
            amount: 1000,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-01T12:03:56.000Z"),
          },
          {
            _id: new ObjectId("628f185884ed6cfee3302f64"),
            category: "Transport",
            mode: "Credit Card",
            title: "Cab",
            amount: 1024,
            author: new ObjectId("628f0b52326126f3b7203cbe"),
            createdAt: new Date("2022-05-26T06:03:50.945Z"),
          },
          {
            _id: new ObjectId("6284cba31928593fbc555ba6"),
            category: "Travel",
            mode: "UPI",
            title: "Flights",
            amount: 6400,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-18T10:33:59.403Z"),
          },
        ];

        expect(data).toEqual(expectedOutput);
      }),
        it("sorts by string", () => {
          let pipeline = [{ $sort: { title: -1 } }];

          let data = aggregate(pipeline, realm, "Expense");

          let expectedOutput = [
            {
              _id: new ObjectId("6261269356de4a9f7e8f893b"),
              category: "Beverages",
              mode: "UPI",
              title: "Tea",
              amount: 10,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-24T11:47:01.000Z"),
            },
            {
              _id: new ObjectId("628f0b5dc1b266346e4ae0d2"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("628f0b52326126f3b7203cbe"),
              createdAt: new Date("2022-05-26T05:08:39.079Z"),
            },
            {
              _id: new ObjectId("628f15bd15fabf11ae8a6c06"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("628f15b315fabf11ae8a6a1a"),
              createdAt: new Date("2022-05-26T05:52:55.758Z"),
            },
            {
              _id: new ObjectId("6291400bc1b266346ea56723"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-27T21:17:57.885Z"),
            },
            {
              _id: new ObjectId("6293c18584ed6cfee3c623f0"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("6293c177326126f3b7b872ff"),
              createdAt: new Date("2022-05-29T18:54:53.928Z"),
            },
            {
              _id: new ObjectId("6296042d15fabf11ae703ca9"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("62960423c1b266346e33e033"),
              createdAt: new Date("2022-05-31T12:03:51.337Z"),
            },
            {
              _id: new ObjectId("62ac1f8354e7cc0f5b86ec33"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
              createdAt: new Date("2022-06-17T06:30:25.587Z"),
            },
            {
              _id: new ObjectId("629a178de314081a2e0d595f"),
              category: "Education",
              mode: "Credit Card",
              title: "New Online Course",
              amount: 640,
              author: new ObjectId("629a1670c2245919332890e2"),
              createdAt: new Date("2022-06-03T14:15:37.030Z"),
            },
            {
              _id: new ObjectId("61dbca296ce5d97556e52b18"),
              category: "Entertainment",
              mode: "Axis CC",
              title: "Netflix",
              amount: 149,
              author: new ObjectId("61d85eae766161a4497a6dd6"),
              createdAt: new Date("2022-01-10T06:22:29.000Z"),
            },
            {
              _id: new ObjectId("6261210156de4a9f7e8a6ab9"),
              category: "Food",
              mode: "Cash",
              title: "Mix Veg",
              amount: 300,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-24T11:46:53.000Z"),
            },
            {
              _id: new ObjectId("62959efa15fabf11ae5a566a"),
              category: "Food",
              mode: "Credit Card",
              title: "Mighty Fine",
              amount: 125,
              author: new ObjectId("6293c177326126f3b7b872ff"),
              createdAt: new Date("2022-05-31T04:51:46.544Z"),
            },
            {
              _id: new ObjectId("62aba0150cff5986d44b3297"),
              category: "Education",
              mode: "Credit Card",
              title: "Javascript Online Course Yeha",
              amount: 640,
              author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
              createdAt: new Date("2022-06-21T21:26:27.000Z"),
            },
            {
              _id: new ObjectId("6284cba31928593fbc555ba6"),
              category: "Travel",
              mode: "UPI",
              title: "Flights",
              amount: 6400,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-18T10:33:59.403Z"),
            },
            {
              _id: new ObjectId("62c2d74967794830293a5613"),
              category: "Eating Out",
              mode: "UPI",
              title: "Dinner",
              amount: 1000,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-01T12:03:56.000Z"),
            },
            {
              _id: new ObjectId("628f185884ed6cfee3302f64"),
              category: "Transport",
              mode: "Credit Card",
              title: "Cab",
              amount: 1024,
              author: new ObjectId("628f0b52326126f3b7203cbe"),
              createdAt: new Date("2022-05-26T06:03:50.945Z"),
            },
          ];

          expect(data).toEqual(expectedOutput);

          pipeline = [{ $sort: { title: 1 } }];

          data = aggregate(pipeline, realm, "Expense");
          expectedOutput = [
            {
              _id: new ObjectId("628f185884ed6cfee3302f64"),
              category: "Transport",
              mode: "Credit Card",
              title: "Cab",
              amount: 1024,
              author: new ObjectId("628f0b52326126f3b7203cbe"),
              createdAt: new Date("2022-05-26T06:03:50.945Z"),
            },
            {
              _id: new ObjectId("62c2d74967794830293a5613"),
              category: "Eating Out",
              mode: "UPI",
              title: "Dinner",
              amount: 1000,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-01T12:03:56.000Z"),
            },
            {
              _id: new ObjectId("6284cba31928593fbc555ba6"),
              category: "Travel",
              mode: "UPI",
              title: "Flights",
              amount: 6400,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-18T10:33:59.403Z"),
            },
            {
              _id: new ObjectId("62aba0150cff5986d44b3297"),
              category: "Education",
              mode: "Credit Card",
              title: "Javascript Online Course Yeha",
              amount: 640,
              author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
              createdAt: new Date("2022-06-21T21:26:27.000Z"),
            },
            {
              _id: new ObjectId("62959efa15fabf11ae5a566a"),
              category: "Food",
              mode: "Credit Card",
              title: "Mighty Fine",
              amount: 125,
              author: new ObjectId("6293c177326126f3b7b872ff"),
              createdAt: new Date("2022-05-31T04:51:46.544Z"),
            },
            {
              _id: new ObjectId("6261210156de4a9f7e8a6ab9"),
              category: "Food",
              mode: "Cash",
              title: "Mix Veg",
              amount: 300,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-24T11:46:53.000Z"),
            },
            {
              _id: new ObjectId("61dbca296ce5d97556e52b18"),
              category: "Entertainment",
              mode: "Axis CC",
              title: "Netflix",
              amount: 149,
              author: new ObjectId("61d85eae766161a4497a6dd6"),
              createdAt: new Date("2022-01-10T06:22:29.000Z"),
            },
            {
              _id: new ObjectId("629a178de314081a2e0d595f"),
              category: "Education",
              mode: "Credit Card",
              title: "New Online Course",
              amount: 640,
              author: new ObjectId("629a1670c2245919332890e2"),
              createdAt: new Date("2022-06-03T14:15:37.030Z"),
            },
            {
              _id: new ObjectId("628f0b5dc1b266346e4ae0d2"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("628f0b52326126f3b7203cbe"),
              createdAt: new Date("2022-05-26T05:08:39.079Z"),
            },
            {
              _id: new ObjectId("628f15bd15fabf11ae8a6c06"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("628f15b315fabf11ae8a6a1a"),
              createdAt: new Date("2022-05-26T05:52:55.758Z"),
            },
            {
              _id: new ObjectId("6291400bc1b266346ea56723"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-27T21:17:57.885Z"),
            },
            {
              _id: new ObjectId("6293c18584ed6cfee3c623f0"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("6293c177326126f3b7b872ff"),
              createdAt: new Date("2022-05-29T18:54:53.928Z"),
            },
            {
              _id: new ObjectId("6296042d15fabf11ae703ca9"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("62960423c1b266346e33e033"),
              createdAt: new Date("2022-05-31T12:03:51.337Z"),
            },
            {
              _id: new ObjectId("62ac1f8354e7cc0f5b86ec33"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
              createdAt: new Date("2022-06-17T06:30:25.587Z"),
            },
            {
              _id: new ObjectId("6261269356de4a9f7e8f893b"),
              category: "Beverages",
              mode: "UPI",
              title: "Tea",
              amount: 10,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-24T11:47:01.000Z"),
            },
          ];
          expect(data).toEqual(expectedOutput);
        }),
        it("sorts by date", () => {
          let pipeline = [{ $sort: { createdAt: -1 } }];

          let data = aggregate(pipeline, realm, "Expense");

          let expectedOutput = [
            {
              _id: new ObjectId("62aba0150cff5986d44b3297"),
              category: "Education",
              mode: "Credit Card",
              title: "Javascript Online Course Yeha",
              amount: 640,
              author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
              createdAt: new Date("2022-06-21T21:26:27.000Z"),
            },
            {
              _id: new ObjectId("62ac1f8354e7cc0f5b86ec33"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
              createdAt: new Date("2022-06-17T06:30:25.587Z"),
            },
            {
              _id: new ObjectId("629a178de314081a2e0d595f"),
              category: "Education",
              mode: "Credit Card",
              title: "New Online Course",
              amount: 640,
              author: new ObjectId("629a1670c2245919332890e2"),
              createdAt: new Date("2022-06-03T14:15:37.030Z"),
            },
            {
              _id: new ObjectId("6296042d15fabf11ae703ca9"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("62960423c1b266346e33e033"),
              createdAt: new Date("2022-05-31T12:03:51.337Z"),
            },
            {
              _id: new ObjectId("62959efa15fabf11ae5a566a"),
              category: "Food",
              mode: "Credit Card",
              title: "Mighty Fine",
              amount: 125,
              author: new ObjectId("6293c177326126f3b7b872ff"),
              createdAt: new Date("2022-05-31T04:51:46.544Z"),
            },
            {
              _id: new ObjectId("6293c18584ed6cfee3c623f0"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("6293c177326126f3b7b872ff"),
              createdAt: new Date("2022-05-29T18:54:53.928Z"),
            },
            {
              _id: new ObjectId("6291400bc1b266346ea56723"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-27T21:17:57.885Z"),
            },
            {
              _id: new ObjectId("628f185884ed6cfee3302f64"),
              category: "Transport",
              mode: "Credit Card",
              title: "Cab",
              amount: 1024,
              author: new ObjectId("628f0b52326126f3b7203cbe"),
              createdAt: new Date("2022-05-26T06:03:50.945Z"),
            },
            {
              _id: new ObjectId("628f15bd15fabf11ae8a6c06"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("628f15b315fabf11ae8a6a1a"),
              createdAt: new Date("2022-05-26T05:52:55.758Z"),
            },
            {
              _id: new ObjectId("628f0b5dc1b266346e4ae0d2"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("628f0b52326126f3b7203cbe"),
              createdAt: new Date("2022-05-26T05:08:39.079Z"),
            },
            {
              _id: new ObjectId("6261269356de4a9f7e8f893b"),
              category: "Beverages",
              mode: "UPI",
              title: "Tea",
              amount: 10,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-24T11:47:01.000Z"),
            },
            {
              _id: new ObjectId("6261210156de4a9f7e8a6ab9"),
              category: "Food",
              mode: "Cash",
              title: "Mix Veg",
              amount: 300,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-24T11:46:53.000Z"),
            },
            {
              _id: new ObjectId("6284cba31928593fbc555ba6"),
              category: "Travel",
              mode: "UPI",
              title: "Flights",
              amount: 6400,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-18T10:33:59.403Z"),
            },
            {
              _id: new ObjectId("62c2d74967794830293a5613"),
              category: "Eating Out",
              mode: "UPI",
              title: "Dinner",
              amount: 1000,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-01T12:03:56.000Z"),
            },
            {
              _id: new ObjectId("61dbca296ce5d97556e52b18"),
              category: "Entertainment",
              mode: "Axis CC",
              title: "Netflix",
              amount: 149,
              author: new ObjectId("61d85eae766161a4497a6dd6"),
              createdAt: new Date("2022-01-10T06:22:29.000Z"),
            },
          ];

          expect(data).toEqual(expectedOutput);

          pipeline = [{ $sort: { createdAt: 1 } }];

          data = aggregate(pipeline, realm, "Expense");

          expectedOutput = [
            {
              _id: new ObjectId("61dbca296ce5d97556e52b18"),
              category: "Entertainment",
              mode: "Axis CC",
              title: "Netflix",
              amount: 149,
              author: new ObjectId("61d85eae766161a4497a6dd6"),
              createdAt: new Date("2022-01-10T06:22:29.000Z"),
            },
            {
              _id: new ObjectId("62c2d74967794830293a5613"),
              category: "Eating Out",
              mode: "UPI",
              title: "Dinner",
              amount: 1000,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-01T12:03:56.000Z"),
            },
            {
              _id: new ObjectId("6284cba31928593fbc555ba6"),
              category: "Travel",
              mode: "UPI",
              title: "Flights",
              amount: 6400,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-18T10:33:59.403Z"),
            },
            {
              _id: new ObjectId("6261210156de4a9f7e8a6ab9"),
              category: "Food",
              mode: "Cash",
              title: "Mix Veg",
              amount: 300,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-24T11:46:53.000Z"),
            },
            {
              _id: new ObjectId("6261269356de4a9f7e8f893b"),
              category: "Beverages",
              mode: "UPI",
              title: "Tea",
              amount: 10,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-24T11:47:01.000Z"),
            },
            {
              _id: new ObjectId("628f0b5dc1b266346e4ae0d2"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("628f0b52326126f3b7203cbe"),
              createdAt: new Date("2022-05-26T05:08:39.079Z"),
            },
            {
              _id: new ObjectId("628f15bd15fabf11ae8a6c06"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("628f15b315fabf11ae8a6a1a"),
              createdAt: new Date("2022-05-26T05:52:55.758Z"),
            },
            {
              _id: new ObjectId("628f185884ed6cfee3302f64"),
              category: "Transport",
              mode: "Credit Card",
              title: "Cab",
              amount: 1024,
              author: new ObjectId("628f0b52326126f3b7203cbe"),
              createdAt: new Date("2022-05-26T06:03:50.945Z"),
            },
            {
              _id: new ObjectId("6291400bc1b266346ea56723"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("624fd95c095bb869dc9700cc"),
              createdAt: new Date("2022-05-27T21:17:57.885Z"),
            },
            {
              _id: new ObjectId("6293c18584ed6cfee3c623f0"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("6293c177326126f3b7b872ff"),
              createdAt: new Date("2022-05-29T18:54:53.928Z"),
            },
            {
              _id: new ObjectId("62959efa15fabf11ae5a566a"),
              category: "Food",
              mode: "Credit Card",
              title: "Mighty Fine",
              amount: 125,
              author: new ObjectId("6293c177326126f3b7b872ff"),
              createdAt: new Date("2022-05-31T04:51:46.544Z"),
            },
            {
              _id: new ObjectId("6296042d15fabf11ae703ca9"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("62960423c1b266346e33e033"),
              createdAt: new Date("2022-05-31T12:03:51.337Z"),
            },
            {
              _id: new ObjectId("629a178de314081a2e0d595f"),
              category: "Education",
              mode: "Credit Card",
              title: "New Online Course",
              amount: 640,
              author: new ObjectId("629a1670c2245919332890e2"),
              createdAt: new Date("2022-06-03T14:15:37.030Z"),
            },
            {
              _id: new ObjectId("62ac1f8354e7cc0f5b86ec33"),
              category: "Education",
              mode: "Credit Card",
              title: "Online Course",
              amount: 640,
              author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
              createdAt: new Date("2022-06-17T06:30:25.587Z"),
            },
            {
              _id: new ObjectId("62aba0150cff5986d44b3297"),
              category: "Education",
              mode: "Credit Card",
              title: "Javascript Online Course Yeha",
              amount: 640,
              author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
              createdAt: new Date("2022-06-21T21:26:27.000Z"),
            },
          ];

          expect(data).toEqual(expectedOutput);
        });
      it("sorts by objectId", () => {
        let pipeline = [{ $sort: { _id: -1 } }];

        let data = aggregate(pipeline, realm, "Expense");

        let expectedOutput = [
          {
            _id: new ObjectId("62c2d74967794830293a5613"),
            category: "Eating Out",
            mode: "UPI",
            title: "Dinner",
            amount: 1000,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-01T12:03:56.000Z"),
          },
          {
            _id: new ObjectId("62ac1f8354e7cc0f5b86ec33"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
            createdAt: new Date("2022-06-17T06:30:25.587Z"),
          },
          {
            _id: new ObjectId("62aba0150cff5986d44b3297"),
            category: "Education",
            mode: "Credit Card",
            title: "Javascript Online Course Yeha",
            amount: 640,
            author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
            createdAt: new Date("2022-06-21T21:26:27.000Z"),
          },
          {
            _id: new ObjectId("629a178de314081a2e0d595f"),
            category: "Education",
            mode: "Credit Card",
            title: "New Online Course",
            amount: 640,
            author: new ObjectId("629a1670c2245919332890e2"),
            createdAt: new Date("2022-06-03T14:15:37.030Z"),
          },
          {
            _id: new ObjectId("6296042d15fabf11ae703ca9"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("62960423c1b266346e33e033"),
            createdAt: new Date("2022-05-31T12:03:51.337Z"),
          },
          {
            _id: new ObjectId("62959efa15fabf11ae5a566a"),
            category: "Food",
            mode: "Credit Card",
            title: "Mighty Fine",
            amount: 125,
            author: new ObjectId("6293c177326126f3b7b872ff"),
            createdAt: new Date("2022-05-31T04:51:46.544Z"),
          },
          {
            _id: new ObjectId("6293c18584ed6cfee3c623f0"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("6293c177326126f3b7b872ff"),
            createdAt: new Date("2022-05-29T18:54:53.928Z"),
          },
          {
            _id: new ObjectId("6291400bc1b266346ea56723"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-27T21:17:57.885Z"),
          },
          {
            _id: new ObjectId("628f185884ed6cfee3302f64"),
            category: "Transport",
            mode: "Credit Card",
            title: "Cab",
            amount: 1024,
            author: new ObjectId("628f0b52326126f3b7203cbe"),
            createdAt: new Date("2022-05-26T06:03:50.945Z"),
          },
          {
            _id: new ObjectId("628f15bd15fabf11ae8a6c06"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("628f15b315fabf11ae8a6a1a"),
            createdAt: new Date("2022-05-26T05:52:55.758Z"),
          },
          {
            _id: new ObjectId("628f0b5dc1b266346e4ae0d2"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("628f0b52326126f3b7203cbe"),
            createdAt: new Date("2022-05-26T05:08:39.079Z"),
          },
          {
            _id: new ObjectId("6284cba31928593fbc555ba6"),
            category: "Travel",
            mode: "UPI",
            title: "Flights",
            amount: 6400,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-18T10:33:59.403Z"),
          },
          {
            _id: new ObjectId("6261269356de4a9f7e8f893b"),
            category: "Beverages",
            mode: "UPI",
            title: "Tea",
            amount: 10,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-24T11:47:01.000Z"),
          },
          {
            _id: new ObjectId("6261210156de4a9f7e8a6ab9"),
            category: "Food",
            mode: "Cash",
            title: "Mix Veg",
            amount: 300,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-24T11:46:53.000Z"),
          },
          {
            _id: new ObjectId("61dbca296ce5d97556e52b18"),
            category: "Entertainment",
            mode: "Axis CC",
            title: "Netflix",
            amount: 149,
            author: new ObjectId("61d85eae766161a4497a6dd6"),
            createdAt: new Date("2022-01-10T06:22:29.000Z"),
          },
        ];

        expect(data).toEqual(expectedOutput);

        pipeline = [{ $sort: { _id: 1 } }];

        data = aggregate(pipeline, realm, "Expense");

        expectedOutput = [
          {
            _id: new ObjectId("61dbca296ce5d97556e52b18"),
            category: "Entertainment",
            mode: "Axis CC",
            title: "Netflix",
            amount: 149,
            author: new ObjectId("61d85eae766161a4497a6dd6"),
            createdAt: new Date("2022-01-10T06:22:29.000Z"),
          },
          {
            _id: new ObjectId("6261210156de4a9f7e8a6ab9"),
            category: "Food",
            mode: "Cash",
            title: "Mix Veg",
            amount: 300,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-24T11:46:53.000Z"),
          },
          {
            _id: new ObjectId("6261269356de4a9f7e8f893b"),
            category: "Beverages",
            mode: "UPI",
            title: "Tea",
            amount: 10,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-24T11:47:01.000Z"),
          },
          {
            _id: new ObjectId("6284cba31928593fbc555ba6"),
            category: "Travel",
            mode: "UPI",
            title: "Flights",
            amount: 6400,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-18T10:33:59.403Z"),
          },
          {
            _id: new ObjectId("628f0b5dc1b266346e4ae0d2"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("628f0b52326126f3b7203cbe"),
            createdAt: new Date("2022-05-26T05:08:39.079Z"),
          },
          {
            _id: new ObjectId("628f15bd15fabf11ae8a6c06"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("628f15b315fabf11ae8a6a1a"),
            createdAt: new Date("2022-05-26T05:52:55.758Z"),
          },
          {
            _id: new ObjectId("628f185884ed6cfee3302f64"),
            category: "Transport",
            mode: "Credit Card",
            title: "Cab",
            amount: 1024,
            author: new ObjectId("628f0b52326126f3b7203cbe"),
            createdAt: new Date("2022-05-26T06:03:50.945Z"),
          },
          {
            _id: new ObjectId("6291400bc1b266346ea56723"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-27T21:17:57.885Z"),
          },
          {
            _id: new ObjectId("6293c18584ed6cfee3c623f0"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("6293c177326126f3b7b872ff"),
            createdAt: new Date("2022-05-29T18:54:53.928Z"),
          },
          {
            _id: new ObjectId("62959efa15fabf11ae5a566a"),
            category: "Food",
            mode: "Credit Card",
            title: "Mighty Fine",
            amount: 125,
            author: new ObjectId("6293c177326126f3b7b872ff"),
            createdAt: new Date("2022-05-31T04:51:46.544Z"),
          },
          {
            _id: new ObjectId("6296042d15fabf11ae703ca9"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("62960423c1b266346e33e033"),
            createdAt: new Date("2022-05-31T12:03:51.337Z"),
          },
          {
            _id: new ObjectId("629a178de314081a2e0d595f"),
            category: "Education",
            mode: "Credit Card",
            title: "New Online Course",
            amount: 640,
            author: new ObjectId("629a1670c2245919332890e2"),
            createdAt: new Date("2022-06-03T14:15:37.030Z"),
          },
          {
            _id: new ObjectId("62aba0150cff5986d44b3297"),
            category: "Education",
            mode: "Credit Card",
            title: "Javascript Online Course Yeha",
            amount: 640,
            author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
            createdAt: new Date("2022-06-21T21:26:27.000Z"),
          },
          {
            _id: new ObjectId("62ac1f8354e7cc0f5b86ec33"),
            category: "Education",
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
            createdAt: new Date("2022-06-17T06:30:25.587Z"),
          },
          {
            _id: new ObjectId("62c2d74967794830293a5613"),
            category: "Eating Out",
            mode: "UPI",
            title: "Dinner",
            amount: 1000,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            createdAt: new Date("2022-05-01T12:03:56.000Z"),
          },
        ];

        expect(data).toEqual(expectedOutput);
      });
    });
    it("allows $project", () => {
      const pipeline = [{ $project: { title: 1, paymentMode: "$mode" } }];
      const data = aggregate(pipeline, realm, "Expense");
      const expectedOutput = [
        { title: "Netflix", paymentMode: "Axis CC" },
        { title: "Mix Veg", paymentMode: "Cash" },
        { title: "Tea", paymentMode: "UPI" },
        { title: "Flights", paymentMode: "UPI" },
        { title: "Online Course", paymentMode: "Credit Card" },
        { title: "Online Course", paymentMode: "Credit Card" },
        { title: "Cab", paymentMode: "Credit Card" },
        { title: "Online Course", paymentMode: "Credit Card" },
        { title: "Online Course", paymentMode: "Credit Card" },
        { title: "Mighty Fine", paymentMode: "Credit Card" },
        { title: "Online Course", paymentMode: "Credit Card" },
        { title: "New Online Course", paymentMode: "Credit Card" },
        {
          title: "Javascript Online Course Yeha",
          paymentMode: "Credit Card",
        },
        { title: "Online Course", paymentMode: "Credit Card" },
        { title: "Dinner", paymentMode: "UPI" },
      ];
      expect(data).toEqual(expectedOutput);
    });

    it("allows $project with exclusions", () => {
      const pipeline = [{ $project: { title: 0 } }];
      const data = aggregate(pipeline, realm, "Expense");
      const expectedOutput = [
        {
          _id: new ObjectId("61dbca296ce5d97556e52b18"),
          category: "Entertainment",
          mode: "Axis CC",
          amount: 149,
          author: new ObjectId("61d85eae766161a4497a6dd6"),
          createdAt: new Date("2022-01-10T06:22:29.000Z"),
        },
        {
          _id: new ObjectId("6261210156de4a9f7e8a6ab9"),
          category: "Food",
          mode: "Cash",
          amount: 300,
          author: new ObjectId("624fd95c095bb869dc9700cc"),
          createdAt: new Date("2022-05-24T11:46:53.000Z"),
        },
        {
          _id: new ObjectId("6261269356de4a9f7e8f893b"),
          category: "Beverages",
          mode: "UPI",
          amount: 10,
          author: new ObjectId("624fd95c095bb869dc9700cc"),
          createdAt: new Date("2022-05-24T11:47:01.000Z"),
        },
        {
          _id: new ObjectId("6284cba31928593fbc555ba6"),
          category: "Travel",
          mode: "UPI",
          amount: 6400,
          author: new ObjectId("624fd95c095bb869dc9700cc"),
          createdAt: new Date("2022-05-18T10:33:59.403Z"),
        },
        {
          _id: new ObjectId("628f0b5dc1b266346e4ae0d2"),
          category: "Education",
          mode: "Credit Card",
          amount: 640,
          author: new ObjectId("628f0b52326126f3b7203cbe"),
          createdAt: new Date("2022-05-26T05:08:39.079Z"),
        },
        {
          _id: new ObjectId("628f15bd15fabf11ae8a6c06"),
          category: "Education",
          mode: "Credit Card",
          amount: 640,
          author: new ObjectId("628f15b315fabf11ae8a6a1a"),
          createdAt: new Date("2022-05-26T05:52:55.758Z"),
        },
        {
          _id: new ObjectId("628f185884ed6cfee3302f64"),
          category: "Transport",
          mode: "Credit Card",
          amount: 1024,
          author: new ObjectId("628f0b52326126f3b7203cbe"),
          createdAt: new Date("2022-05-26T06:03:50.945Z"),
        },
        {
          _id: new ObjectId("6291400bc1b266346ea56723"),
          category: "Education",
          mode: "Credit Card",
          amount: 640,
          author: new ObjectId("624fd95c095bb869dc9700cc"),
          createdAt: new Date("2022-05-27T21:17:57.885Z"),
        },
        {
          _id: new ObjectId("6293c18584ed6cfee3c623f0"),
          category: "Education",
          mode: "Credit Card",
          amount: 640,
          author: new ObjectId("6293c177326126f3b7b872ff"),
          createdAt: new Date("2022-05-29T18:54:53.928Z"),
        },
        {
          _id: new ObjectId("62959efa15fabf11ae5a566a"),
          category: "Food",
          mode: "Credit Card",
          amount: 125,
          author: new ObjectId("6293c177326126f3b7b872ff"),
          createdAt: new Date("2022-05-31T04:51:46.544Z"),
        },
        {
          _id: new ObjectId("6296042d15fabf11ae703ca9"),
          category: "Education",
          mode: "Credit Card",
          amount: 640,
          author: new ObjectId("62960423c1b266346e33e033"),
          createdAt: new Date("2022-05-31T12:03:51.337Z"),
        },
        {
          _id: new ObjectId("629a178de314081a2e0d595f"),
          category: "Education",
          mode: "Credit Card",
          amount: 640,
          author: new ObjectId("629a1670c2245919332890e2"),
          createdAt: new Date("2022-06-03T14:15:37.030Z"),
        },
        {
          _id: new ObjectId("62aba0150cff5986d44b3297"),
          category: "Education",
          mode: "Credit Card",
          amount: 640,
          author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
          createdAt: new Date("2022-06-21T21:26:27.000Z"),
        },
        {
          _id: new ObjectId("62ac1f8354e7cc0f5b86ec33"),
          category: "Education",
          mode: "Credit Card",
          amount: 640,
          author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
          createdAt: new Date("2022-06-17T06:30:25.587Z"),
        },
        {
          _id: new ObjectId("62c2d74967794830293a5613"),
          category: "Eating Out",
          mode: "UPI",
          amount: 1000,
          author: new ObjectId("624fd95c095bb869dc9700cc"),
          createdAt: new Date("2022-05-01T12:03:56.000Z"),
        },
      ];
      expect(data).toEqual(expectedOutput);
    });
    describe("allows $limit", () => {
      it("with valid input", () => {
        const pipeline = [{ $limit: 1 }];
        const data = aggregate(pipeline, realm, "Expense");
        const expectedOutput = [
          {
            _id: new ObjectId("61dbca296ce5d97556e52b18"),
            category: "Entertainment",
            mode: "Axis CC",
            title: "Netflix",
            amount: 149,
            author: new ObjectId("61d85eae766161a4497a6dd6"),
            createdAt: new Date("2022-01-10T06:22:29.000Z"),
          },
        ];
        expect(data).toEqual(expectedOutput);
      });
      it("throws on invalid input", () => {
        const pipeline = [{ $limit: -1 }];
        expect(() => aggregate(pipeline, realm, "Expense")).toThrow();
      });
    });
    describe("allows $skip", () => {
      it("with valid input", () => {
        const pipeline = [{ $skip: 13 }];
        const data = aggregate(pipeline, realm, "Expense");
        const expectedOutput = [
          {
            _id: new ObjectId("62ac1f8354e7cc0f5b86ec33"),
            category: "Education",
            createdAt: new Date("2022-06-17T06:30:25.587Z"),
            mode: "Credit Card",
            title: "Online Course",
            amount: 640,
            author: new ObjectId("62ab9ff654e7cc0f5b79ee8b"),
          },
          {
            _id: new ObjectId("62c2d74967794830293a5613"),
            amount: 1000,
            author: new ObjectId("624fd95c095bb869dc9700cc"),
            category: "Eating Out",
            createdAt: new Date("2022-05-01T12:03:56.000Z"),
            mode: "UPI",
            title: "Dinner",
          },
        ];
        expect(data).toEqual(expectedOutput);
      });
      it("throws on invalid input", () => {
        const pipeline = [{ $skip: -1 }];
        expect(() => aggregate(pipeline, realm, "Expense")).toThrow();
      });
    });
  });
});
