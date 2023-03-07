import { Event } from "@/structures";
import consola from "consola";
import Bot from "@/util/bot";

export default class VerificationPassedEvent extends Event {
  name = "verificationPassed";

  async execute(id: string, bot: Bot) {
    const [serverId, userId] = id.split("/");

    if (!bot.master.queue.has(`${serverId}/${userId}`)) return;

    const server = bot.guilds.get(serverId),
      user = await server
        .fetchMembers({
          presences: false,
          userIDs: [userId],
        })
        .then((u) => u[0]);

    for (let key in bot.settings.successRoles) {
      try {
        const role = server.roles.get(bot.settings.successRoles[key]);
        if (role) await user.addRole(role.id);
        else
          consola.error(
            `Role with ID ${bot.settings.successRoles[key]} not found, please remove it from your config.`
          );
      } catch (err) {
        consola.error(
          `Couldn't add the role (${bot.settings.successRoles[key]}) to the user ${user.username}.`
        );
      }
    }

    consola.success(`User has passed verification: ${user.username}`);

    try {
      const dmChannel = await user.user.getDMChannel();
      bot.createMessage(
        dmChannel.id,
        bot.master.strings.bot.events.verificationPassed[
          "SUCCESS_PRIVATE_MESSAGE"
        ]
      );

      // Send the information to log channel if set
      if (bot.settings.logChannel.id)
        bot.settings.logChannel.channel.createMessage(
          bot.master.strings.bot.events.verificationPassed[
            "SUCCESS_LOG_MESSAGE"
          ].replace(/\{0\}/g, user.user.username)
        );
    } catch (err) {
      consola.error(err);
    }

    server.members.clear();
  }
}
