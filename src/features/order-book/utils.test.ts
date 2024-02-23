import { setLocale, sortArrayAsc, sortArrayDesc } from "./utils"

describe("setLocale order book util", it => {
  it("should set number length to 4 and add suffix if applicable", () => {
    expect(setLocale(0)).toBe("0.0000")
    expect(setLocale(0.1)).toBe("0.1000")
    expect(setLocale(0.01)).toBe("0.0100")
    expect(setLocale(0.0001)).toBe("0.0001")
    expect(setLocale(0.00001)).toBe("0.0000")
    expect(setLocale(10)).toBe("10.00")
    expect(setLocale(50.2)).toBe("50.20")
    expect(setLocale(999)).toBe("999.0")
    expect(setLocale(1000)).toBe("1.000K")
    expect(setLocale(1000000)).toBe("1.000M")
    expect(setLocale(10000000)).toBe("10.00M")
  })
})

describe("sortArrayAsc order book util", it => {
  it("should return the input array in ascending order", () => {
    expect(sortArrayAsc([1, 3, 2, 0])).toEqual([0, 1, 2, 3])
  })
})

describe("sortArrayDesc order book util", it => {
  it("should return the input array in descending order", () => {
    expect(sortArrayDesc([1, 3, 2, 0])).toEqual([3, 2, 1, 0])
  })
})
