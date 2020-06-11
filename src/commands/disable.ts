import { Params } from "../../@types/bot/index";
import { Command } from "../structures";

export default class DisableCommand extends Command {
  name = "disable";
  description =
    "Disables bot's functioning and removes all users waiting for verification.";
  aliases = ["dsb"];
  usage = "disable";
  requiredPerms = ["administrator"];

  execute(ctx: Params) {
    if (!ctx.bot.settings.enabled)
      return ctx.channel.createMessage(
        ctx.bot.master.strings.bot.errors.commands.disable["ALREADY_DISABLED"]
      );
    else {
      ctx.bot.master.queue.clear();

      ctx.bot.editStatus("idle", { name: "disabled", type: 0 });
      ctx.bot.settings.enabled = false;

      ctx.channel.createMessage(
        ctx.bot.master.strings.bot.commands.disable["SUCCESS"]
      );
    }
  }
}
