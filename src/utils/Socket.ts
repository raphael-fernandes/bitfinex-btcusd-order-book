type WebSocketEventName = "close" | "error" | "message" | "open"

class Socket {
  socket: WebSocket | null

  constructor() {
    this.socket = null
  }

  connect(url: string) {
    if (this.socket) return

    this.socket = new WebSocket(url)
  }

  disconnect() {
    if (!this.socket) return

    this.socket.close()
    this.socket = null
  }

  send(message: Object) {
    if (this.socket?.readyState !== 1) {
      throw Error(
        `Websocket is not ready to send. State: ${this.socket?.readyState}`,
      )
    }

    this.socket.send(JSON.stringify(message))
  }

  on(
    eventName: WebSocketEventName,
    callback: EventListenerOrEventListenerObject,
  ) {
    if (!this.socket) return
    this.socket.addEventListener(eventName, callback)
  }

  onMessage(callback: (evt: MessageEvent<any>) => any) {
    if (!this.socket) return
    this.on("message", callback)
  }

  onClose(callback: (evt: CloseEvent) => any) {
    if (!this.socket) return
    this.on("close", callback)
  }
}

export { Socket }
