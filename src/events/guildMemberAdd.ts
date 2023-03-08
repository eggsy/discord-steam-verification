import { Event } from "@/structures";
import { Member, Guild } from "eris";
import Bot from "@/util/bot";
import consola from "consola";

export default class NewMemberEvent extends Event {
  name = "guildMemberAdd";

  async execute(guild: Guild, member: Member, bot: Bot) {
    const memberRoles: string[] = [];

    if (member?.roles)
      bot.settings.successRoles.forEach((r) => {
        if (member.roles.includes(r)) memberRoles.push(r);
      });

    if (
      !bot.settings.enabled ||
      memberRoles.length === bot.settings.successRoles.length ||
      bot.master.queue.has(`${guild.id}/${member.id}`) ||
      bot.master.usedAccounts.includes(`${guild.id}/${member.id}`)
    )
      return;

    await bot.startVerification(guild, member).catch(consola.error);
  }
}
