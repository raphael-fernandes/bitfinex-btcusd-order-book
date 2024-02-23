# Bitfinex Order Book Widget

## Overview

This web application replicates the Order Book widget functionality from the Trading page of the Bitfinex website. The main feature is the ability to change the precision of the price column. Unlike the Bitfinex website, this Order Book widget does not include price alerts management, scaling of the depth bars, or layout configuration features.

### General Requirements

- Conceptually the same as the corresponding widgets on the Bitfinex website.
- Real-time data display.
- Ability to recover after a lost network connection.
- WebSocket connection controls (e.g., "Connect" and "Disconnect" buttons).

### Tech Requirements

- Built with React for rendering.
- Utilizes Redux to store market data.
- Integrates Bitfinex WebSocket V2 API for obtaining data.

## Getting Started

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/bitfinex-order-book-widget.git
   cd bitfinex-order-book-widget
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

   The application will be accessible at `http://localhost:3000`.

## Links

- [Bitfinex original order book](https://www.bitfinex.com/): You can experience the Order Book functionality without creating an account by using the 'Try Demo' feature
- [Bitfinex WebSocket docs](https://docs.bitfinex.com/docs/ws-general)
- [Bitfinex WebSocket V2 Book API docs](https://docs.bitfinex.com/reference/ws-public-books)
