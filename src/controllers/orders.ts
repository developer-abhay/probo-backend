import { Request, Response } from "express";
import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from "../config/globals";
import { ORDER_REQUEST } from "../interfaces/requestModels";
import { priceRange } from "../interfaces/globals";

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
  res.send(ORDERBOOK[stockSymbol]);
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
  const userBalance = INR_BALANCES[userId].balance / 100;

  if (requiredBalance > userBalance) {
    res.status(400).send({ message: "Insufficient INR balance" });
    return;
  }

  // Sort and Filter the orderbook for less than or equal to price
  const buyOrderArray = ORDERBOOK[stockSymbol][stockType]
    .sort((a, b) => a.price - b.price)
    .filter((item) => item.price <= price && item.total != 0);

  // Check for total available quantity of all stocks that can match
  let availableQuantity = buyOrderArray.reduce(
    (acc, item) => acc + item.total,
    0
  );

  // No stocks for sale -> Create a Pseudo Sell Order
  if (availableQuantity == 0) {
    initiateSellOrder(stockSymbol, stockType, price, quantity, userId, "buy");
    res.send({ message: "Bid Submitted" });
    return;
  }

  // ********** Matching Logic ************
  let requiredQuantity = quantity;

  // loop over yes/no orders -> one price at a time
  for (const buyOrder in buyOrderArray) {
    const orderPrice = Number(buyOrderArray[buyOrder].price) as priceRange;
    const orderObject = buyOrderArray[buyOrder].orders;

    // loop over all users in orders -> one user at a time
    for (const sellerId in orderObject) {
      requiredQuantity = matchOrder(
        stockSymbol,
        stockType,
        orderPrice,
        requiredQuantity,
        orderObject[sellerId],
        userId,
        sellerId
      );
      if (requiredQuantity == 0) {
        break;
      }
    }

    if (requiredQuantity == 0) {
      break;
    }

    availableQuantity = buyOrderArray.reduce(
      (acc, item) => acc + item.total,
      0
    );

    // Inititate a partial pseudo sell order for remaining quantities
    if (availableQuantity == 0) {
      initiateSellOrder(
        stockSymbol,
        stockType,
        price,
        requiredQuantity,
        userId,
        "buy"
      );
      break;
    }

    // Inititate a partial pseudo sell order for remaining quantities
    if (availableQuantity == 0) {
      initiateSellOrder(
        stockSymbol,
        stockType,
        price,
        requiredQuantity,
        userId,
        "buy"
      );
      break;
    }

    //       INR_BALANCES[user].balance += requiredQuantity * Number(orderPrice);
    //       INR_BALANCES[user].balance += orders[user] * price;
    //       INR_BALANCES[userId].balance -= availableAtBestPrice * Number(orderPrice); // all stocks of best price (less than required)

    //       STOCK_BALANCES[user][stockSymbol][stockType]!.locked -=
    //       STOCK_BALANCES[user][stockSymbol][stockType]!.locked -= orders[user];

    //       ordersAllPrices[orderPrice].total = 0;
    //       orders[user] -= requiredQuantity;
    //       requiredQuantity -= orders[user];
    //       orders[user] = 0;
  }

  res.status(200).send({
    message: `Buy order placed and trade executed`,
  });
};

