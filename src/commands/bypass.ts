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
    else if (!ctx.bot.master.queue.has(`${ctx.guild.id}/${member.id}`))
      return ctx.channel.createMessage(
        ctx.bot.strings.errors.commands.common["NOT_IN_QUEUE"]
      );
    else {
      const notAdded: string[] = [];

      for (let key in ctx.bot.settings.successRoles) {
        const role = ctx.guild.roles.get(ctx.bot.settings.successRoles[key]);

        try {
          await member.addRole(role.id);
        } catch (err) {
          notAdded.push(role.name);
        }
      }

      if (notAdded.length === ctx.bot.settings.successRoles.length)
        return ctx.channel.createMessage(
          ctx.bot.strings.errors.commands.bypass["NO_ROLES_ADDED"]
        );
      else if (
        notAdded.length &&
        notAdded.length < ctx.bot.settings.successRoles.length
      ) {
        await ctx.bot.stopVerification(member, ctx.author, true);
        ctx.channel.createMessage(
          ctx.bot.strings.errors.commands.bypass[
            "PARTIALLY_ADDED"
          ].replace(/\{0\}/g, notAdded.map((r) => "`" + r + "`").join(", "))
        );
      } else {
        const removed = await ctx.bot.stopVerification(member, ctx.author);

        if (!removed)
          ctx.channel.createMessage(
            ctx.bot.strings.errors.commands.bypass[
              "COULDNT_REMOVE_QUEUE"
            ]
          );

        ctx.channel.createMessage(
          ctx.bot.strings.commands.bypass["SUCCESS"]
        );
      }
    }
  }
}
