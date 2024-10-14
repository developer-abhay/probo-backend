export interface INR_BALANCES_TYPE {
  [userId: string]: {
    balance: number;
    locked: number;
  };
}

export interface STOCK_BALANCES_TYPE {
  [userId: string]: {
    [stockSymbol: string]: {
      yes?: {
        quantity: number;
        locked: number;
      };
      no?: {
        quantity: number;
        locked: number;
      };
    };
  };
}

export type ORDERDATA = {
  [price: number]: {
    total: number;
    orders: {
      [userId: string]: number;
    };
  };
};

export interface ORDER_BOOK_TYPE {
  [stockSymbol: string]: {
    yes: ORDERDATA;
    no: ORDERDATA;
  };
}
