import { Route } from "../structures";
import { Response } from "express";
import { RequestWithExtraInformation } from "types/express";

export default class CallbackRoute extends Route {
  path = "/callback";

  handler(req: RequestWithExtraInformation, res: Response) {
    res.redirect(req.session["redirectUri"] || "/");
  }
}
