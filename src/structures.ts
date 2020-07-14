import { Params } from "../@types/bot";
import { Request, Response } from "express";
import API from "./util/api";
import Bot from "./util/bot";

export class Master {
  api: API;
  bot: Bot;
  usedAccounts: string[];
  queue: Map<
    string,
    {
      startedAt: number;
      server: { id: string; name: string };
      user: { name: string; id: string };
    }
  >;
  strings: { bot: BotStrings; api: ApiStrings; web: WebsiteStrings };
}

/*
 Structurs for the Discord bot
*/

export abstract class Command {
  name?: string;
  abstract description: string;
  abstract aliases: string[];
  abstract usage: string;
  requiredPerms: string[];
  abstract async execute(args: Params);
}

export abstract class Event {
  name?: string;
  abstract execute(...args: any);
}

export enum failureAction {
  NONE,
  KICK,
  BAN,
}

/*
  Structures for the API
*/

export abstract class Route {
  abstract path: string;
  method: string = "get";
  abstract async handler(req: Request, res: Response, ...args: any);
}
