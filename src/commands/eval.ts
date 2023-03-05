import { inspect } from "util";
import { Params } from "types/bot";
import { Command } from "@/structures";

export default class EvalCommand extends Command {
  name = "eval";
  description = "Runs JavaScript code.";
  aliases = ["ev"];
  usage = "eval this";
  requiredPerms = ["administrator"];

  async execute(ctx: Params) {
    if (!ctx.args.length)
      return ctx.channel
        .createMessage(
          ctx.bot.strings.errors.commands.common[
            "WRONG_USAGE"
          ].replace(/\{0\}/g, this.usage)
        )
        .then((m) =>
          setTimeout(() => {
            m.delete();
            ctx.message.delete();
          }, 3000)
        )
        .catch(null);

    const script = ctx.args.join(" ");
    const isAsync = script.includes("return") || script.includes("await");

    try {
      let result = eval(isAsync ? `(async()=>{${script}})();` : script);
      if ((result as any) instanceof Promise) result = await result;

      result = inspect(result, { depth: 0 }).substring(0, 1900);
      result = result.replaceAll(ctx.bot.token, "***");

      return ctx.channel.createMessage(
        ctx.bot.strings.commands.eval["OUTPUT"].replace(
          /\{0\}/g,
          "```js\n" + result + "```"
        )
      );
    } catch (error) {
      return ctx.channel
        .createMessage(
          ctx.bot.strings.errors.commands.eval["ERROR"].replace(
            /\{0\}/g,
            "```js\n" + error + "```"
          )
        )
        .catch(null);
    }
  }
}
