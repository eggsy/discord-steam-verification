import { inspect } from "util";
import { Params } from "types/bot";
import { Command } from "@/structures";
import { useReplacer } from "@/functions/replacer";

export default class EvalCommand extends Command {
  name = "eval";
  description = "Runs JavaScript code.";
  aliases = ["ev"];
  usage = "eval this";
  requiredPerms = ["administrator"];

  async execute(ctx: Params) {
    if (!ctx.args.length) {
      ctx.channel
        .createMessage(
          useReplacer(ctx.bot.strings.errors.commands.common["WRONG_USAGE"], [
            this.usage,
          ])
        )
        .then((m) =>
          setTimeout(() => {
            m.delete();
            ctx.message.delete();
          }, 3000)
        )
        .catch(null);

      return;
    }

    const script = ctx.args.join(" ");
    const isAsync = script.includes("return") || script.includes("await");

    try {
      let result = eval(isAsync ? `(async()=>{${script}})();` : script);
      if (result instanceof Promise) result = await result;

      result = inspect(result, { depth: 0 }).substring(0, 1900);
      result = result.replaceAll(ctx.bot.token, "***");

      ctx.channel.createMessage(
        useReplacer(ctx.bot.strings.commands.eval["OUTPUT"], [
          "```js\n" + result + "```",
        ])
      );
    } catch (error) {
      await ctx.channel
        .createMessage(
          useReplacer(ctx.bot.strings.errors.commands.eval["ERROR"], [
            "```js\n" + error + "```",
          ])
        )
        .catch(null);
    }
  }
}
