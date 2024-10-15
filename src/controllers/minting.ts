import { Request, Response } from "express";
import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from "../config/globals";
import { MINT_REQUEST } from "../interfaces/requestModels";

// Create A new Symbol
export const createSymbol = (req: Request, res: Response) => {
  const stockSymbol: string = req.params.stockSymbol;

  if (!stockSymbol) {
    res.send({ error: "Invalid Symbol" });
    return;
  }

  const symbolExists = ORDERBOOK[stockSymbol];

  if (symbolExists) {
    res.send({ error: "Symbol Already Exists" });
    return;
  }

  ORDERBOOK[stockSymbol] = {
    yes: {},
    no: {},
  };

  res.status(201).send({ message: `Symbol ${stockSymbol} created` });
};

// Mint New Stocks of a given symbol
export const mintToken = (req: Request, res: Response) => {
  const { userId, stockSymbol }: MINT_REQUEST = req.body;
  const quantity = Number(req.body.quantity);
  const price = Number(req.body.price);

  const userExists = INR_BALANCES[userId];
  const symbolExists = ORDERBOOK[stockSymbol];

  if (!userExists) {
    res.send({ error: `User for Id ${userId} does not exist` });
    return;
  }
  if (!symbolExists) {
    res.send({ error: `Symbol with symbol ${stockSymbol} does not exist` });
    return;
  }

  const requiredBalance = quantity * price; // 2 * price in paise per stock pair (yes and no)
  // const requiredBalance = quantity * price; // price in paise per stock pair (yes and no)
  const userBalance = INR_BALANCES[userId].balance;

  if (requiredBalance > userBalance) {
    res.send({ message: "Insufficient INR Balance" });
    return;
  }

  if (!STOCK_BALANCES?.[userId]?.[stockSymbol]) {
    STOCK_BALANCES[userId] = {
      [stockSymbol]: {
        yes: {
          quantity,
          locked: 0,
        },
        no: {
          quantity,
          locked: 0,
        },
      },
    };
  } else {
    const initalYesStocks = STOCK_BALANCES[userId][stockSymbol]?.yes;
    const initalNoStocks = STOCK_BALANCES[userId][stockSymbol].no;

    STOCK_BALANCES[userId][stockSymbol].yes = {
      quantity: (initalYesStocks?.quantity || 0) + quantity,
      locked: initalYesStocks?.locked || 0,
    };

    STOCK_BALANCES[userId][stockSymbol].no = {
      quantity: (initalNoStocks?.quantity || 0) + quantity,
      locked: initalNoStocks?.locked || 0,
    };
  }

  const remainingBalance = userBalance - requiredBalance;
  INR_BALANCES[userId].balance = remainingBalance;

  res.status(200).send({
    message: `Minted ${quantity} 'yes' and 'no' tokens for user ${userId}, remaining balance is ${remainingBalance}`,
  });
};

export const reset = (req: Request, res: Response) => {
  for (let prop in ORDERBOOK) {
    delete ORDERBOOK[prop];
  }

  for (let prop in INR_BALANCES) {
    delete INR_BALANCES[prop];
  }

  for (let prop in STOCK_BALANCES) {
    delete STOCK_BALANCES[prop];
  }
  res.status(200).send({ message: "Reset Successfully" });
};
