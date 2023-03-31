import { Client, Member, Guild, TextChannel } from "eris";
import { Command, Event, Master } from "@/structures";
import { BotSettings } from "types/bot";
import config from "@/config";
import { join } from "path";
import BotStrings from "@/strings/bot";
import consola from "consola";
import { useReplacer } from "@/functions/replacer";
import {
  readdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from "fs";

export default class Bot extends Client {
  name: string;
  prefix: string;
  token: string;
  master: Master;
  ready: boolean = false;
  strings: typeof BotStrings;
  commands: Map<string, Command> = new Map();
  settings: BotSettings = {
    enabled: true,
    servers: [],
    successRoles: [],
    failureAction: "NONE",
  };

  constructor(master: Master) {
    super(process.env.BOT_TOKEN, {
      maxReconnectAttempts: 3,
      disableEvents: {
        CHANNEL_CREATE: true,
        CHANNEL_DELETE: true,
        CHANNEL_UPDATE: true,
        GUILD_BAN_ADD: true,
        GUILD_BAN_REMOVE: true,
        GUILD_DELETE: true,
        GUILD_ROLE_CREATE: true,
        GUILD_ROLE_DELETE: true,
        GUILD_ROLE_UPDATE: true,
        MESSAGE_UPDATE: true,
        PRESENCE_UPDATE: true,
        TYPING_START: true,
        VOICE_STATE_UPDATE: true,
      },
      allowedMentions: {
        everyone: false,
      },
      intents: ["directMessages", "guildMessages", "guilds", "guildMembers"],
    });

    this.master = master;
    this.name = config.name;
    this.prefix = config.prefix;

    this.settings.successRoles = config.roles;
    this.settings.failureAction = config.failureAction;
    this.settings.logChannel = { id: config.logChannel, channel: null };
    this.settings.backup = config.backup;
    this.token = process.env.BOT_TOKEN;

    this.strings = master.strings.bot;

    if (this.settings.backup.auto && this.settings.backup.interval)
      setInterval(() => this.backup(), 1000 * this.settings.backup.interval);

    this.loadCommands();
    this.loadEvents();

    this.run();
  }

  async run() {
    consola.info("Bot is starting...");

    if (this.settings.backup.auto) this.import();
    this.connect();
  }

  loadCommands() {
    try {
      const files = readdirSync(join(__dirname, "/commands"));

      files.forEach((name: any) => {
        if (name.endsWith(".map")) return;

        const command: Command = new (require(join(
          __dirname,
          `./commands/${name}`
        )).default)();

        this.commands.set(command.name || name, command);

        for (let alias of command.aliases) {
          this.commands.set(alias, command);
        }
      });
    } catch (err) {
      consola.error(err);
    }
  }

  loadEvents() {
    const files = readdirSync(join(__dirname, "/events"));

    files.forEach((name: any) => {
      if (name.endsWith(".map")) return;

      const event: Event = new (require(join(
        __dirname,
        `/events/${name}`
      )).default)();

      this.on(event.name || name, (...keys: string[]) =>
        event.execute(...keys, this)
      );
    });
  }

  async startVerification(guild: Guild, member: Member): Promise<boolean> {
    if (this.master.queue.has(`${guild.id}/${member.id}`)) return false;

    this.master.queue.set(`${guild.id}/${member.id}`, {
      startedAt: Date.now(),
      server: {
        id: guild.id,
        name: guild.name,
      },
      user: {
        name: member.username,
        id: member.id,
      },
    });

    consola.info(`Starting verification for: ${member.username}`);

    this.settings.logChannel?.channel?.createMessage(
      useReplacer(this.master.strings.bot.info["VERIFICATION_STARTING"], [
        member.mention,
        member.username,
        member.id,
      ])
    );

    const dmChannel = await member.user.getDMChannel();

    if (!dmChannel) {
      this.master.queue.delete(`${guild.id}/${member.id}`);
      this.settings.logChannel?.channel?.createMessage(
        useReplacer(this.master.strings.bot.info["USER_DMS_DISABLED"], [
          member.mention,
          member.username,
          member.id,
        ])
      );

      return false;
    }

    try {
      await this.createMessage(
        dmChannel.id,
        useReplacer(
          this.master.strings.bot.info["VERIFICATION_PRIVATE_MESSAGE"],
          [
            member.username,
            guild.name,
            `<${process.env.HOST}/verify/${guild.id}/${member.id}>`,
          ]
        )
      );

      return true;
    } catch (err) {
      this.master.queue.delete(`${guild.id}/${member.id}`);

      await this.settings.logChannel.channel.createMessage(
        useReplacer(this.master.strings.bot.info["USER_DMS_DISABLED"], [
          member.mention,
          member.username,
          member.id,
        ])
      );

      return false;
    }
  }

  async stopVerification(
    member: Member,
    author: Member,
    partial: boolean = false
  ): Promise<boolean> {
    if (!this.master.queue.has(`${member.guild.id}/${member.user.id}`))
      return false;

    this.master.queue.delete(`${member.guild.id}/${member.user.id}`);

    consola.info(
      `User ${member.user.username} has been bypassed verification by ${author.user.username}`
    );

    if (this.settings.logChannel.id && author)
      this.settings.logChannel.channel.createMessage(
        useReplacer(this.master.strings.bot.info["VERIFICATION_BYPASSED"], [
          member.username,
          author.username,
        ])
      );

    const dmChannel = await member.user.getDMChannel();

    await this.createMessage(
      dmChannel.id,
      useReplacer(
        this.master.strings.bot.info["VERIFICATION_BYPASSED_PM"]["FIRST"],
        [author.username, member.guild.name]
      ) + partial
        ? this.master.strings.bot.info["VERIFICATION_BYPASSED_PM"]["SECOND"]
        : ""
    );

    return true;
  }

  backup(channel: TextChannel = null) {
    const filePath = join(
      __dirname,
      this.settings.backup.path && this.settings.backup.path.endsWith(".json")
        ? useReplacer(this.settings.backup.path, [
            this.name.split(" ").join("_"),
          ])
        : `../DSV_backup_${this.name.split(" ").join("_")}.json`
    );

    if (!this.master.queue.size && !this.master.usedAccounts.length) {
      channel?.createMessage(
        this.master.strings.bot.errors.commands.export["NOTHING_TO_EXPORT"]
      );
      return;
    }

    try {
      if (existsSync(filePath)) unlinkSync(filePath);

      const dataObj = {
        queue: [],
        usedAccounts: this.master.usedAccounts || [],
      };

      this.master.queue.forEach((r) => dataObj.queue.push(r));

      consola.info(`Creating a backup to: ${filePath}`);

      writeFileSync(filePath, JSON.stringify(dataObj));

      if (channel)
        return channel.createMessage(
          useReplacer(this.master.strings.bot.commands.export["SUCCESS"], [
            filePath,
          ])
        );
    } catch (err) {
      if (channel)
        return channel.createMessage(
          useReplacer(
            this.master.strings.bot.errors.commands.export["PERMISSION_ERROR"],
            [filePath]
          )
        );
      else return consola.error(`Coulndn't create a backup to: ${filePath}`);
    }
  }

  import(channel: TextChannel = null) {
    const filePath = join(
      __dirname,
      this.settings.backup.path && this.settings.backup.path.endsWith(".json")
        ? useReplacer(this.settings.backup.path, [
            this.name.split(" ").join("_"),
          ])
        : `../DSV_backup_${this.name.split(" ").join("_")}.json`
    );

    try {
      if (!existsSync(filePath)) {
        channel?.createMessage(
          useReplacer(
            this.master.strings.bot.errors.commands.import["NO_BACKUP_FILE"],
            [filePath]
          )
        );
        return;
      }

      const file = JSON.parse(readFileSync(filePath, "utf-8"));

      const dataObj = {
        queue: file.queue,
        usedAccounts: file.usedAccounts,
      };

      if (!dataObj.queue.length && !dataObj.usedAccounts.length) {
        channel?.createMessage(
          this.master.strings.bot.errors.commands.import["NOTHING_TO_IMPORT"]
        );
        return;
      }

      dataObj.queue.forEach((r) =>
        this.master.queue.set(`${r.server.id}/${r.user.id}`, r)
      );
      this.master.usedAccounts = dataObj.usedAccounts;

      channel?.createMessage(
        useReplacer(this.master.strings.bot.commands.import["SUCCESS"], [
          String(this.master.queue.size),
          String(this.master.usedAccounts.length),
        ])
      );
    } catch (err) {
      if (channel) {
        channel.createMessage(
          useReplacer(
            this.master.strings.bot.errors.commands.import["PERMISSION_ERROR"],
            [filePath]
          )
        );
        return;
      } else consola.error(`Couldn't read the backup from: ${filePath}`);
    }
  }

  async reload(conn: boolean = true) {
    // Backup if auto backup is enabled
    if (this.settings.backup.auto) this.backup();

    this.disconnect({ reconnect: conn });
    this.commands.clear();
    this.run();
  }
}
