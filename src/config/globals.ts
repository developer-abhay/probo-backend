import {
  INR_BALANCES_TYPE,
  ORDER_BOOK_TYPE,
  STOCK_BALANCES_TYPE,
} from "../interfaces/globals";

export const INR_BALANCES: INR_BALANCES_TYPE = {
  user3: {
    balance: 100000,
    locked: 0,
  },
  user2: {
    balance: 10000,
    locked: 0,
  },
  user1: {
    balance: 100000,
    locked: 0,
  },
};

export const STOCK_BALANCES: STOCK_BALANCES_TYPE = {
  user3: {},
  user2: {},
  user1: {},
};

export let ORDERBOOK: ORDER_BOOK_TYPE = {
  eth: {
    yes: new Map(),
    no: new Map(),
  },
  bit: {
    yes: new Map(),
    no: new Map(),
  },
};
