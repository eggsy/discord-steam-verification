import { Event } from "@/structures";
import { Guild, Member } from "eris";
import Bot from "@/util/bot";
import { useReplacer } from "@/functions/replacer";

export default class MemberLeaveEvent extends Event {
  name = "guildMemberRemove";

  async execute(guild: Guild, member: Member, bot: Bot) {
    const saveKey = `${guild.id}/${member.id}`;

    if (bot.master.queue.has(saveKey)) {
      bot.master.queue.delete(saveKey);

      bot.settings.logChannel?.channel?.createMessage(
        useReplacer(bot.master.strings.bot.info["USER_LEFT_SERVER"], [
          member.username,
          member.id,
        ])
      );
    }

    const userIndex: number = bot.master.usedAccounts.findIndex((a) =>
      a.includes(`${member.id}/`)
    );

    if (userIndex === -1) return;

    bot.master.usedAccounts = bot.master.usedAccounts.filter(
      (a: string, i: number) => i !== userIndex
    );
  }
}
