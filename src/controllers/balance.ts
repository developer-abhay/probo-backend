import { Request, Response } from "express";
import { INR_BALANCES, STOCK_BALANCES } from "../config/globals";

// Get INR Balance
export const getInrBalances = (req: Request, res: Response) => {
  res.status(200).send(INR_BALANCES);
};

// Get INR Balance by User Id
export const getInrBalanceByUserId = (req: Request, res: Response) => {
  const userId: string = req.params.userId;

  const userExists = INR_BALANCES[userId];

  if (!userExists) {
    res.send({ error: `User with ID ${userId} does not exist` });
    return;
  }

  const balance = INR_BALANCES[userId].balance;
  res.send({ balance });
};

// Get Stock Balance
export const getStockBalances = (req: Request, res: Response) => {
  res.send(STOCK_BALANCES);
};

// Get Stock Balance By User Id
export const getStockBalancebyUserId = (req: Request, res: Response) => {
  const userId: string = req.params.userId;

  const userExists = INR_BALANCES[userId];
  const stocksExists = STOCK_BALANCES[userId];

  if (!userExists) {
    res.send({ error: `User with Id ${userId} does not exist` });
    return;
  }
  if (!stocksExists) {
    res.send({ message: `No stocks for user with userId ${userId}` });
    return;
  }

  res.send({ data: STOCK_BALANCES[userId] });

  // const stockArray = STOCK_BALANCES[userId];
  // const stockArrayKeys = Object.keys(stockArray);
  // const stockArrayValues = Object.values(stockArray);

  // const balance = [];
  // let yesStocks = 0;
  // let noStocks = 0;

  // for (let i = 0; i < stockArrayKeys.length; i++) {
  //   const key = stockArrayKeys[i];
  //   const value = {
  //     yes: stockArrayValues[i].yes?.quantity,
  //     no: stockArrayValues[i].no?.quantity,
  //   };
  //   balance.push({ [key]: value });

  //   yesStocks += stockArrayValues[i].yes?.quantity || 0;
  //   noStocks += stockArrayValues[i].no?.quantity || 0;
  // }
  // res.send({
  //   data: { totalBalance: { yes: yesStocks, no: noStocks }, balance },
  // });
};

// Om Ramp Wallet
export const onRamp = (req: Request, res: Response) => {
  const userId: string = req.body.userId;
  const amount: number = req.body.amount;

  const userExists = INR_BALANCES[userId];

  if (!userExists) {
    res.send({ error: `User with ID ${userId} does not exist` });
    return;
  }

  INR_BALANCES[userId].balance += amount;

  res.status(200).send({
    message: `Onramped ${userId} with amount ${amount}`,
  });
};