// Sell Order
export const sellOrder = (req: Request, res: Response) => {
  // const { userId, stockSymbol } = req.body as ORDER_REQUEST;
  // const quantity = Number(req.body.quantity);
  // const price = Number(req.body.price);
  // const stockType = req.body.stockType as "yes" | "no";
  // const userExists = INR_BALANCES[userId];
  // const symbolExists = ORDERBOOK[stockSymbol];
  // if (!userExists) {
  //   res.send({ error: `User with user Id ${userId} does not exist` });
  //   return;
  // }
  // if (!symbolExists) {
  //   res.send({ error: `Stock with stockSymbol ${stockSymbol} does not exist` });
  //   return;
  // }
  // const stockAvailable = STOCK_BALANCES[userId][stockSymbol]; // Does user have this stock.
  // if (!stockAvailable) {
  //   res.send({ message: `You do not own any stock of ${stockSymbol}` });
  //   return;
  // }
  // const stockBalanceOfUser = Number(stockAvailable[stockType]?.quantity) || 0; // Quantity of stocks user own
  // const lockedStocksOfUser = Number(stockAvailable[stockType]?.locked) || 0; // Quantity of Locked stocks
  // if (quantity > stockBalanceOfUser) {
  //   res.status(400).send({ message: "Insufficient stock balance" });
  //   return;
  // }
  // const prevQuantityInOrderBook =
  //   Number(ORDERBOOK[stockSymbol][stockType]?.[price]?.total) || 0;
  // // Subtracting from user stock quantity and adding to locked stocks
  // stockAvailable[stockType] = {
  //   quantity: stockBalanceOfUser - quantity,
  //   locked: lockedStocksOfUser + quantity,
  // };
  // // Adding to order book
  // if (prevQuantityInOrderBook === 0) {
  //   const orderData = {
  //     total: quantity,
  //     orders: {
  //       [userId]: quantity,
  //     },
  //   };
  //   ORDERBOOK[stockSymbol][stockType][price] = orderData;
  // } else {
  //   ORDERBOOK[stockSymbol][stockType][price].total =
  //     prevQuantityInOrderBook + quantity;
  //   const prevUserStockCount =
  //     Number(ORDERBOOK[stockSymbol][stockType][price].orders[userId]) || 0;
  //   ORDERBOOK[stockSymbol][stockType][price].orders[userId] =
  //     prevUserStockCount + quantity;
  // }
  // res.status(200).send({
  //   message: `Sell order placed for ${quantity} '${stockType}' options at price ${price}.`,
  // });
};

// Cancel Order
export const cancelOrder = (req: Request, res: Response) => {
  const { userId, stockSymbol, price, orderId } = req.body;
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

  console.log(ORDERBOOK[stockSymbol][stockType]);

  res.send({ message: "Sell order canceled" });
};

const initiateSellOrder = (
  stockSymbol: string,
  stockType: string,
  price: number,
  quantity: number,
  userId: string,
  orderType: "buy" | "exit"
) => {
  let newPrice = (10 - price) as priceRange;
  let newType: "yes" | "no" = "yes";

  if (stockType == "yes") {
    newType = "no";
  }

  const sellOrderArray = ORDERBOOK[stockSymbol][newType];
  const sellOrder = sellOrderArray.find((item) => item.price == newPrice);

  if (sellOrder) {
    sellOrder.total += quantity;
    if (sellOrder.orders[userId]) {
      sellOrder.orders[userId].push({ id: 15, quantity, type: orderType });
    } else {
      sellOrder.orders[userId] = [{ id: 15, quantity, type: orderType }];
    }
  } else {
    sellOrderArray.push({
      price: newPrice,
      total: quantity,
      orders: {
        [userId]: [{ id: 10, quantity, type: orderType }],
      },
    });
  }
};

const matchOrder = (
  stockSymbol: string,
  stockType: string,
  orderPrice: number,
  requiredQuantity: number,
  orders: { id: number; quantity: number; type: "buy" | "exit" }[],
  buyerId: string,
  sellerId: string
) => {
  let remainingQuantity = requiredQuantity;

  // loop over all orders of a users
  for (const order in orders) {
    if (orders[order].quantity >= remainingQuantity) {
      orders[order].quantity -= remainingQuantity;
      remainingQuantity = 0;

      // Exchange Stocks and INR balances
      // Update OrderBook
      return remainingQuantity;
    } else {
      remainingQuantity -= orders[order].quantity;
      orders[order].quantity = 0;
      // Exchange Stocks and INR balances
      // Update OrderBook
    }
  }

  return remainingQuantity;
};

const swapInr = (sellerId: string, buyerId: string, price: number) => {};

const swapStocks = (
  sellId: string,
  buyerId: string,
  stockSymbol: string,
  stockType: string
) => {};

const mintStocks = (
  stockSymbol: string,
  user1: string,
  type1: string,
  price1: number,
  user2: string,
  type2: string,
  price2: number
) => {};
