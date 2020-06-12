import { Client, Guild, Member, Message, TextChannel } from "eris";
import { failureAction } from "../../src/structures";
import Bot from "../../src/util/bot";

interface Params {
  client: Client;
  args: string[];
  message: Message;
  author: Member;
  guild: Guild;
  channel: TextChannel;
  bot: Bot;
}

interface BotSettings {
  enabled: boolean;
  servers: string[];
  successRoles: string[];
  failureAction: failureAction;
  logChannel?: {
    id: string;
    channel: TextChannel;
  };
  backup?: {
    auto: boolean;
    interval: number;
    path: string;
  };
}
