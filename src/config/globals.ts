import {
  INR_BALANCES_TYPE,
  ORDER_BOOK_TYPE,
  STOCK_BALANCES_TYPE,
} from "../interfaces/globals";

export const INR_BALANCES: INR_BALANCES_TYPE = {
  user2: {
    balance: 1000000,
    locked: 0,
  },
  user1: {
    balance: 0,
    locked: 0,
  },
};

export const STOCK_BALANCES: STOCK_BALANCES_TYPE = {
  user2: {},
  user1: {
    ETH_USD_15_Oct_2024_12_00: {
      yes: {
        quantity: 943,
        locked: 57,
      },
      no: {
        quantity: 1000,
        locked: 0,
      },
    },
  },
};

export let ORDERBOOK: ORDER_BOOK_TYPE = {
  ETH_USD_15_Oct_2024_12_00: {
    yes: {
      "140": {
        total: 20,
        orders: {
          user1: 20,
        },
      },
      "150": {
        total: 20,
        orders: {
          user1: 20,
        },
      },
    },
    no: {},
  },
};
