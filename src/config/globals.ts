import {
  INR_BALANCES_TYPE,
  ORDER_BOOK_TYPE,
  STOCK_BALANCES_TYPE,
} from "../interfaces/globals";

export const INR_BALANCES: INR_BALANCES_TYPE = {
  user1: {
    balance: 100000,
    locked: 0,
  },
  user2: {
    balance: 100000,
    locked: 0,
  },
  user3: {
    balance: 100000,
    locked: 0,
  },
  user4: {
    balance: 100000,
    locked: 0,
  },
  userr5: {
    balance: 100000,
    locked: 0,
  },
};

export const STOCK_BALANCES: STOCK_BALANCES_TYPE = {
  user1: {
    ETH_USD_15_Oct_2024_12_00: {
      yes: {
        quantity: 0,
        locked: 0,
      },
      no: {
        quantity: 0,
        locked: 0,
      },
    },
  },
  user2: {
    ETH_USD_15_Oct_2024_12_00: {
      no: {
        quantity: 0,
        locked: 0,
      },
    },
  },
  user3: {
    ETH_USD_15_Oct_2024_12_00: {
      yes: {
        quantity: 0,
        locked: 0,
      },
    },
  },
};

export let ORDERBOOK: ORDER_BOOK_TYPE = {
  ETH_USD_15_Oct_2024_12_00: {
    yes: [
      {
        price: 9.0,
        total: 110,
        orders: {
          user1: [
            { id: 123432213, quantity: 20, type: "buy" },
            { id: 123243213, quantity: 20, type: "sell" },
            { id: 123211113, quantity: 20, type: "sell" },
          ],
          user2: [
            { id: 123213222, quantity: 10, type: "sell" },
            { id: 123211213, quantity: 25, type: "sell" },
            { id: 123213334, quantity: 15, type: "sell" },
          ],
        },
      },
      {
        price: 8.0,
        total: 20,
        orders: {
          user1: [{ id: 123234321, quantity: 20, type: "sell" }],
        },
      },
    ],
    no: [],
  },
};
