import { Params } from "../../@types/bot/index";
import { Command } from "../structures";

export default class HelpCommand extends Command {
  name = "help";
  description = "Bot's help command.";
  aliases = ["h"];
  usage = "help | help <command>";

  async execute(ctx: Params) {
    if (!ctx.args.length) {
      const added: string[] = [];
      let message: string = "";

      ctx.bot.commands.forEach((command: Command) => {
        if (added.includes(command.name)) return;

        message += `\`${command.name}\`: ${command.description}\n`;
        added.push(command.name);
      });

      ctx.message.channel.createMessage({
        embed: {
          title: ctx.bot.name,
          description: message,
          fields: [
            {
              name:
                ctx.bot.master.strings.bot.commands.help.embed.fields[
                  "MORE_INFORMATION"
                ]["title"],
              value: ctx.bot.master.strings.bot.commands.help.embed.fields[
                "MORE_INFORMATION"
              ]["value"].replace(/\{0\}/g, ctx.bot.prefix),
            },
          ],
          footer: {
            text:
              ctx.bot.master.strings.bot.commands.common.embed[
                "NOT_AFILLIATED"
              ],
            icon_url: ctx.bot.user.avatarURL,
          },
        },
      });
    } else {
      let command: string | Command = ctx.args[0];

      if (!ctx.bot.commands.has(command))
        return ctx.message.channel.createMessage(
          ctx.bot.master.strings.bot.errors.commands.help[
            "COMMAND_NOT_FOUND"
          ].replace(/\{0\}/g, command)
        );

      command = ctx.bot.commands.get(command);

      ctx.message.channel.createMessage({
        embed: {
          author: { name: `${command.name}` },
          description: command.description,
          fields: [
            {
              name:
                ctx.bot.master.strings.bot.commands.help.embed.fields["USAGE"][
                  "title"
                ],
              value: command.usage,
              inline: true,
            },
            {
              name:
                ctx.bot.master.strings.bot.commands.help.embed.fields[
                  "ALTERNATIVES"
                ]["title"],
              value: command.aliases.length
                ? command.aliases.join(", ")
                : ctx.bot.master.strings.bot.commands.help.embed.fields[
                    "ALTERNATIVES"
                  ]["value_NO_ALIASES"],
              inline: true,
            },
          ],
          footer: {
            text:
              ctx.bot.master.strings.bot.commands.common.embed[
                "NOT_AFILLIATED"
              ],
            icon_url: ctx.bot.user.avatarURL,
          },
        },
      });
    }
  }
}
