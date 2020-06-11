import { Params } from "../../@types/bot/index";
import { Command } from "../structures";

export default class EmitCommand extends Command {
  name = "emit";
  description = "Emits guildMemberAdd for testing.";
  aliases = ["e", "verifyself", "vs"];
  usage = "emit";

  execute(ctx: Params) {
    const memberRoles: string[] = [];
    if (ctx.author.roles && ctx.author.roles.length)
      ctx.bot.settings.successRoles.forEach((r) =>
        ctx.author.roles.includes(r) ? memberRoles.push(r) : null
      );

    if (ctx.bot.settings.successRoles.length === memberRoles.length)
      return ctx.message.addReaction("⛔").catch(null);

    ctx.bot.emit("guildMemberAdd", ctx.author);
  }
}
