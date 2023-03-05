import { Embed } from "eris";
import { Params } from "types/bot";
import { Command } from "@/structures";

export default class ImportCommand extends Command {
  name = "info";
  description = "Shows verification information of the current server.";
  aliases = ["inf", "information"];
  usage = "info";

  execute(ctx: Params) {
    const embed: Embed = {
      type: "embed",
      fields: [
        {
          name: ctx.bot.strings.commands.info.embed.fields.QUEUE,
          value: String(ctx.bot?.master?.queue?.size || 0),
        },
        {
          name: ctx.bot.strings.commands.info.embed.fields.VERIFIED,
          value: String(ctx.bot?.master?.usedAccounts?.length || 0),
        },
      ],
      footer: {
        icon_url: ctx.bot.user?.avatarURL || null,
        text: ctx.bot.strings.commands.common.embed.NOT_AFILLIATED,
      },
    };

    ctx.channel.createMessage({
      content: ctx.bot.strings.commands.info.embed.MESSAGE,
      embed,
    });
  }
}
