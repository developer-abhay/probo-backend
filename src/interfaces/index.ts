export interface INR_BALANCE {
  [key: string]: {
    balance: number;
    locked: number;
  };
}

export interface STOCK_BALANCE {
  [key: string]: {
    [key: string]: {
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

export interface ON_RAMP_REQUEST {
  userId: string;
  amount: number;
}

export interface YES_ORDER_REQUEST {
  userId: string;
  stockSymbol: string;
  quantity: number;
  price: number;
}
