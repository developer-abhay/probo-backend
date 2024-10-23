import express from "express";
import {
  createUser,
  createSymbol,
  mintToken,
  reset,
} from "../controllers/auth";
import {
  getInrBalanceByUserId,
  getInrBalances,
  getStockBalancebyUserId,
  getStockBalances,
  onRamp,
} from "../controllers/balance";
import {
  buyOrder,
  cancelOrder,
  getOrderBook,
  sellOrder,
  viewOrders,
} from "../controllers/orders";
import { QUEUE_DATA_ELEMENT } from "../interfaces/requestModels";
import { publisher } from "../services/redis";

// Match all endpoints
export const matchEndpoint = (data: QUEUE_DATA_ELEMENT) => {
  let response;
  switch (data.endpoint) {
    // create user and symbol
    case "/user/create/:userId":
      response = createUser(data.req);
      break;
    case "/symbol/create/:stockSymbol":
      response = createSymbol(data.req);
      break;

    // Balances
    case "/balances/inr":
      response = getInrBalances(data.req);
      break;
    case "/balances/inr/:userId":
      response = getInrBalanceByUserId(data.req);
      break;
    case "/balances/stock":
      response = getStockBalances(data.req);
      break;
    case "/balances/stock/:stockSymbol":
      response = getStockBalancebyUserId(data.req);
      break;
    case "/onramp/inr":
      response = onRamp(data.req);
      break;

    // Orderbook
    case "/orderbook":
      response = getOrderBook(data.req);
      break;
    case "/orderbook/:stockSymbol":
      response = viewOrders(data.req);
      break;

    // Orders
    case "/order/buy":
      response = buyOrder(data.req);
      break;
    case "/order/sell":
      response = sellOrder(data.req);
      break;
    case "/order/cancel":
      response = cancelOrder(data.req);
      break;

    // Extra endpoints
    case "/trade/mint":
      response = mintToken(data.req);
      break;
    case "/reset":
      response = reset(data.req);
      break;
  }

  publisher.publish(data._id, JSON.stringify(response));
};
