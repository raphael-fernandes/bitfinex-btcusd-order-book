import type { AppStore } from "../../app/store"
import { makeStore } from "../../app/store"
import type { OrderBookSliceState } from "./orderBookSlice"
import {
  updatePrecision,
  updateStatus,
  setBookData,
  updateBookData,
  selectPrecision,
  selectBook,
  selectStatus,
  orderBookSlice,
} from "./orderBookSlice"

interface LocalTestContext {
  store: AppStore
}

describe("order book reducer", it => {
  beforeEach<LocalTestContext>(context => {
    const initialState: OrderBookSliceState = {
      precision: "P3",
      book: {
        bids: {},
        asks: {},
      },
      status: {
        connected: false,
        reconnecting: false,
      },
    }

    const store = makeStore({ book: initialState })

    context.store = store
  })

  it("should handle initial state", () => {
    expect(
      orderBookSlice.reducer(undefined, { type: "unknown" }),
    ).toStrictEqual({
      precision: "P3",
      book: {
        bids: {},
        asks: {},
      },
      status: {
        connected: false,
        reconnecting: false,
      },
    })
  })

  describe("price precision", () => {
    describe("if new price precision is valid", it => {
      it("should update precision", ({ store }) => {
        expect(selectPrecision(store.getState())).toBe("P3")

        store.dispatch(updatePrecision("P2"))

        expect(selectPrecision(store.getState())).toBe("P2")
      })
    })

    describe("if new price precision is invalid", it => {
      it("should not update precision", ({ store }) => {
        expect(selectPrecision(store.getState())).toBe("P3")

        store.dispatch(updatePrecision("P5"))

        expect(selectPrecision(store.getState())).toBe("P3")
      })
    })
  })

  it("should handle update only connected status", ({ store }) => {
    expect(selectStatus(store.getState())).toEqual({
      connected: false,
      reconnecting: false,
    })

    store.dispatch(
      updateStatus({
        connected: true,
      }),
    )

    expect(selectStatus(store.getState())).toEqual({
      connected: true,
      reconnecting: false,
    })
  })

  it("should handle update only reconnecting status", ({ store }) => {
    expect(selectStatus(store.getState())).toEqual({
      connected: false,
      reconnecting: false,
    })

    store.dispatch(
      updateStatus({
        reconnecting: true,
      }),
    )

    expect(selectStatus(store.getState())).toEqual({
      connected: false,
      reconnecting: true,
    })
  })

  it("should handle bulk set status", ({ store }) => {
    expect(selectStatus(store.getState())).toEqual({
      connected: false,
      reconnecting: false,
    })

    store.dispatch(
      updateStatus({
        connected: true,
        reconnecting: true,
      }),
    )

    expect(selectStatus(store.getState())).toEqual({
      connected: true,
      reconnecting: true,
    })
  })

  it("should handle set book data", ({ store }) => {
    expect(selectBook(store.getState())).toEqual({ bids: {}, asks: {} })

    store.dispatch(
      setBookData([
        [1000, 1, 1],
        [2000, 2, -2],
      ]),
    )

    expect(selectBook(store.getState())).toEqual({
      bids: {
        1000: { count: 1, amount: 1 },
      },
      asks: {
        2000: { count: 2, amount: 2 },
      },
    })
  })

  it("should handle add to bids book data", ({ store }) => {
    expect(selectBook(store.getState())).toEqual({ bids: {}, asks: {} })

    store.dispatch(updateBookData([1500, 1, 1]))

    expect(selectBook(store.getState())).toEqual({
      asks: {},
      bids: {
        1500: { count: 1, amount: 1 },
      },
    })
  })

  it("should handle add to asks book data", ({ store }) => {
    expect(selectBook(store.getState())).toEqual({ bids: {}, asks: {} })

    store.dispatch(updateBookData([2200, 3, -3]))

    expect(selectBook(store.getState())).toEqual({
      bids: {},
      asks: {
        2200: { count: 3, amount: 3 },
      },
    })
  })

  it("should handle remove from bids book data", ({ store }) => {
    expect(selectBook(store.getState())).toEqual({ bids: {}, asks: {} })

    store.dispatch(
      setBookData([
        [1000, 1, 1],
        [2000, 1, 1],
      ]),
    )
    store.dispatch(updateBookData([1000, 0, 1]))

    expect(selectBook(store.getState())).toEqual({
      asks: {},
      bids: {
        2000: { count: 1, amount: 1 },
      },
    })
  })

  it("should handle remove from asks book data", ({ store }) => {
    expect(selectBook(store.getState())).toEqual({ bids: {}, asks: {} })

    store.dispatch(
      setBookData([
        [4000, 1, -1],
        [5000, 1, -1],
      ]),
    )
    store.dispatch(updateBookData([5000, 0, -1]))

    expect(selectBook(store.getState())).toEqual({
      bids: {},
      asks: {
        4000: { count: 1, amount: 1 },
      },
    })
  })
})
