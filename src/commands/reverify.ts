import { Params } from "../../@types/bot/index";
import { Command } from "../structures";

export default class ReverifyCommand extends Command {
  name = "reverify";
  description =
    "Removes the ALL current roles and starts verification process on a user.";
  aliases = ["rv", "verify"];
  usage = "reverify <@user|user_id>";
  requiredPerms = ["banMembers"];

  execute(ctx: Params) {
    if (!ctx.args.length)
      return ctx.channel.createMessage(
        ctx.bot.master.strings.bot.errors.commands.common[
          "WRONG_USAGE"
        ].replace(/\{0\}/g, this.usage)
      );

    const member =
      ctx.guild.members.get(
        ctx.message.mentions[0] ? ctx.message.mentions[0].id : null
      ) || ctx.guild.members.get(ctx.args[0]);

    if (!member)
      return ctx.channel.createMessage(
        ctx.bot.master.strings.bot.errors.commands.common["MEMBER_NOT_FOUND"]
      );

    const removed: string[] = [],
      notremoved: string[] = [];

    ctx.bot.settings.successRoles.map((r) => {
      try {
        member.removeRole(r);
        removed.push(ctx.guild.roles.get(r).name);
      } catch (err) {
        notremoved.push(ctx.guild.roles.get(r).name);
      }
    });

    if (!removed.length)
      return ctx.channel.createMessage(
        ctx.bot.master.strings.bot.errors.commands.reverify[
          "COULDNT_REMOVE_ROLES"
        ].replace(/\{0\}/g, notremoved.map((r) => `${r}`).join(", "))
      );
    else if (removed.length && notremoved.length)
      return ctx.channel.createMessage(
        ctx.bot.master.strings.bot.errors.commands.reverify["PARTIALLY_REMOVED"]
          .replace(/\{0\}/g, removed.map((r) => `${r}`).join(", "))
          .replace(/\{1\}/g, notremoved.map((r) => `${r}`).join(", "))
      );
    else {
      ctx.bot.startVerification(member);
      ctx.channel.createMessage(
        ctx.bot.master.strings.bot.commands.reverify["SUCCESS"]
      );
    }
  }
}
