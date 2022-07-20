import { applyAddFieldsStage } from "../addFields";

describe("allows $addFields", () => {
  const sampleData = [
    {
      title: "TV Shows",
      category: "a",
      amount: 2,
    },
    {
      title: "Books",
      category: "b",
      amount: 1,
    },
    {
      title: "Movies",
      category: "c",
      amount: 4,
    },
    {
      title: "Web series",
      category: "c",
      amount: 3,
    },
  ];
  it("with a valid input: Plain String ", () => {
    const output = applyAddFieldsStage({ newField: "Adding something new here" }, sampleData);
    const expectedOutput = [
      {
        title: "TV Shows",
        category: "a",
        amount: 2,
        newField: "Adding something new here",
      },
      {
        title: "Books",
        category: "b",
        amount: 1,
        newField: "Adding something new here",
      },
      {
        title: "Movies",
        category: "c",
        amount: 4,
        newField: "Adding something new here",
      },
      {
        title: "Web series",
        category: "c",
        amount: 3,
        newField: "Adding something new here",
      },
    ];
    expect(output).toEqual(expectedOutput);
  });
  it("with a valid input: Document's Field Name using $", () => {
    const output = applyAddFieldsStage({ sameTitleButInFrontOfANewField: "$title" }, sampleData);
    const expectedOutput = [
      {
        title: "TV Shows",
        category: "a",
        amount: 2,
        sameTitleButInFrontOfANewField: "TV Shows",
      },
      {
        title: "Books",
        category: "b",
        amount: 1,
        sameTitleButInFrontOfANewField: "Books",
      },
      {
        title: "Movies",
        category: "c",
        amount: 4,
        sameTitleButInFrontOfANewField: "Movies",
      },
      {
        title: "Web series",
        category: "c",
        amount: 3,
        sameTitleButInFrontOfANewField: "Web series",
      },
    ];
    expect(output).toEqual(expectedOutput);
  });
  it("with a valid input: Nested objects", () => {
    const output = applyAddFieldsStage(
      {
        name: {
          first: "Sourabh",
          meta: { fieldFromSourceDocumentInANestedObject: "$title" },
        },
      },
      sampleData,
    );

    const expectedOutput = [
      {
        title: "TV Shows",
        category: "a",
        amount: 2,
        name: {
          first: "Sourabh",
          meta: { fieldFromSourceDocumentInANestedObject: "TV Shows" },
        },
      },
      {
        title: "Books",
        category: "b",
        amount: 1,
        name: {
          first: "Sourabh",
          meta: { fieldFromSourceDocumentInANestedObject: "Books" },
        },
      },
      {
        title: "Movies",
        category: "c",
        amount: 4,
        name: {
          first: "Sourabh",
          meta: { fieldFromSourceDocumentInANestedObject: "Movies" },
        },
      },
      {
        title: "Web series",
        category: "c",
        amount: 3,
        name: {
          first: "Sourabh",
          meta: { fieldFromSourceDocumentInANestedObject: "Web series" },
        },
      },
    ];

    expect(output).toEqual(expectedOutput);
  });
  it("with an invalid input: just number", () => {
    const output = applyAddFieldsStage.bind(null, 2, sampleData);
    expect(output).toThrow();
  });
  it("with an invalid input: just string", () => {
    const output = applyAddFieldsStage.bind(null, "Some String here", sampleData);
    expect(output).toThrow();
  });
});
