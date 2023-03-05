import { Response } from "express";
import API from "../util/api";

export const path = "/";
export const handler = (
  req: Request,
  res: Response,
  api: API
) => {
  res.render("main", {
    title: api.master.strings.web.HI_THERE,
  });
};
