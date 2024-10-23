import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from "../config/globals";
import { ORDER_REQUEST, QUEUE_REQUEST } from "../interfaces/requestModels";
import { ORDERDATA, priceRange } from "../interfaces/globals";
import { publishOrderbook } from "../services/redis";
import { v4 as uuidv4 } from "uuid";

// Get order book
export const getOrderBook = (req: QUEUE_REQUEST) => {
  const formattedOrderbook = Object.fromEntries(
    Object.entries(ORDERBOOK).map(([key, object]) => {
      const yes = Object.fromEntries(Array.from(object.yes));
      const no = Object.fromEntries(Array.from(object.no));
      return [key, { yes, no }];
    })
  );

  return { statusCode: 200, data: formattedOrderbook };
};

// View Buy and Sell Orders
export const viewOrders = (req: QUEUE_REQUEST) => {
  const stockSymbol = req.params.stockSymbol as string;

  const symbolExists = ORDERBOOK[stockSymbol];
  if (!symbolExists) {
    return {
      statusCode: 200,
      data: { error: `Stock with stockSymbol ${stockSymbol} does not exist` },
    };
  }
  return { statusCode: 200, data: ORDERBOOK[stockSymbol] };
};

// Buy Order
export const buyOrder = (req: QUEUE_REQUEST) => {
  const { userId, stockSymbol } = req.body as ORDER_REQUEST;
  const quantity = Number(req.body.quantity);
  const price: priceRange = Number(req.body.price) as priceRange;
  const stockType = req.body.stockType as "yes" | "no";

  const userExists = INR_BALANCES[userId];
  const symbolExists = ORDERBOOK[stockSymbol];

  if (!userExists) {
    return {
      statusCode: 400,
      data: { error: `User with user Id ${userId} does not exist` },
    };
  }
  if (!symbolExists) {
    return {
      statusCode: 400,
      data: { error: `Stock with stockSymbol ${stockSymbol} does not exist` },
    };
  }

  const requiredBalance = quantity * price;
  const userBalance = INR_BALANCES[userId].balance / 100;

  if (requiredBalance > userBalance) {
    return { statusCode: 400, data: { message: "Insufficient INR balance" } };
  }

  // Sort and Filter the orderbook for less than or equal to price
  // const filteredByPrice = ORDERBOOK[stockSymbol][stockType]
  //   .sort((a, b) => a.price - b.price)
  //   .filter((item) => item.price <= price && item.total != 0);
  const filteredByPrice = new Map(
    Array.from(ORDERBOOK[stockSymbol][stockType]).filter(
      ([key, value]) => key <= price && value.total != 0
    )
  );

  const buyOrderArray = Array.from(filteredByPrice).map(([price, item]) => {
    const orders = item.orders.filter((order) => order.userId !== userId);
    const total = orders.reduce((acc, value) => {
      return acc + value.quantity;
    }, 0);
    return { price, total, orders };
  });

  // Check for total available quantity of all stocks that can match
  let availableQuantity = buyOrderArray.reduce(
    (acc, item) => acc + item.total,
    0
  );

  // No stocks for sale -> Create a Pseudo Sell Order
  if (availableQuantity == 0) {
    initiateSellOrder(stockSymbol, stockType, price, quantity, userId, "buy");
    return { statusCode: 200, data: { message: "Bid Submitted" } };
  }

  // ********** Matching Logic ************
  let requiredQuantity = quantity;

  // loop over yes/no orders -> one price at a time
  for (const buyOrder in buyOrderArray) {
    const orderPrice = Number(buyOrderArray[buyOrder].price) as priceRange;

    requiredQuantity = matchOrder(
      stockSymbol,
      stockType,
      orderPrice,
      requiredQuantity,
      buyOrderArray[buyOrder],
      userId,
      "buy"
    );

    // If total quantity at a price is zero delete it from the order book
    if (
      ORDERBOOK[stockSymbol][stockType].get(orderPrice) &&
      ORDERBOOK[stockSymbol][stockType].get(orderPrice)!.total == 0
    ) {
      ORDERBOOK[stockSymbol][stockType].delete(orderPrice);
    }

    // Publish to all subscribers
    publishOrderbook(stockSymbol);

    if (requiredQuantity == 0) {
      break;
    }

    availableQuantity = buyOrderArray.reduce(
      (acc, item) => acc + item.total,
      0
    );
    console.log();
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
  }

  return {
    statusCode: 200,
    data: {
      message: `Buy order placed and trade executed`,
    },
  };
};

