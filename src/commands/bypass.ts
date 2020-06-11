import { Command } from "../structures";
import { Params } from "../../@types/bot/index";

export default class BypassCommand extends Command {
  name = "bypass";
  description = "Bypasses a user and gives them the success roles.";
  aliases = ["bp"];
  usage = "bypass <@user|user_id>";
  requiredPerms = ["banMembers"];

  async execute(ctx: Params) {
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
    else if (!ctx.bot.master.queue.has(`${ctx.guild.id}/${member.id}`))
      return ctx.channel.createMessage(
        ctx.bot.master.strings.bot.errors.commands.common["NOT_IN_QUEUE"]
      );
    else {
      const notAdded: string[] = [];
      ctx.bot.settings.successRoles.map((r) => {
        try {
          member.addRole(r);
        } catch (err) {
          notAdded.push(ctx.guild.roles.get(r).name);
        }
      });

      if (notAdded.length === ctx.bot.settings.successRoles.length)
        return ctx.channel.createMessage(
          ctx.bot.master.strings.bot.errors.commands.bypass["NO_ROLES_ADDED"]
        );
      else if (
        notAdded.length &&
        notAdded.length < ctx.bot.settings.successRoles.length
      ) {
        await ctx.bot.stopVerification(member, ctx.author, true);
        ctx.channel.createMessage(
          ctx.bot.master.strings.bot.errors.commands.bypass[
            "PARTIALLY_ADDED"
          ].replace(/\{0\}/g, notAdded.map((r) => `${r}`).join(", "))
        );
      } else {
        const removed = await ctx.bot.stopVerification(member, ctx.author);

        if (!removed)
          ctx.channel.createMessage(
            ctx.bot.master.strings.bot.errors.commands.bypass[
              "COULDNT_REMOVE_QUEUE"
            ]
          );

        ctx.channel.createMessage(
          ctx.bot.master.strings.bot.commands.bypass["SUCCESS"]
        );
      }
    }
  }
}
