import {
  INR_BALANCES_TYPE,
  ORDER_BOOK_TYPE,
  STOCK_BALANCES_TYPE,
} from "../interfaces/globals";

export const INR_BALANCES: INR_BALANCES_TYPE = {};

export const STOCK_BALANCES: STOCK_BALANCES_TYPE = {
  1: {
    BTC_USDT_10_Oct_2024_9_30: {
      no: {
        quantity: 3,
        locked: 4,
      },
    },
  },
  2: {
    BTC_USDT_10_Oct_2024_9_30: {
      no: {
        quantity: 3,
        locked: 4,
      },
    },
  },
};

export const ORDERBOOK: ORDER_BOOK_TYPE = {
  BTC_USDT_10_Oct_2024_9_30: {
    yes: {
      "9.5": {
        total: 12,
        orders: {
          user1: 2,
          user2: 10,
        },
      },
      "8.5": {
        total: 12,
        orders: {
          user1: 3,
          user2: 3,
          user3: 6,
        },
      },
    },
    no: {},
  },
};
