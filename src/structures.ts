import { Params } from "types/bot";
import API from "@/util/api";
import Bot from "@/util/bot";

import ApiStrings from "@/strings/api";
import BotStrings from "@/strings/bot";
import WebsiteStrings from "@/strings/website";

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
  strings: {
    bot: typeof BotStrings;
    api: typeof ApiStrings;
    web: typeof WebsiteStrings;
  };
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
  abstract execute(args: Params): any | Promise<any>;
}

export abstract class Event {
  name?: string;
  abstract execute(...args: any): any | Promise<any>;
}
