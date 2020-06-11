import { Route } from "../structures";
import { Request, Response } from "express";

export default class LoginRoute extends Route {
  path = "/login";

  handler(req: Request, res: Response) {
    res.send("hi!");
  }
}
