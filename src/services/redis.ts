import { Request, Response } from "express";
import { createClient } from "redis";
import { ORDERBOOK } from "../config/globals";
import { getOrderBook } from "../controllers/orders";
// Publisher
const publisher = createClient();

export const connectToRedis = async () => {
  try {
    await publisher.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Failed to connect to REdis");
  }
};

export const publishOrderbook = async (eventId: string) => {
  try {
    if (ORDERBOOK[eventId]) {
      const orderbook = getOrderBookByEvent(eventId);
      await publisher.publish(eventId, JSON.stringify(orderbook));
    }
    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

const getOrderBookByEvent = (eventId: string) => {
  let orderbook;
  const symbolExists = ORDERBOOK[eventId];

  if (symbolExists) {
    orderbook = Object.fromEntries(
      Object.entries(symbolExists).map(([type, orders]) => {
        return [
          type,
          orders.map((item) => {
            return { price: item.price, quantity: item.total };
          }),
        ];
      })
    );
  } else {
    orderbook = { eventId: {} };
  }

  return orderbook;
};
