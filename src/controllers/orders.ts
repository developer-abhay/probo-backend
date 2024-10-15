import { Request, Response } from "express";
import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from "../config/globals";
import { ORDER_REQUEST } from "../interfaces/requestModels";

// Get order book
export const getOrderBook = (req: Request, res: Response) => {
  res.send({ data: ORDERBOOK });
};

// View Buy and Sell Orders
export const viewOrders = (req: Request, res: Response) => {
  const stockSymbol: string = req.params.stockSymbol;

  const symbolExists = ORDERBOOK[stockSymbol];
  if (!symbolExists) {
    res.send({ error: `Stock with stockSymbol ${stockSymbol} does not exist` });
    return;
  }
  res.send({ data: ORDERBOOK[stockSymbol] });
};

// Buy Order
export const buyOrder = (req: Request, res: Response) => {
  const { userId, stockSymbol } = req.body as ORDER_REQUEST;
  const quantity = Number(req.body.quantity);
  const price = Number(req.body.price);
  const stockType = req.body.stockType as "yes" | "no";

  const userExists = INR_BALANCES[userId];
  const symbolExists = ORDERBOOK[stockSymbol];

  if (!userExists) {
    res.send({ error: `User with user Id ${userId} does not exist` });
    return;
  }
  if (!symbolExists) {
    res.send({ error: `Stock with stockSymbol ${stockSymbol} does not exist` });
    return;
  }

  const requiredBalance = quantity * price;
  const userBalance = INR_BALANCES[userId].balance;

  if (requiredBalance > userBalance) {
    res.send({ message: "Insufficient INR Balance" });
    return;
  }

  const priceInRupee = price / 100;

  const availableQuantity =
    ORDERBOOK[stockSymbol][stockType][priceInRupee]?.total || 0;

  if (quantity > availableQuantity) {
    // Create a sell order for the opposite stock type
    res.send({ message: "Insufficient Stocks in the market" });
    return;
  }

  // Deduct User's INR Balance
  INR_BALANCES[userId].balance -= quantity * price;

  // Deduct Stocks from orderbook
  ORDERBOOK[stockSymbol][stockType][priceInRupee].total =
    availableQuantity - quantity;

  const orders = ORDERBOOK[stockSymbol][stockType][priceInRupee].orders;
  let requiredQuantity = quantity;
  for (const order in orders) {
    if (orders[order] >= requiredQuantity) {
      orders[order] -= requiredQuantity;
      requiredQuantity = 0;
      break;
    } else if (orders[order] < requiredQuantity) {
      requiredQuantity -= orders[order];
      orders[order] = 0;
    }
  }

  // Add stock to user's Stock Balance
  const stockAvailable = STOCK_BALANCES[userId][stockSymbol]; // Does user already have this stock.
  if (stockAvailable) {
    stockAvailable[stockType] = {
      quantity: (stockAvailable[stockType]?.quantity || 0) + quantity,
      locked: stockAvailable[stockType]?.locked || 0,
    };
  } else {
    STOCK_BALANCES[userId][stockSymbol] = {
      [stockType]: {
        quantity,
        locked: 0,
      },
    };
  }
  res.send({ message: "Order placed successfully" });
};

// Sell Order
export const sellOrder = (req: Request, res: Response) => {
  const { userId, stockSymbol } = req.body as ORDER_REQUEST;
  const quantity = Number(req.body.quantity);
  const price = Number(req.body.price);
  const stockType = req.body.stockType as "yes" | "no";

  const userExists = INR_BALANCES[userId];
  const symbolExists = ORDERBOOK[stockSymbol];

  if (!userExists) {
    res.send({ error: `User with user Id ${userId} does not exist` });
    return;
  }
  if (!symbolExists) {
    res.send({ error: `Stock with stockSymbol ${stockSymbol} does not exist` });
    return;
  }

  const stockAvailable = STOCK_BALANCES[userId][stockSymbol]; // Does user have this stock.

  if (!stockAvailable) {
    res.send({ message: `You do not own any stock of ${stockSymbol}` });
    return;
  }

  const stockBalanceOfUser = Number(stockAvailable[stockType]?.quantity) || 0; // Quantity of stocks user own
  const lockedStocksOfUser = Number(stockAvailable[stockType]?.locked) || 0; // Quantity of Locked stocks

  if (quantity > stockBalanceOfUser) {
    res.send({ message: "Insufficient Stocks" });
    return;
  }

  const priceInRupee = price / 100;
  const prevQuantityInOrderBook =
    Number(ORDERBOOK[stockSymbol][stockType]?.[priceInRupee]?.total) || 0;

  // Subtracting from user stock quantity and adding to locked stocks
  stockAvailable[stockType] = {
    quantity: stockBalanceOfUser - quantity,
    locked: lockedStocksOfUser + quantity,
  };

  // Adding to order book
  if (prevQuantityInOrderBook === 0) {
    const orderData = {
      total: quantity,
      orders: {
        [userId]: quantity,
      },
    };
    ORDERBOOK[stockSymbol][stockType][priceInRupee] = orderData;
  } else {
    ORDERBOOK[stockSymbol][stockType][priceInRupee].total =
      prevQuantityInOrderBook + quantity;

    const prevUserStockCount =
      Number(ORDERBOOK[stockSymbol][stockType][priceInRupee].orders[userId]) ||
      0;

    ORDERBOOK[stockSymbol][stockType][priceInRupee].orders[userId] =
      prevUserStockCount + quantity;
  }

  res.send({ message: "Order placed successfully" });
};
