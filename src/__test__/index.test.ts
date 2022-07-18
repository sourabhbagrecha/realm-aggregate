import { getTestString, otherFunction } from ".."

describe("test function", () => {
	it("returns a string", () => {
		expect( typeof getTestString()).toBe("string")
	})
	it("returns hello world", () => {
		expect( getTestString()).toBe("hello world")
	})
})

describe("test otherFunction", () => {
	it("returns a number", () => {
		expect( typeof otherFunction()).toBe("number")
	})
	it("returns hello world", () => {
		expect( otherFunction()).toBe(1)
	})
})
