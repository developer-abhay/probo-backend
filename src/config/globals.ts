import {
  INR_BALANCES_TYPE,
  ORDER_BOOK_TYPE,
  STOCK_BALANCES_TYPE,
} from "../interfaces/globals";

export const INR_BALANCES: INR_BALANCES_TYPE = {
  user1: {
    balance: 1605000,
    locked: 395000,
  },
  user2: {
    balance: 9550,
    locked: 450,
  },
  user3: {
    balance: 100000,
    locked: 0,
  },
};

export const STOCK_BALANCES: STOCK_BALANCES_TYPE = {
  user1: {
    ETH_USD_15_Oct_2024_12_00: {
      yes: {
        quantity: 9,
        locked: 21,
      },
      no: {
        quantity: 0,
        locked: 0,
      },
    },
  },
  user2: {
    ETH_USD_15_Oct_2024_12_00: {
      yes: {
        quantity: 3,
        locked: 2,
      },
      no: {
        quantity: 0,
        locked: 0,
      },
    },
  },
  user3: {},
};

export let ORDERBOOK: ORDER_BOOK_TYPE = {
  ETH_USD_15_Oct_2024_12_00: {
    yes: [
      {
        price: 9.0,
        total: 7,
        orders: {
          user1: [
            { id: 1, quantity: 5, type: "exit" },
            { id: 2, quantity: 2, type: "buy" },
          ],
        },
      },
      {
        price: 8.5,
        total: 15,
        orders: {
          user1: [
            { id: 3, quantity: 3, type: "exit" },
            { id: 4, quantity: 8, type: "buy" },
            { id: 5, quantity: 7, type: "exit" },
          ],
        },
      },
      {
        price: 8.0,
        total: 20,
        orders: {
          user1: [
            { id: 6, quantity: 6, type: "exit" },
            { id: 7, quantity: 9, type: "buy" },
          ],
          user2: [
            { id: 8, quantity: 2, type: "exit" },
            { id: 9, quantity: 3, type: "buy" },
          ],
          user3: [
            { id: 10, quantity: 4, type: "exit" },
            { id: 11, quantity: 13, type: "buy" },
          ],
        },
      },
    ],
    no: [
      {
        price: 4.0,
        total: 10,
        orders: {
          user1: [
            { id: 10, quantity: 5, type: "exit" },
            { id: 11, quantity: 2, type: "buy" },
          ],
        },
      },
      // {
      //   price: 1.5,
      //   total: 10,
      //   orders: {
      //     user1: [
      //       { id: 12, quantity: 5, type: "exit" },
      //       { id: 13, quantity: 2, type: "buy" },
      //     ],
      //   },
      // },
      {
        price: 0.5,
        total: 10,
        orders: {
          user1: [
            { id: 14, quantity: 5, type: "exit" },
            { id: 15, quantity: 2, type: "buy" },
          ],
        },
      },
    ],
  },
};
