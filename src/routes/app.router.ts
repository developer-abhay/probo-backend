import express from "express";
import { getInrBalance, getStockBalance, onRamp } from "../controllers/balance";
import { buyOrder, sellOrder, viewOrders } from "../controllers/orders";
import { mintToken } from "../controllers/minting";

const router = express.Router();

router.get("/balance/inr/:userId", getInrBalance);
router.get("/balance/stock/:userId", getStockBalance);
router.post("/onramp/inr", onRamp);

router.get("/orderbook/:stockSymbol", viewOrders);
router.post("/order/yes", buyOrder);
router.post("/order/no", sellOrder);

router.post("/trade/mint/:stockSymbol", mintToken);

export default router;
