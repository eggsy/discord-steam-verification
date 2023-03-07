import { Params } from "types/bot";
import { Command } from "@/structures";

export default class IsVerifiedCommand extends Command {
  name = "isverified";
  description = "Check if a user has the successful verification roles.";
  aliases = ["iv"];
  usage = "isverified <@user|user_id>";
  requiredPerms = ["kickMembers"];

  async execute(ctx: Params) {
    if (!ctx.args.length)
      return ctx.channel.createMessage(
        ctx.bot.strings.errors.commands.common["WRONG_USAGE"].replaceAll(
          "{0}",
          this.usage
        )
      );

    const userId = ctx.message.mentions?.[0]?.id || ctx.args[0];

    const member = await ctx.guild
      .fetchMembers({
        presences: false,
        userIDs: [userId],
      })
      .then((u) => u[0]);

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
      await ctx.channel.createMessage(
        ctx.bot.strings.commands.isverified["USER_IS_VERIFIED"]
      );
    else if (opposite.length < ctx.bot.settings.successRoles.length)
      await ctx.channel.createMessage(
        ctx.bot.strings.commands.isverified["MISSING_ROLES"].replaceAll(
          "{0}",
          opposite.map((r) => "`" + r + "`").join(", ")
        )
      );
    else if (opposite.length === ctx.bot.settings.successRoles.length)
      await ctx.channel.createMessage(
        ctx.bot.strings.commands.isverified["USER_NOT_VERIFIED"]
      );

    ctx.guild.members.clear();
  }
}
