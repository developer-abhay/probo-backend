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

export interface QUEUE_DATA_ELEMENT {
  _id: string;
  endpoint: string;
  req: QUEUE_REQUEST;
}

export interface QUEUE_REQUEST {
  body: {
    userId?: string;
    amount?: number;
    stockSymbol?: string;
    quantity?: number;
    price?: number;
  };
  params: { userId?: string; stockSymbol?: string };
}
