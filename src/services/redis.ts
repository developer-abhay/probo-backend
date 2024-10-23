import { createClient } from "redis";
import { ORDERBOOK } from "../config/globals";
import { queueName } from "../config/constants";
import { matchEndpoint } from "../routes/app.router";

// Publisher for pub sub
export const publisher = createClient();
// Queue consumer
const consumer = createClient();

// Connect to redis
export const connectToRedis = async () => {
  try {
    await publisher.connect();
    await consumer.connect();

    // Pulling from the queue
    pullFromQueue(queueName);
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Failed to connect to REdis");
  }
};

// Pulling from the queue
export const pullFromQueue = async (queueName: string) => {
  while (true) {
    const payload = await consumer.brPop(queueName, 0);

    if (payload) {
      const data = JSON.parse(payload.element);
      matchEndpoint(data);
    }
  }
};

// Publish orderbook on the pubsub
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
