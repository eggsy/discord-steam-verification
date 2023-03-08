import { Params } from "types/bot";
import { Command } from "@/structures";
import { useReplacer } from "@/functions/replacer";

export default class HelpCommand extends Command {
  name = "help";
  description = "Bot's help command.";
  aliases = ["h"];
  usage = "help | help <command>";

  async execute(ctx: Params) {
    if (!ctx.args.length) {
      const added: string[] = [];

      let message: string = "",
        longestName: string = "";

      ctx.bot.commands.forEach((command: Command) => {
        if (command.name.length > longestName.length)
          longestName = command.name;
      });

      ctx.bot.commands.forEach((command: Command) => {
        if (added.includes(command.name)) return;

        message += `\`${command.name}${
          command.name.length < longestName.length
            ? " ".repeat(longestName.length - command.name.length)
            : ""
        }\` - ${command.description}\n`;
        added.push(command.name);
      });

      await ctx.message.channel.createMessage({
        embed: {
          title: ctx.bot.name,
          description: message,
          fields: [
            {
              name: ctx.bot.strings.commands.help.embed.fields[
                "MORE_INFORMATION"
              ]["title"],
              value: useReplacer(
                ctx.bot.strings.commands.help.embed.fields["MORE_INFORMATION"][
                  "value"
                ],
                [ctx.bot.prefix]
              ),
            },
          ],
          footer: {
            text: ctx.bot.strings.commands.common.embed["NOT_AFILLIATED"],
            icon_url: ctx.bot.user.avatarURL,
          },
        },
      });
    } else {
      let command: string | Command = ctx.args[0];

      if (!ctx.bot.commands.has(command))
        return ctx.message.channel.createMessage(
          useReplacer(
            ctx.bot.strings.errors.commands.help["COMMAND_NOT_FOUND"],
            [command]
          )
        );

      command = ctx.bot.commands.get(command);

      await ctx.message.channel.createMessage({
        embed: {
          author: { name: `${command.name}` },
          description: command.description,
          fields: [
            {
              name: ctx.bot.strings.commands.help.embed.fields["USAGE"][
                "title"
              ],
              value: command.usage,
              inline: true,
            },
            {
              name: ctx.bot.strings.commands.help.embed.fields["ALTERNATIVES"][
                "title"
              ],
              value: command.aliases.length
                ? command.aliases.join(", ")
                : ctx.bot.strings.commands.help.embed.fields["ALTERNATIVES"][
                    "value_no_aliases"
                  ],
              inline: true,
            },
          ],
          footer: {
            text: ctx.bot.strings.commands.common.embed["NOT_AFILLIATED"],
            icon_url: ctx.bot.user.avatarURL,
          },
        },
      });
    }
  }
}