// Sell Order
export const sellOrder = (req: QUEUE_REQUEST) => {
  const { userId, stockSymbol } = req.body as ORDER_REQUEST;
  const quantity = Number(req.body.quantity);
  const price = Number(req.body.price) as priceRange;
  const stockType = req.body.stockType as "yes" | "no";

  const userExists = INR_BALANCES[userId];
  const symbolExists = ORDERBOOK[stockSymbol];

  if (!userExists) {
    return {
      statusCode: 400,
      data: { error: `User with user Id ${userId} does not exist` },
    };
  }
  if (!symbolExists) {
    return {
      statusCode: 400,
      data: { error: `Stock with stockSymbol ${stockSymbol} does not exist` },
    };
  }

  const stockAvailable = STOCK_BALANCES[userId][stockSymbol]; // Does user have this stock.
  if (!stockAvailable) {
    return {
      statusCode: 400,
      data: { message: `You do not own any stock of ${stockSymbol}` },
    };
  }

  const stockBalanceOfUser = Number(stockAvailable[stockType]?.quantity) || 0; // Quantity of stocks user own

  if (quantity > stockBalanceOfUser) {
    return { statusCode: 400, data: { message: "Insufficient stock balance" } };
  }

  // Checking for any buy orders (pseudo sell in opposite stock type)
  let pseudoType: "yes" | "no" = "yes";
  let pseudoPrice: priceRange = Number(10 - price) as priceRange;
  if (stockType == "yes") {
    pseudoType = "no";
  }

  // const sellOrderObject = ORDERBOOK[stockSymbol][pseudoType].find(
  // (item) => item.price == pseudoPrice
  // );
  const sellOrderObject = ORDERBOOK[stockSymbol][pseudoType].get(pseudoPrice);

  let totalAvailableQuantity: number = 0;

  if (sellOrderObject) {
    totalAvailableQuantity = sellOrderObject.orders.reduce((acc, item) => {
      if (item.type == "buy") {
        return (acc += item.quantity);
      } else {
        return acc;
      }
    }, 0);
  }

  if (totalAvailableQuantity == 0) {
    initiateSellOrder(stockSymbol, stockType, price, quantity, userId, "exit");

    return {
      statusCode: 200,
      data: {
        message: `Sell order placed for ${quantity} '${stockType}' options at price ${price}.`,
      },
    };
  }

  // Matching Sell Orders with Buy orders (pseudo Sell)
  let sellingQuantity = quantity;

  if (totalAvailableQuantity >= quantity) {
    sellingQuantity = matchOrder(
      stockSymbol,
      stockType,
      price,
      sellingQuantity,
      sellOrderObject!,
      userId,
      "sell"
    );
    publishOrderbook(stockSymbol); // Publish to all subscribers
    return {
      statusCode: 200,
      data: { message: "Sell order filled completely" },
    };
  }

  // Sell Order with partial Matching
  sellingQuantity = matchOrder(
    stockSymbol,
    stockType,
    price,
    sellingQuantity,
    sellOrderObject!,
    userId,
    "sell"
  );
  publishOrderbook(stockSymbol); // Publish to all subscribers
  return {
    statusCode: 200,
    data: { message: "Sell order partially filled and rest are initiated" },
  };
};

// Cancel Order
export const cancelOrder = (req: QUEUE_REQUEST) => {
  // const { userId, stockSymbol, price, orderId } = req.body;
  const { userId, stockSymbol, price } = req.body;
  const stockType = req.body.stockType as "yes" | "no";
  const userExists = INR_BALANCES?.userId;
  const symbolExists = ORDERBOOK?.stockSymbol;

  if (!userExists) {
    return {
      statusCode: 400,
      data: { error: `User with user Id ${userId} does not exist` },
    };
  }
  if (!symbolExists) {
    return {
      statusCode: 400,
      data: { error: `Stock with stockSymbol ${stockSymbol} does not exist` },
    };
  }

  // console.log(ORDERBOOK[stockSymbol][stockType]);

  return { statusCode: 200, data: { message: "Sell order canceled" } };
};

// Create a Sell order (Either exit or buy(pseudo sell))
const initiateSellOrder = (
  stockSymbol: string,
  stockType: "yes" | "no",
  price: priceRange,
  quantity: number,
  userId: string,
  orderType: "buy" | "exit"
) => {
  let newPrice: priceRange =
    orderType == "buy" ? ((10 - price) as priceRange) : price;
  let newType: "yes" | "no" =
    orderType == "buy" ? (stockType == "yes" ? "no" : "yes") : stockType;

  // pseudo order -> Lock inr balance of the user (in paise)
  if (orderType == "buy") {
    INR_BALANCES[userId].balance -= quantity * price * 100;
    INR_BALANCES[userId].locked += quantity * price * 100;
  }

  // actual sell order -> Lock stock balance of user
  if (orderType == "exit") {
    STOCK_BALANCES[userId][stockSymbol][newType]!.quantity -= quantity;
    STOCK_BALANCES[userId][stockSymbol][newType]!.locked += quantity;
  }

  const sellOrderArray = ORDERBOOK[stockSymbol][newType];
  const sellOrder = sellOrderArray.get(newPrice);

  // Add order to orderbook
  if (sellOrder) {
    sellOrder.total += quantity;
    sellOrder.orders.push({ userId, id: uuidv4(), quantity, type: orderType });
  } else {
    sellOrderArray.set(newPrice, {
      total: quantity,
      orders: [{ userId, id: uuidv4(), quantity, type: orderType }],
    });
  }
  publishOrderbook(stockSymbol);
};

