import { Params } from "types/bot";
import { Command } from "@/structures";

export default class EmitCommand extends Command {
  name = "emit";
  description = "Emits guildMemberAdd for testing.";
  aliases = ["e", "verifyself", "vs"];
  usage = "emit";

  execute(ctx: Params) {
    const memberRoles: string[] = [];

    if (ctx.author.roles && ctx.author.roles.length)
      for (const id of ctx.bot.settings.successRoles) {
        if (ctx.author.roles.includes(id)) memberRoles.push(id);
      }

    if (ctx.bot.settings.successRoles.length === memberRoles.length) {
      ctx.message.addReaction("⛔").catch(() => {});
      return;
    }

    ctx.bot.emit("guildMemberAdd", ctx.guild, ctx.author);
  }
}
