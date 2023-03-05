import { Params } from "types/bot";
import { Command } from "@/structures";

export default class EnableCommand extends Command {
  name = "enable";
  description = "Enables bot and starts functioning.";
  aliases = ["enb"];
  usage = "enable";
  requiredPerms = ["administrator"];

  execute(ctx: Params) {
    if (ctx.bot.settings.enabled)
      return ctx.channel.createMessage(
        ctx.bot.strings.errors.commands.enable["ALREADY_ENABLED"]
      );
    else {
      ctx.bot.settings.enabled = true;

      ctx.bot.editStatus("online");
      ctx.channel.createMessage(
        ctx.bot.strings.commands.enable["SUCCESS"]
      );
    }
  }
}
