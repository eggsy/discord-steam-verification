import { Event } from "../structures";
import consola from "consola";
import Bot from "../util/bot";

export default class VerificationPassedEvent extends Event {
  name = "verificationPassed";

  async execute(id: string, bot: Bot) {
    if (!bot.master.queue.has(id)) return;

    const server = await bot.guilds.get(id.split("/")[0]),
      user = await server.members.get(id.split("/")[1]);

    bot.settings.successRoles.map(async (r) => {
      try {
        const role = server.roles.get(r);

        if (role) user.addRole(role.id);
        else if (!role)
          consola.error(
            `Role with ID ${r} not found, please remove it from your config.`
          );
      } catch (err) {
        consola.error(err);
      }
    });

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
  }
}
