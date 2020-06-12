import { Params } from "../../@types/bot/index";
import { Command } from "../structures";

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
      ctx.channel.createMessage(
        ctx.bot.master.strings.bot.commands.verify["SUCCESS"]
      );
    } else if (!removed.length && notremoved.length)
      return ctx.channel.createMessage(
        ctx.bot.master.strings.bot.errors.commands.verify[
          "COULDNT_REMOVE_ROLES"
        ].replace(/\{0\}/g, notremoved.map((r) => "`" + r + "`").join(", "))
      );
    else if (removed.length && notremoved.length)
      return ctx.channel.createMessage(
        ctx.bot.master.strings.bot.errors.commands.verify["PARTIALLY_REMOVED"]
          .replace(/\{0\}/g, removed.map((r) => "`" + r + "`").join(", "))
          .replace(/\{1\}/g, notremoved.map((r) => "`" + r + "`").join(", "))
      );
    else return ctx.message.addReaction("⛔");
  }
}
