import { Params } from "types/bot";
import { Command } from "@/structures";

export default class IsVerifiedCommand extends Command {
  name = "isverified";
  description = "Check if a user has the successful verification roles.";
  aliases = ["iv"];
  usage = "isverified <@user|user_id>";
  requiredPerms = ["kickMembers"];

  execute(ctx: Params) {
    if (!ctx.args.length)
      return ctx.channel.createMessage(
        ctx.bot.strings.errors.commands.common[
          "WRONG_USAGE"
        ].replace(/\{0\}/g, this.usage)
      );

    const member =
      ctx.guild.members.get(
        ctx.message.mentions[0] ? ctx.message.mentions[0].id : null
      ) || ctx.guild.members.get(ctx.args[0]);

    if (!member)
      return ctx.channel.createMessage(
        ctx.bot.strings.errors.commands.common["MEMBER_NOT_FOUND"]
      );

    const hasRoles: string[] = [],
      opposite: string[] = [];

    ctx.bot.settings.successRoles.some((r) => {
      member.roles.includes(r) ? hasRoles.push(r) : opposite.push(r);
    });

    if (hasRoles.length === ctx.bot.settings.successRoles.length)
      return ctx.channel.createMessage(
        ctx.bot.strings.commands.isverified["USER_IS_VERIFIED"]
      );
    else if (
      opposite.length &&
      opposite.length < ctx.bot.settings.successRoles.length
    )
      return ctx.channel.createMessage(
        ctx.bot.strings.commands.isverified["MISSING_ROLES"].replace(
          /\{0\}/g,
          opposite.map((r) => "`" + r + "`").join(", ")
        )
      );
    else if (opposite.length === ctx.bot.settings.successRoles.length)
      return ctx.channel.createMessage(
        ctx.bot.strings.commands.isverified["USER_NOT_VERIFIED"]
      );
  }
}
