import { Event } from "@/structures";
import consola from "consola";
import Bot from "@/util/bot";

export default class VerificationFailedEvent extends Event {
  name = "verificationFailed";

  async execute(id: string, bot: Bot) {
    const [serverId, userId, usedAcc] = id.split("/");

    if (!bot.master.queue.has(`${serverId}/${userId}`)) return;

    const server = bot.guilds.get(serverId),
      user = await server
        .fetchMembers({
          presences: false,
          userIDs: [userId],
        })
        .then((u) => u[0]);

    if (!usedAcc)
      consola.warn(
        `Verification failed for user (app isn't found on their library): ${user.username}`
      );
    else
      consola.warn(
        `User ${user.username} tried to use the same Steam account that has been used before.`
      );

    try {
      if (bot.settings.failureAction === "NONE") return;

      const dmChannel = await user.user.getDMChannel();

      await bot.createMessage(
        dmChannel.id,
        !usedAcc
          ? bot.master.strings.bot.events.verificationFailed[
              "FAILED_PRIVATE_MESSAGE"
            ]
          : bot.master.strings.bot.events.verificationFailed[
              "FAILED_PM_SAME_ACCOUNT"
            ]
      );
    } catch (err) {
      consola.error("Couldn't DM to the user.");
    }

    if (bot.settings.logChannel.id) {
      bot.settings.logChannel.channel.createMessage(
        !usedAcc
          ? bot.master.strings.bot.events.verificationFailed[
              "FAILED_LOG_MESSAGE"
            ]
              .replaceAll("{0}", user.mention)
              .replaceAll("{1}", user.username)
              .replaceAll("{2}", user.id)
          : bot.master.strings.bot.events.verificationFailed[
              "FAILED_SAME_ACCOUNT_LOG"
            ]
              .replaceAll(/\{0\}/g, user.mention)
              .replaceAll(/\{1\}/g, user.username)
              .replaceAll(/\{2\}/g, user.id)
      );

      switch (bot.settings.failureAction) {
        case "KICK":
          user
            .kick(
              bot.master.strings.bot.events.verificationFailed[
                "AUDIT_LOG_REASON_KICK"
              ]
            )
            .catch(() => {});
          break;
        case "BAN":
          user
            .ban(
              null,
              bot.master.strings.bot.events.verificationFailed[
                "AUDIT_LOG_REASON_BAN"
              ]
            )
            .catch(() => {});
          break;
      }
    }

    server.members.clear();
  }
}
