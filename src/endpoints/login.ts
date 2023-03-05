import { Response } from "express";

export const path = "/login";
export const handler = (_, res: Response) => {
  res.send("Hello World!");
};
