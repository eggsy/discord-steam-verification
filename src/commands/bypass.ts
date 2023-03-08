import { useReplacer } from "@/functions/replacer";
import { Command } from "@/structures";
import { Params } from "types/bot";

export default class BypassCommand extends Command {
  name = "bypass";
  description = "Bypasses a user and gives them the success roles.";
  aliases = ["bp"];
  usage = "bypass <@user|user_id>";
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

    if (!ctx.bot.master.queue.has(`${ctx.guild.id}/${member.id}`))
      await ctx.channel.createMessage(
        ctx.bot.strings.errors.commands.common["NOT_IN_QUEUE"]
      );
    else {
      const notAdded = [];

      for (const roleId of ctx.bot.settings.successRoles) {
        const role = ctx.guild.roles.get(roleId);

        try {
          await member.addRole(role.id);
        } catch (err) {
          notAdded.push(role.name);
        }
      }

      if (notAdded.length === ctx.bot.settings.successRoles.length)
        await ctx.channel.createMessage(
          ctx.bot.strings.errors.commands.bypass["NO_ROLES_ADDED"]
        );
      else if (
        notAdded.length &&
        notAdded.length < ctx.bot.settings.successRoles.length
      ) {
        await ctx.bot.stopVerification(member, ctx.author, true);
        await ctx.channel.createMessage(
          useReplacer(
            ctx.bot.strings.errors.commands.bypass["PARTIALLY_ADDED"],
            [notAdded.join(", ")]
          )
        );
      } else {
        const removed = await ctx.bot.stopVerification(member, ctx.author);

        if (!removed)
          await ctx.channel.createMessage(
            ctx.bot.strings.errors.commands.bypass["COULDNT_REMOVE_QUEUE"]
          );

        await ctx.channel.createMessage(
          ctx.bot.strings.commands.bypass["SUCCESS"]
        );
      }
    }

    ctx.guild.members.clear();
  }
}
