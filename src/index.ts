/*
  🛠 THANKS FOR CHECKING OUT THIS REPOSITORY!

  This project is mainly made for a server that I administrate to check if users has specific app in their Steam account. I'm making it open-source so you can use it too. But please, do not forget:
    - This might not be the best code you ever seen.
    - There might be some errors due it's still in development.
    - You might see some "professional" settings like disabling events (which is not that professional but most of people don't do that), they are there so we could get the best performance out of the system.
    - It'd be better if you use a DB instead of saving stuff on memory but since this is an open repository, I prefer keeping things as simple as possible. There might be another branch where you can find the version of it using a database in the future.

  🛠 PLEASE DON'T HESITATE TO LEAVE YOUR COMMENTS, CONTRIBUTIONS AND REPORT THE BUGS YOU SEE!
  🛠 HAVE FUN!
*/

import { config as loadEnv } from "dotenv";
import { Master } from "./structures";
import { Config } from "./config";
import Bot from "./util/bot";
import API from "./util/api";

// Import strings
import stringsBot from "./strings/bot";
import stringsApi from "./strings/api";
import stringsWeb from "./strings/website";

loadEnv({ path: "../.env" });

export default class Main extends Master {
  bot = new Bot(new Config(), this);
  api = new API(Number(process.env.API_PORT) || 3000, this);
  queue = new Map();
  strings = {
    bot: stringsBot,
    api: stringsApi,
    web: stringsWeb,
  };

  constructor() {
    super();
  }
}

new Main();
