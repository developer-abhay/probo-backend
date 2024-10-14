export interface ON_RAMP_REQUEST {
  userId: string;
  amount: number;
}

export interface ORDER_REQUEST {
  userId: string;
  stockSymbol: string;
  quantity: number;
  price: number;
  stockType: string;
}

export interface MINT_REQUEST {
  userId: string;
  stockSymbol: string;
  quantity: number;
}
