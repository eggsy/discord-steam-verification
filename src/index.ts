import { Master } from "@/structures";
import Bot from "@/util/bot";
import API from "@/util/api";

// Import strings
import stringsBot from "@/strings/bot";
import stringsApi from "@/strings/api";
import stringsWeb from "@/strings/website";

export default class Main extends Master {
  queue = new Map();
  usedAccounts: string[] = [];
  strings = {
    bot: stringsBot,
    api: stringsApi,
    web: stringsWeb,
  };

  bot = new Bot(this);
  api = new API(Number(process.env.API_PORT) || 3000, this);

  constructor() {
    super();
  }
}

new Main();
