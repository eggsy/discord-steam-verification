import { Event } from "@/structures";
import { Member, Guild } from "eris";
import Bot from "@/util/bot";
import consola from "consola";

export default class NewMemberEvent extends Event {
  name = "guildMemberAdd";

  async execute(guild: Guild, member: Member, bot: Bot) {
    const memberRoles: string[] = [];
    if (member && member.roles && member.roles.length)
      bot.settings.successRoles.forEach((r) =>
        member.roles.includes(r) ? memberRoles.push(r) : null
      );

    if (
      !bot.settings.enabled ||
      memberRoles.length === bot.settings.successRoles.length ||
      bot.master.queue.has(`${guild.id}/${member.id}`)
    )
      return;

    try {
      bot.startVerification(guild, member);
    } catch (err) {
      consola.error(err);
    }
  }
}
