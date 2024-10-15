import express from "express";
import { createSymbol, mintToken, reset } from "../controllers/minting";
import { createUser } from "../controllers/auth";
import {
  getInrBalanceByUserId,
  getInrBalances,
  getStockBalancebyUserId,
  getStockBalances,
  onRamp,
} from "../controllers/balance";
import {
  buyOrder,
  getOrderBook,
  sellOrder,
  viewOrders,
} from "../controllers/orders";

const router = express.Router();

// Create user and Symbol
router.post("/user/create/:userId", createUser);
router.post("/symbol/create/:stockSymbol", createSymbol);

// Get Info
router.get("/balance/inr", getInrBalances);
router.get("/balance/inr/:userId", getInrBalanceByUserId);
router.get("/balance/stock", getStockBalances);
router.get("/balance/stock/:userId", getStockBalancebyUserId);
router.post("/onramp/inr", onRamp);

// Orders
router.get("/orderbook", getOrderBook);
router.get("/orderbook/:stockSymbol", viewOrders);
router.post("/order/buy", buyOrder);
router.post("/order/sell", sellOrder);

// Minting
router.post("/trade/mint", mintToken);

// Reset
router.post("/reset", reset);

export default router;
