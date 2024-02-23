import { useEffect, useId, useRef, useState } from "react"
// @ts-ignore
import cx from "classname"
import type { OrderBookSliceState } from "./orderBookSlice"
import type { BookSocket } from "./BookSocket"
import type { ThunkDispatch } from "redux-thunk"
import type { Dispatch, UnknownAction } from "@reduxjs/toolkit"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectBook, selectPrecision, selectStatus } from "./orderBookSlice"
import { initWebSocketConnection } from "./BookService"
import { setLocale, sortArrayAsc, sortArrayDesc } from "./utils"
import { pricePrecisionLevels } from "./BookSocket"
import styles from "./OrderBook.module.css"

type BookOrderTypes = "asks" | "bids"

const OrderBookComponent = () => {
  const titleId = useId()
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(true)
  const socketRef = useRef<null | BookSocket>(null)
  const book = useAppSelector(selectBook)
  const precision = useAppSelector(selectPrecision)
  const status = useAppSelector(selectStatus)
  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }
  const reconnectSocket = (
    dispatch: ThunkDispatch<
      {
        book: OrderBookSliceState
      },
      undefined,
      UnknownAction
    > &
      Dispatch<UnknownAction>,
    precision?: (typeof pricePrecisionLevels)[number],
  ) => {
    disconnectSocket()
    setLoading(true)
    socketRef.current = initWebSocketConnection(dispatch, precision)
  }

  const handlePrecisionChange = (increment: number) => {
    const currentIndex = pricePrecisionLevels.indexOf(precision)
    const newIndex = Math.max(
      0,
      Math.min(pricePrecisionLevels.length - 1, currentIndex + increment),
    )
    const newPrecision = pricePrecisionLevels[newIndex]

    if (socketRef.current) {
      reconnectSocket(dispatch, newPrecision)
    }
  }

  useEffect(() => {
    socketRef.current = initWebSocketConnection(dispatch)

    return () => {
      disconnectSocket()
    }
  }, [dispatch])

  useEffect(() => {
    if (Object.keys(book.bids).length || Object.keys(book.asks).length) {
      setLoading(false)
    }
  }, [book])

  const titleMap = { asks: "Ask", bids: "Bid" }

  const renderHeaders = (type: BookOrderTypes) => {
    const title = titleMap[type]
    const headersText = ["Count", "Amount", "Price"]
    const headersDisplayed =
      type === "asks" ? headersText.toReversed() : headersText
    const titleColSpan = headersText.length

    return (
      <>
        <div
          className={cx([
            styles.colHeaderTitle,
            styles[`colHeaderTitle${title}`],
          ])}
          role="columnheader"
          aria-colspan={titleColSpan}
        >
          {title}
        </div>
        <div className={cx([styles.row])} role="row">
          {headersDisplayed.map(text => (
            <div
              className={cx([
                styles.colHeaderCell,
                styles[`colHeaderCell${title}`],
              ])}
              role="columnheader"
              key={text}
            >
              {text}
            </div>
          ))}
        </div>
      </>
    )
  }

  const renderPriceRows = (type: BookOrderTypes) => {
    const title = titleMap[type]
    const bidsTextOrderMap = (price: number) => [
      book[type][price].count,
      setLocale(book[type][price].amount),
      setLocale(price, false),
    ]
    const keys = Object.keys(book[type]).map(price => Number(price))

    const prices = type === "bids" ? sortArrayDesc(keys) : sortArrayAsc(keys)

    return prices.map(price => {
      const dataColumns =
        type === "bids"
          ? bidsTextOrderMap(price)
          : bidsTextOrderMap(price).reverse()

      return (
        <div
          className={cx([styles.row])}
          role="row"
          aria-live="polite"
          key={price}
        >
          <div
            className={cx([styles.cells, styles[`cells${title}`]])}
            role="cell"
          >
            {dataColumns[0]}
          </div>
          <div
            className={cx([styles.cells, styles[`cells${title}`]])}
            role="cell"
          >
            {dataColumns[1]}
          </div>
          <div
            className={cx([styles.cells, styles[`cells${title}`]])}
            role="cell"
          >
            {dataColumns[2]}
          </div>
        </div>
      )
    })
  }

  const renderBookPrices = () => {
    return (
      <>
        <div
          className={styles.table}
          role="table"
          aria-describedby={titleId}
          aria-label="Bid book"
        >
          <div className={styles.colRowGroup} role="rowgroup">
            {renderHeaders("bids")}
          </div>
          <div className={styles.colRowGroup} role="rowgroup">
            {renderPriceRows("bids")}
          </div>
        </div>
        <div
          className={styles.table}
          role="table"
          aria-describedby={titleId}
          aria-label="Ask book"
        >
          <div className={styles.colRowGroup} role="rowgroup">
            {renderHeaders("asks")}
          </div>
          <div className={styles.colRowGroup} role="rowgroup">
            {renderPriceRows("asks")}
          </div>
        </div>
      </>
    )
  }

  const renderContent = () => {
    if (loading) {
      return <div className={styles.status}>Loading</div>
    }

    return renderBookPrices()
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <p id={titleId}>
              Bitfinex Order Book{" "}
              <span className={styles.headerTitleCurrency}>BTC/USD</span>
            </p>
          </div>
          <div className={styles.headerControls}>
            <button
              className={cx([styles.headerPrecBtn])}
              onClick={() => handlePrecisionChange(-1)}
              disabled={precision === "P4" || !status.connected}
              aria-label="Decrease price precision"
              title="Decrease price precision"
            >
              .0 <div>&larr;</div>
            </button>
            <button
              className={cx([styles.headerPrecBtn])}
              onClick={() => handlePrecisionChange(1)}
              disabled={precision === "P0" || !status.connected}
              aria-label="Increase price precision"
              title="Increase price precision"
            >
              .00 <div>&rarr;</div>
            </button>
            <div aria-live="polite">
              {status.reconnecting && (
                <p className={styles.reconnecting}>Reconnecting</p>
              )}
              {!status.connected && !status.reconnecting && (
                <button onClick={() => reconnectSocket(dispatch)}>
                  Reconnect
                </button>
              )}
              {status.connected && !status.reconnecting && (
                <button onClick={disconnectSocket}>Disconnect</button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.content} aria-live="polite">
        {renderContent()}
      </div>
    </div>
  )
}

export default OrderBookComponent
