import { Request, Response } from "express";

export const path = "/callback";
export const handler = (req: Request, res: Response) => {
  res.redirect(req.session["redirectUri"] || "/");
};
