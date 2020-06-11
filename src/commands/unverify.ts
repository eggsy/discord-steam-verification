import { Params } from "../../@types/bot/index";
import { Command } from "../structures";

export default class UnverifyCommand extends Command {
  name = "unverify";
  description = "Removes the verification from a user.";
  aliases = ["uv"];
  usage = "unverify <@user|user_id>";
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

    if (ctx.bot.settings.successRoles.some((r) => !member.roles.includes(r)))
      return ctx.channel.createMessage(
        ctx.bot.master.strings.bot.errors.commands.unverify["NO_VERIFIED_ROLES"]
      );

    ctx.bot.settings.successRoles.map((r) => member.removeRole(r));
    ctx.channel.createMessage(
      ctx.bot.master.strings.bot.commands.unverify["SUCCESS"]
    );
  }
}
