import { Request, Response } from "express";
import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from "../config/globals";
import { ORDER_REQUEST } from "../interfaces/requestModels";

// Get order book
export const getOrderBook = (req: Request, res: Response) => {
  res.send(ORDERBOOK);
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
    res.status(400).send({ message: "Insufficient INR balance" });
    return;
  }

  const ordersAllPrices = ORDERBOOK[stockSymbol][stockType];

  // Check for total available quantity of all stocks
  let availableQuantity = 0;

  for (const orderPrice in ordersAllPrices) {
    if (Number(orderPrice) <= price && ordersAllPrices[orderPrice].total > 0) {
      availableQuantity += ordersAllPrices[orderPrice].total;
    }
  }

  if (quantity > availableQuantity) {
    // Create a sell order for the opposite stock type
    res.send({ message: "Insufficient Stocks in the market" });
    return;
  }

  // *******Add stock to user's Stock Balance*********
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

  // Main Matching Logic
  let requiredQuantity = quantity;
  for (const orderPrice in ordersAllPrices) {
    if (ordersAllPrices[orderPrice].total > requiredQuantity) {
      //Deduct User's INR Balance
      INR_BALANCES[userId].balance -= requiredQuantity * Number(orderPrice);

      // Deduct from total quantity of stocks
      ordersAllPrices[orderPrice].total -= requiredQuantity;

      // Deduct Stocks from orderbook
      const orders = ordersAllPrices[orderPrice].orders;

      for (const user in orders) {
        if (orders[user] >= requiredQuantity) {
          // Add money to sellers account
          INR_BALANCES[user].balance += requiredQuantity * Number(orderPrice);

          STOCK_BALANCES[user][stockSymbol][stockType]!.locked -=
            requiredQuantity;

          // Deduct stocks from orderbook
          orders[user] -= requiredQuantity;
          requiredQuantity = 0;
          break;
        } else if (orders[user] < requiredQuantity) {
          // Add money to sellers account
          INR_BALANCES[user].balance += orders[user] * price;
          STOCK_BALANCES[user][stockSymbol][stockType]!.locked -= orders[user];
          // Deduct stocks from orderbook
          requiredQuantity -= orders[user];
          orders[user] = 0;
        }
      }
      res.status(200).send({
        message: `Buy order matched at best price ${orderPrice}`,
      });
      return;
    }
    // Partial Matching
    else {
      let availableAtBestPrice = ordersAllPrices[orderPrice].total;
      requiredQuantity -= availableAtBestPrice;

      //Deduct User's INR Balance
      INR_BALANCES[userId].balance -= availableAtBestPrice * Number(orderPrice); // all stocks of best price (less than required)

      // Deduct from total quantity of stocks
      ordersAllPrices[orderPrice].total = 0;

      // Deduct Stocks from users in orderbook
      const orders = ordersAllPrices[orderPrice].orders;

      for (const user in orders) {
        if (orders[user] == availableAtBestPrice) {
          // Add money to sellers account
          INR_BALANCES[user].balance +=
            availableAtBestPrice * Number(orderPrice);

          STOCK_BALANCES[user][stockSymbol][stockType]!.locked -=
            availableAtBestPrice;

          // Deduct stocks from orderbook
          orders[user] -= availableAtBestPrice;

          availableAtBestPrice = 0;
          break;
        } else {
          // Add money to sellers account
          INR_BALANCES[user].balance += orders[user] * Number(orderPrice);
          STOCK_BALANCES[user][stockSymbol][stockType]!.locked -= orders[user];
          // Deduct stocks from orderbook
          availableAtBestPrice -= orders[user];
          orders[user] = 0;
        }
      }
    }
  }

  res.status(200).send({
    message: `Buy order placed and trade executed`,
  });
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
    res.status(400).send({ message: "Insufficient stock balance" });
    return;
  }

  const prevQuantityInOrderBook =
    Number(ORDERBOOK[stockSymbol][stockType]?.[price]?.total) || 0;

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
    ORDERBOOK[stockSymbol][stockType][price] = orderData;
  } else {
    ORDERBOOK[stockSymbol][stockType][price].total =
      prevQuantityInOrderBook + quantity;

    const prevUserStockCount =
      Number(ORDERBOOK[stockSymbol][stockType][price].orders[userId]) || 0;

    ORDERBOOK[stockSymbol][stockType][price].orders[userId] =
      prevUserStockCount + quantity;
  }

  res.status(200).send({
    message: `Sell order placed for ${quantity} '${stockType}' options at price ${price}.`,
  });
};

// Cancel Order
export const cancelOrder = (req: Request, res: Response) => {
  const { userId, stockSymbol, stockType } = req.body;
  const quantity = req.body.quantity;
  const price = req.body.price;

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

  res.send({ message: "Sell order canceled" });
};
