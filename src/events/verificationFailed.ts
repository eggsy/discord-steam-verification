import { Event } from "../structures";
import consola from "consola";
import Bot from "../util/bot";

export default class VerificationFailedEvent extends Event {
  name = "verificationFailed";

  async execute(id: string, bot: Bot) {
    if (!bot.master.queue.has(id.split("/").slice(0, 2).join("/"))) return;

    const server = await bot.guilds.get(id.split("/")[0]),
      user = await server.members.get(id.split("/")[1]),
      usedAcc = id.split("/")[2];

    if (!usedAcc)
      consola.error(
        `Verification failed for user (app isn't found on their library): ${user.username}`
      );
    else
      consola.error(
        `User ${user.username} tried to use the same Steam account that has been used before.`
      );

    try {
      if (bot.settings.failureAction !== 0) {
        const dmChannel = await user.user.getDMChannel();
        bot.createMessage(
          dmChannel.id,
          !usedAcc
            ? bot.master.strings.bot.events.verificationFailed[
                "FAILED_PRIVATE_MESSAGE"
              ]
            : bot.master.strings.bot.events.verificationFailed[
                "FAILED_PM_SAME_ACCOUNT"
              ]
        );
      }
    } catch (err) {
      consola.error("Couldn't DM to the user.");
    }

    if (bot.settings.logChannel.id) {
      bot.settings.logChannel.channel.createMessage(
        !usedAcc
          ? bot.master.strings.bot.events.verificationFailed[
              "FAILED_LOG_MESSAGE"
            ]
              .replace(/\{0\}/g, user.mention)
              .replace(/\{1\}/g, user.username)
              .replace(/\{2\}/g, user.id)
          : bot.master.strings.bot.events.verificationFailed[
              "FAILED_SAME_ACCOUNT_LOG"
            ]
              .replace(/\{0\}/g, user.mention)
              .replace(/\{1\}/g, user.username)
              .replace(/\{2\}/g, user.id)
      );

      switch (bot.settings.failureAction) {
        case 1:
          user.kick(
            bot.master.strings.bot.events.verificationFailed[
              "AUDIT_LOG_REASON_KICK"
            ]
          );
          break;
        case 2:
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
