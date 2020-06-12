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
      for (let key in ctx.bot.settings.successRoles) {
        const id = ctx.bot.settings.successRoles[key];

        if (ctx.author.roles.includes(id)) memberRoles.push(id);
      }

    if (ctx.bot.settings.successRoles.length === memberRoles.length)
      return ctx.message.addReaction("⛔").catch(null);

    ctx.bot.emit("guildMemberAdd", ctx.guild, ctx.author);
  }
}
