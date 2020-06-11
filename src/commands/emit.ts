import { Params } from "../../@types/bot/index";
import { Command } from "../structures";

export default class EmitCommand extends Command {
  name = "emit";
  description = "Emits guildMemberAdd for testing.";
  aliases = ["e", "verifyself", "vs"];
  usage = "emit";

  execute(ctx: Params) {
    ctx.bot.emit("guildMemberAdd", ctx.author);
  }
}
