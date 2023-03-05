import { Request } from "express";

export interface RequestWithExtraInformation extends Request {
  user: { username: string };
  session: [any];
}
