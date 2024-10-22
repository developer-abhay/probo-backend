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
    // 1.
    case "/user/create/:userId":
      response = createUser(data.req);
      break;
    // 2.
    case "/symbol/create/:stockSymbol":
      response = createSymbol(data.req);
      break;
    // 3.
    case "/trade/mint":
      response = mintToken(data.req);
      break;
    // 4.
    case "/reset":
      response = reset(data.req);
      break;
  }

  publisher.publish(data._id, JSON.stringify(response));
};

const router = express.Router();

// Create user and Symbol
// router.post("/user/create/:userId", createUser);
// router.post("/symbol/create/:stockSymbol", createSymbol);
// router.post("/trade/mint", mintToken);
// router.post("/reset", reset);

// Balances
router.get("/balances/inr", getInrBalances);
router.get("/balances/inr/:userId", getInrBalanceByUserId);
router.get("/balances/stock", getStockBalances);
router.get("/balances/stock/:userId", getStockBalancebyUserId);
router.post("/onramp/inr", onRamp);

// Orders
router.get("/orderbook", getOrderBook);
router.get("/orderbook/:stockSymbol", viewOrders);
router.post("/order/buy", buyOrder);
router.post("/order/sell", sellOrder);
router.post("/order/cancel", cancelOrder);

export default router;
