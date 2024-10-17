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

export type priceRange =
  | 0
  | 0.5
  | 1
  | 1.5
  | 2
  | 2.5
  | 3
  | 3.5
  | 4
  | 4.5
  | 5
  | 5.5
  | 6
  | 6.5
  | 7
  | 7.5
  | 8
  | 8.5
  | 9
  | 9.5
  | 10;

export type ORDERDATA = {
  price: priceRange;
  total: number;
  orders: {
    [userId: string]: {
      id: number;
      quantity: number;
      type: "buy" | "exit";
    }[];
  };
};

export interface ORDER_BOOK_TYPE {
  [stockSymbol: string]: { yes: ORDERDATA[]; no: ORDERDATA[] };
}
