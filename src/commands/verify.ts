import { Params } from "types/bot";
import { Command } from "@/structures";
import { useReplacer } from "@/functions/replacer";

export default class VerifyCommand extends Command {
  name = "verify";
  description =
    "Removes the ALL current roles and starts verification process on a user.";
  aliases = ["rv", "reverify"];
  usage = "verify <@user|user_id>";
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

    const removed: string[] = [],
      notremoved: string[] = [];

    for (let key in member.roles) {
      const role = ctx.guild.roles.get(member.roles[key]);

      try {
        await member.removeRole(role.id);
        removed.push(role.name);
      } catch (err) {
        notremoved.push(role.name);
      }
    }

    if (!member.roles.length || (!notremoved.length && removed.length)) {
      ctx.bot.startVerification(ctx.guild, member);
      await ctx.channel.createMessage(
        ctx.bot.strings.commands.verify["SUCCESS"]
      );
    } else if (!removed.length && notremoved.length)
      await ctx.channel.createMessage(
        useReplacer(
          ctx.bot.strings.errors.commands.verify["COULDNT_REMOVE_ROLES"],
          [notremoved.map((r) => "`" + r + "`").join(", ")]
        )
      );
    else if (removed.length && notremoved.length)
      await ctx.channel.createMessage(
        useReplacer(
          ctx.bot.strings.errors.commands.verify["PARTIALLY_REMOVED"],
          [
            removed.map((r) => "`" + r + "`").join(", "),
            notremoved.map((r) => "`" + r + "`").join(", "),
          ]
        )
      );
    else ctx.message.addReaction("⛔");

    ctx.guild.members.clear();
  }
}
