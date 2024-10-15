import { Request, Response } from "express";
import { INR_BALANCES, STOCK_BALANCES } from "../config/globals";

export const createUser = (req: Request, res: Response) => {
  const userId: string = req.params.userId;

  if (!userId) {
    res.send({ error: "Invalid user Id" });
    return;
  }

  const userExists = INR_BALANCES[userId];

  if (userExists) {
    res.send({ error: "User Already Exists" });
    return;
  }

  INR_BALANCES[userId] = { balance: 0, locked: 0 };
  STOCK_BALANCES[userId] = {};
  res.status(201).send({ message: `User ${userId} created` });
};
