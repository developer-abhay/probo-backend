import { Request, Response } from "express";

export const getInrBalance = (req: Request, res: Response) => {
  res.send("Get INR Balance");
};

export const getStockBalance = (req: Request, res: Response) => {
  res.send("Get Stock Balance");
};

export const onRamp = (req: Request, res: Response) => {
  res.send("OnRamp INR -> BTC ");
};
