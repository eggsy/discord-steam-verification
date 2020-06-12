import { Event } from "../structures";
import { Member, Guild } from "eris";
import Bot from "../util/bot";

export default class MemberLeaveEvent extends Event {
  name = "guildMemberRemove";

  async execute(guild: Guild, member: Member, bot: Bot) {
    if (bot.master.queue.has(`${guild.id}/${member.id}`)) {
      bot.master.queue.delete(`${guild.id}/${member.id}`);
      if (bot.settings.logChannel.id) {
        bot.settings.logChannel.channel.createMessage(
          bot.master.strings.bot.info["USER_LEFT_SERVER"]
            .replace(/\{0\}/g, member.username)
            .replace(/\{1\}/g, member.id)
        );
      }
    }
  }
}
