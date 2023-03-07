import { Event, Command } from "@/structures";
import { TextChannel, Guild, Message, Constants } from "eris";
import Bot from "@/util/bot";

export default class MessageEvent extends Event {
  name = "messageCreate";

  execute(message: Message, bot: Bot) {
    if (
      message.channel.type !== 0 ||
      message.author.bot ||
      !message.content.startsWith(bot.prefix)
    )
      return;

    const command: string = message.content
      .substring(bot.prefix.length)
      .split(" ")[0];
    const args: string[] = message.content.split(" ").slice(1);

    if (bot.commands.has(command)) {
      const cmd: Command = bot.commands.get(command);

      if (cmd.requiredPerms) {
        let noPerm: number = 0;

        cmd.requiredPerms.forEach((perm: keyof Constants["Permissions"]) => {
          if (!message.member.permissions.has(perm)) noPerm++;
        });

        if (noPerm > 0) return message.addReaction("⛔");
      }

      const channel: TextChannel = message.channel;
      const guild: Guild = channel.guild;

      cmd.execute({
        client: bot,
        args: args,
        message: message,
        author: message.member,
        guild: guild,
        channel: channel,
        bot: bot,
      });
    }
  }
}
