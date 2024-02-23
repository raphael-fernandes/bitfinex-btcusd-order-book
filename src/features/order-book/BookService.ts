import type { Dispatch, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import type {
  AggregateMessageData,
  BookMessageData,
  ErrorMessageData,
  SnapshotMessageData,
} from "./BookSocket"
import type { OrderBookSliceState } from "./orderBookSlice"
import { BookSocket } from "./BookSocket"
import {
  initialState,
  setBookData,
  updateBookData,
  updatePrecision,
  updateStatus,
} from "./orderBookSlice"

export const initWebSocketConnection = (
  dispatch: ThunkDispatch<
    {
      book: OrderBookSliceState
    },
    undefined,
    UnknownAction
  > &
    Dispatch<UnknownAction>,
  precision?: string,
) => {
  let setNewData = true
  const socket = new BookSocket()

  socket.connect()

  socket.on("open", () => {
    setNewData = true
    const prec = precision ?? initialState.precision
    socket.subscribe(prec)
    dispatch(updatePrecision(prec))
    dispatch(updateStatus({ connected: true, reconnecting: false }))
  })

  socket.onMessage((evt: BookMessageData) => {
    const data = JSON.parse(evt.data)
    const payload = Array.isArray(data) && data[1]

    if (data.event === "error") {
      const { msg, code } = data as ErrorMessageData
      console.error(`[EXCHANGE ERROR] (${code}) ${msg}`)
      return
    }

    if (payload) {
      // @see {@link https://docs.bitfinex.com/docs/ws-general#heartbeating } for Bitfinex WS heartbeat reference
      if (payload === "hb") return

      if (setNewData) {
        dispatch(setBookData(payload as SnapshotMessageData[1]))
        setNewData = false
      } else {
        dispatch(updateBookData(payload as AggregateMessageData[1]))
      }
    }
  })

  socket.on("error", function (error) {
    console.error(error)
  })

  socket.onClose((evt: CloseEvent): void => {
    dispatch(updateStatus({ connected: false }))
    setNewData = true

    if (!evt.wasClean) {
      setTimeout(() => {
        initWebSocketConnection(dispatch)
        dispatch(updateStatus({ reconnecting: true }))
      }, 2000)
    }
  })

  return socket
}
