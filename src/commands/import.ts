import { Params } from "../../@types/bot/index";
import { Command } from "../structures";

export default class ImportCommand extends Command {
  name = "import";
  description = "Imports the older backup so you can have your data back.";
  aliases = ["imp", "load"];
  usage = "import";
  requiredPerms = ["administrator"];

  execute(ctx: Params) {
    ctx.bot.backupOrImport(false, ctx.channel);
  }
}