// Match Two orders Completely or partially
const matchOrder = (
  stockSymbol: string,
  stockType: "yes" | "no",
  orderPrice: priceRange,
  requiredQuantity: number,
  orderObject: ORDERDATA,
  takerId: string,
  takerType: "buy" | "sell"
) => {
  const allOrders = orderObject.orders;
  let remainingQuantity = requiredQuantity;

  // Pseudo Order details
  let pseudoType: "yes" | "no" = "yes";
  let pseudoPrice: priceRange = Number(10 - orderPrice) as priceRange;
  if (stockType == "yes") {
    pseudoType = "no";
  }

  // loop over all orders -> one at a time
  for (const order in allOrders) {
    if (allOrders[order].quantity > remainingQuantity) {
      // Update quantity in order book

      allOrders[order].quantity -= remainingQuantity;
      orderObject.total -= remainingQuantity; // For maintaining available balance in buy order function

      // Deduct order from the orderbook depending on taker type
      if (takerType == "sell") {
        ORDERBOOK[stockSymbol][pseudoType].get(orderPrice)!.total -=
          remainingQuantity;
      } else {
        ORDERBOOK[stockSymbol][stockType].get(orderPrice)!.total -=
          remainingQuantity;
      }

      // update Stocks and INR balances
      updateBalances(
        stockSymbol,
        stockType,
        orderPrice,
        remainingQuantity,
        takerId,
        takerType,
        allOrders[order].userId,
        allOrders[order].type
      );

      // Order completely filled
      remainingQuantity = 0;

      return remainingQuantity;
    } else {
      remainingQuantity -= allOrders[order].quantity;
      orderObject.total -= allOrders[order].quantity;
      ORDERBOOK[stockSymbol][stockType].get(orderPrice)!.total -=
        allOrders[order].quantity;

      // update Stocks and INR balances
      updateBalances(
        stockSymbol,
        stockType,
        orderPrice,
        allOrders[order].quantity,
        takerId,
        takerType,
        allOrders[order].userId,
        allOrders[order].type
      );

      // Order partially filled
      allOrders[order].quantity = 0;

      // Delete order of this user from the orderbook
      ORDERBOOK[stockSymbol][stockType].get(orderPrice)?.orders.shift();
    }
  }
  return remainingQuantity;
};

// Update INR and stock balances after order matched
const updateBalances = (
  stockSymbol: string,
  stockType: "yes" | "no",
  price: priceRange,
  quantity: number,
  takerId: string,
  takerType: "buy" | "sell",
  makerId: string,
  makerType: "buy" | "exit"
) => {
  const pseudoPrice = 10 - price;
  // Maker balance and stocks update
  if (makerType == "buy") {
    INR_BALANCES[makerId].locked -= quantity * pseudoPrice * 100;

    let makerStockType: "yes" | "no" =
      takerType == "buy" ? (stockType == "yes" ? "no" : "yes") : stockType;

    if (STOCK_BALANCES[makerId][stockSymbol]) {
      if (STOCK_BALANCES[makerId][stockSymbol][makerStockType]) {
        STOCK_BALANCES[makerId][stockSymbol][makerStockType].quantity +=
          quantity;
      } else {
        STOCK_BALANCES[makerId][stockSymbol][makerStockType] = {
          quantity: quantity,
          locked: 0,
        };
      }
    } else {
      STOCK_BALANCES[makerId][stockSymbol] = {
        [makerStockType]: { quantity: quantity, locked: 0 },
      };
    }
  } else {
    INR_BALANCES[makerId].balance += quantity * price * 100;
    STOCK_BALANCES[makerId][stockSymbol][stockType]!.locked -= quantity;
  }

  // Taker balance and stock update
  if (takerType == "buy") {
    INR_BALANCES[takerId].balance -= quantity * price * 100;

    if (STOCK_BALANCES[takerId][stockSymbol]) {
      if (STOCK_BALANCES[takerId][stockSymbol][stockType]) {
        STOCK_BALANCES[takerId][stockSymbol][stockType].quantity += quantity;
      } else {
        STOCK_BALANCES[takerId][stockSymbol][stockType] = {
          quantity,
          locked: 0,
        };
      }
    } else {
      STOCK_BALANCES[takerId][stockSymbol] = {
        [stockType]: { quantity, locked: 0 },
      };
    }
  } else {
    INR_BALANCES[takerId].balance += quantity * price * 100;
    STOCK_BALANCES[takerId][stockSymbol][stockType]!.quantity -= quantity;
  }
};
