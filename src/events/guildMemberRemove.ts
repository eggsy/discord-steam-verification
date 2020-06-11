import { Event } from "../structures";
import { Member, Guild } from "eris";
import Bot from "../util/bot";

export default class MemberLeaveEvent extends Event {
  name = "guildMemberRemove";

  async execute(guild: Guild, member: Member, bot: Bot) {
    if (bot.master.queue.has(`${guild.id}/${member.id}`))
      return bot.master.queue.delete(`${guild.id}/${member.id}`);
  }
}
