import { Request, Response } from "express";
import { YES_ORDER_REQUEST } from "../interfaces";
import { INR_BALANCES } from "../config/globals";

export const buyOrder = (req: Request, res: Response) => {
  const { userId, stockSymbol, quantity, price }: YES_ORDER_REQUEST = req.body;

  const requiredBalance = quantity * price;
  const userBalance = INR_BALANCES[`user${userId}`].balance;

  if (requiredBalance > userBalance) {
    return res.send({ message: "Insufficient Balance" });
  }
};

export const sellOrder = (req: Request, res: Response) => {
  console.log("Sell order");
};

export const viewOrders = (req: Request, res: Response) => {
  console.log("View order");
};
