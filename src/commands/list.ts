import { Params } from "../../@types/bot/index";
import { Command } from "../structures";

export default class ListCommand extends Command {
  name = "list";
  description = "Shows the current users in verification list.";
  aliases = ["l"];
  usage = "list";
  requiredPerms = ["banMembers"];

  execute(ctx: Params) {
    if (!ctx.bot.master.queue.size)
      return ctx.channel.createMessage(
        ctx.bot.strings.errors.commands.list[
          "NO_USERS_IN_VERIFICATION"
        ]
      );

    const list: string[] = [];

    ctx.bot.master.queue.forEach((u) => {
      list.push(`${u.user.name} (\`${u.user.id}\`)`);
    });

    ctx.channel.createMessage({
      embed: {
        title: ctx.bot.strings.commands.list.embed.title,
        description: list.join(", "),
        fields: [
          {
            name:
              ctx.bot.strings.commands.list.embed.fields["TOTAL"]
                .title,
            value: String(ctx.bot.master.queue.size),
            inline: true,
          },
        ],
        footer: {
          text:
            ctx.bot.strings.commands.common.embed["NOT_AFILLIATED"],
          icon_url: ctx.bot.user.avatarURL,
        },
      },
    });
  }
}
