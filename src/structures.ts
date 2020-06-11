import { Params } from "../@types/bot";
import { Request, Response } from "express";
import API from "./util/api";
import Bot from "./util/bot";

export class Master {
  api: API;
  bot: Bot;
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
  abstract name: string;
  abstract description: string;
  abstract aliases: string[];
  abstract usage: string;
  requiredPerms: string[];
  abstract async execute(args: Params);
}

export abstract class Event {
  abstract name: string;
  abstract execute(...args: any);
}

/*
  Structures for the API
*/

export abstract class Route {
  abstract path: string;
  method: string = "get";
  abstract async handler(req: Request, res: Response, ...args: any);
}
