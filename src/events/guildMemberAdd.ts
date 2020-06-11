import { Event } from "../structures";
import { Member } from "eris";
import Bot from "../util/bot";
import consola from "consola";

export default class NewMemberEvent extends Event {
  name = "guildMemberAdd";

  async execute(member: Member, bot: Bot) {
    if (
      !bot.settings.enabled ||
      bot.settings.successRoles.some((r) => member.roles.includes(r))
    )
      return;

    try {
      bot.startVerification(member);
    } catch (err) {
      consola.error(err);
    }
  }
}
