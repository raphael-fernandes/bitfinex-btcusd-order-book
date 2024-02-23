import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type {
  AggregateMessageData,
  SnapshotMessageData,
  BookMessageData,
  ErrorMessageData,
} from "./BookSocket"
import { pricePrecisionLevels } from "./BookSocket"
import { BookSocket, defaultRequestFields } from "./BookSocket"

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

type Order = {
  [index: number]: {
    count: number
    amount: number
  }
}

type Status = {
  connected?: boolean
  reconnecting?: boolean
}

export type OrderBookSliceState = {
  precision: string
  book: {
    asks: Order
    bids: Order
  }
  status: RequireAtLeastOne<Status, "connected" | "reconnecting">
}

export const initialState: OrderBookSliceState = {
  precision: defaultRequestFields.prec,
  book: {
    bids: {},
    asks: {},
  },
  status: {
    connected: false,
    reconnecting: false,
  },
}

export const orderBookSlice = createSlice({
  name: "book",
  initialState,
  reducers: create => ({
    updatePrecision: create.reducer((state, action: PayloadAction<string>) => {
      if (pricePrecisionLevels.includes(action.payload)) {
        state.precision = action.payload
      }
    }),
    updateStatus: create.reducer(
      (state, action: PayloadAction<OrderBookSliceState["status"]>) => {
        state.status = { ...state.status, ...action.payload }
      },
    ),
    setBookData: create.reducer(
      (state, action: PayloadAction<SnapshotMessageData[1]>) => {
        const newBook: OrderBookSliceState["book"] = { bids: {}, asks: {} }

        action.payload.forEach(([price, count, amount]) => {
          if (count > 0) {
            const data = { count, amount: Math.abs(amount) }

            if (amount > 0) {
              newBook.bids[price] = data
            } else if (amount < 0) {
              newBook.asks[price] = data
            }
          }
        })

        state.book = { ...newBook }
      },
    ),
    updateBookData: create.reducer(
      (state, action: PayloadAction<AggregateMessageData[1]>) => {
        const [price, count, amount] = action.payload

        if (count > 0) {
          const data = { count, amount: Math.abs(amount) }

          if (amount > 0) {
            state.book.bids[price] = data
          } else if (amount < 0) {
            state.book.asks[price] = data
          }
        } else if (count === 0) {
          if (amount === 1) {
            delete state.book.bids[price]
          } else if (amount === -1) {
            delete state.book.asks[price]
          }
        }
      },
    ),
  }),
  selectors: {
    selectPrecision: state => state.precision,
    selectBook: state => state.book,
    selectStatus: state => state.status,
  },
})

export const { updatePrecision, updateStatus, setBookData, updateBookData } =
  orderBookSlice.actions

export const { selectPrecision, selectBook, selectStatus } =
  orderBookSlice.selectors
