import { Route } from "../structures";
import { Response } from "express";
import { RequestWithExtraInformation } from "types/express";
import API from "../util/api";

export default class MainRoute extends Route {
  path = "/";

  handler(req: RequestWithExtraInformation, res: Response, api: API) {
    res.render("main", {
      title: api.master.strings.web.HI_THERE
    });
  }
}