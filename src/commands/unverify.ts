import { Params } from "types/bot";
import { Command } from "@/structures";
import { useReplacer } from "@/functions/replacer";

export default class UnverifyCommand extends Command {
  name = "unverify";
  description = "Removes the verification from a user.";
  aliases = ["uv"];
  usage = "unverify <@user|user_id>";
  requiredPerms = ["banMembers"];

  async execute(ctx: Params) {
    if (!ctx.args.length)
      return ctx.channel.createMessage(
        useReplacer(ctx.bot.strings.errors.commands.common["WRONG_USAGE"], [
          this.usage,
        ])
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

    if (
      ctx.bot.settings.successRoles.some((r) => !member.roles.includes(r)) &&
      !ctx.bot.master.queue.has(`${ctx.guild.id}/${member.id}`)
    )
      return ctx.channel.createMessage(
        ctx.bot.strings.errors.commands.unverify["NO_VERIFIED_ROLES"]
      );
    else if (
      !ctx.bot.settings.successRoles.some((r) => member.roles.includes(r)) &&
      ctx.bot.master.queue.has(`${ctx.guild.id}/${member.id}`)
    ) {
      ctx.bot.master.queue.delete(`${ctx.guild.id}/${member.id}`);

      await ctx.channel.createMessage(
        ctx.bot.strings.commands.unverify["SUCCESS_QUEUE"]
      );
    } else {
      if (ctx.bot.master.queue.has(`${ctx.guild.id}/${member.id}`))
        ctx.bot.master.queue.delete(`${ctx.guild.id}/${member.id}`);

      for (let key in ctx.bot.settings.successRoles) {
        member.removeRole(ctx.bot.settings.successRoles[key]);
      }

      await ctx.channel.createMessage(
        ctx.bot.strings.commands.unverify["SUCCESS"]
      );
    }

    ctx.guild.members.clear();
  }
}
