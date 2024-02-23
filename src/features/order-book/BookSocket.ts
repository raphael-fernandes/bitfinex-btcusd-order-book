import { Socket } from "../../utils/Socket"

// @see {@link https://docs.bitfinex.com/reference/ws-public-books} for Bitfinex Book WS API reference
export const pricePrecisionLevels = ["P4", "P3", "P2", "P1", "P0"]
export const defaultRequestFields: WebSocketSubscribeMessage = {
  prec: "P3",
  event: "subscribe",
  channel: "book",
  symbol: "tBTCUSD",
  freq: "F0",
  len: "25",
}

export type WebSocketSubscribeMessage = {
  event: "subscribe"
  channel: "book"
  symbol: "tBTCUSD"
  prec: "P4" | "P3" | "P2" | "P1" | "P0"
  freq?: "F0" | "F1"
  len?: "1" | "25" | "100" | "250"
  subId?: string
}

type OnMessageCallback = (evt: BookMessageData) => void

type BookPayload = [number, number, number]

export type SnapshotMessageData = [number, BookPayload[]]

export type AggregateMessageData = [number, BookPayload]

interface BookMessage extends MessageEvent {
  type: string
  data: string
}

export interface ErrorMessageData extends MessageEvent {
  event: "error"
  code: number
  msg: string
}

export type BookMessageData = BookMessage | ErrorMessageData

class BookSocket extends Socket {
  connect() {
    super.connect("wss://api-pub.bitfinex.com/ws/2")
  }

  subscribe(precision: string) {
    if (this.socket?.readyState !== 1) {
      throw Error(
        `Websocket readyState ${this.socket?.readyState} can't subscribe`,
      )
    }

    if (!pricePrecisionLevels.includes(precision)) {
      throw Error(`Price precision "${precision}" is not valid`)
    }

    const payload: WebSocketSubscribeMessage = {
      ...defaultRequestFields,
      prec: precision as WebSocketSubscribeMessage["prec"],
    }
    super.send(payload)
  }

  onMessage(callback: OnMessageCallback) {
    super.onMessage(callback)
  }
}

export { BookSocket }
