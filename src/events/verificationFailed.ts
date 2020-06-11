import { Event } from "../structures";
import consola from "consola";
import Bot from "../util/bot";

export default class VerificationFailedEvent extends Event {
  name = "verificationFailed";

  async execute(id: string, bot: Bot) {
    if (!bot.master.queue.has(id)) return;

    const server = await bot.guilds.get(id.split("/")[0]),
      user = await server.members.get(id.split("/")[1]);

    consola.error(
      `Verification failed for user (app isn't found on their library): ${user.user.username}`
    );

    try {
      if (bot.settings.failureAction !== "NONE") {
        const dmChannel = await user.user.getDMChannel();
        bot.createMessage(
          dmChannel.id,
          bot.master.strings.bot.events.verificationFailed[
            "FAILED_PRIVATE_MESSAGE"
          ]
        );
      }
    } catch (err) {
      consola.error("Couldn't DM to the user.");
    }

    if (bot.settings.logChannel.id) {
      bot.settings.logChannel.channel.createMessage(
        bot.master.strings.bot.events.verificationFailed["FAILED_LOG_MESSAGE"]
          .replace(/\{0\}/g, user.mention)
          .replace(/\{1\}/g, `${user.user.username} - ${user.user.id}`)
      );

      switch (bot.settings.failureAction) {
        case "KICK":
          user.kick(
            bot.master.strings.bot.events.verificationFailed[
              "AUDIT_LOG_REASON_KICK"
            ]
          );
          break;
        case "BAN":
          user.ban(
            null,
            bot.master.strings.bot.events.verificationFailed[
              "AUDIT_LOG_REASON_BAN"
            ]
          );
          break;
        default:
          break;
      }
    }
  }
}
