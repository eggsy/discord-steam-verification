import { Event } from "@/structures";
import consola from "consola";
import Bot from "@/util/bot";
import { TextChannel } from "eris";

export default class ReadyEvent extends Event {
  name = "ready";

  async execute(bot: Bot) {
    const channel = await bot.getChannel(bot.settings.logChannel.id);

    if (channel && channel.type !== 0)
      consola.error(
        "Log channel set to non-text channel. Please set it to a text channel and restart the bot."
      );
    else if (!channel)
      return consola.error(
        "Log channel couldn't be found. Please make sure you have set a log channel."
      );
    else bot.settings.logChannel.channel = channel as TextChannel;

    bot.settings.servers = bot.guilds.map((s) => s.id);
    bot.ready = true;

    consola.success(`Bot is ready.`);
  }
}
