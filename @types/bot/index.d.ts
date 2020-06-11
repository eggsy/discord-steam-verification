import { Client, Guild, Member, Message, TextChannel } from "eris";
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