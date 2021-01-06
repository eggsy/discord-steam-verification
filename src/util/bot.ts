import { Client, Member, Guild, TextChannel } from "eris";
import { Command, Event, Master } from "../structures";
import { BotSettings } from "../../@types/bot";
import { Config } from "../config";
import { resolve } from "path";
import consola from "consola";

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
  master: Master;
  ready: boolean = false;
  strings: BotStrings;
  commands: Map<string, Command> = new Map();
  settings: BotSettings = {
    enabled: true,
    servers: [],
    successRoles: [],
    failureAction: 0,
    logChannel: { id: undefined, channel: null },
    backup: {
      auto: false,
      interval: 600,
      path: "../DSV_Backup_{0}.json",
    },
  };

  constructor(config: Config, master: Master) {
    super(config.token, {
      reconnectAttempts: 3,
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
    });

    this.master = master;
    this.name = config.name;
    this.prefix = config.prefix;

    this.settings.successRoles = config.roles;
    this.settings.failureAction = config.failureAction;
    this.settings.logChannel.id = config.logChannel;
    this.settings.backup = config.backup;

    this.strings = master.strings.bot;

    if (this.settings.backup.auto && this.settings.backup.interval)
      setInterval(
        () => this.backupOrImport(),
        1000 * this.settings.backup.interval
      );

    this.loadCommands();
    this.loadEvents();

    this.run();
  }

  async run() {
    consola.info("Bot is starting...");

    if (this.settings.backup.auto) this.backupOrImport(false);
    this.connect();
  }

  loadCommands() {
    try {
      const files = readdirSync(resolve("./commands"));

      files.forEach((name: any) => {
        if (name.endsWith(".map")) return;

        const command: Command = new (require(resolve(
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
    const files = readdirSync(resolve("./events"));

    files.forEach((name: any) => {
      if (name.endsWith(".map")) return;

      const event: Event = new (require(resolve(`./events/${name}`)).default)();

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

    if (this.settings.logChannel.id)
      this.settings.logChannel.channel.createMessage(
        this.master.strings.bot.info["VERIFICATION_STARTING"]
          .replace(/\{0\}/g, member.mention)
          .replace(/\{1\}/g, member.username)
          .replace(/\{2\}/g, member.id)
      );

    const dmChannel = await member.user.getDMChannel();
    if (!dmChannel) {
      this.master.queue.delete(`${guild.id}/${member.id}`);
      this.settings.logChannel.channel.createMessage(
        this.master.strings.bot.info["USER_DMS_DISABLED"]
          .replace(/\{0\}/g, member.mention)
          .replace(/\{1\}/g, member.username)
          .replace(/\{2\}/g, member.id)
      );
      return false;
    }

    try {
      await this.createMessage(
        dmChannel.id,
        this.master.strings.bot.info["VERIFICATION_PRIVATE_MESSAGE"]
          .replace(/\{0\}/g, member.username)
          .replace(/\{1\}/g, guild.name)
          .replace(
            /\{2\}/g,
            `${process.env.HOST}/verify/${guild.id}/${member.id}`
          )
      );

      return true;
    } catch (err) {
      this.master.queue.delete(`${guild.id}/${member.id}`);
      await this.settings.logChannel.channel.createMessage(
        this.master.strings.bot.info["USER_DMS_DISABLED"]
          .replace(/\{0\}/g, member.mention)
          .replace(/\{1\}/g, member.username)
          .replace(/\{2\}/g, member.id)
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
      `User ${member.user.username} has bypassed verification by ${author.user.username}`
    );

    if (this.settings.logChannel.id && author)
      this.settings.logChannel.channel.createMessage(
        this.master.strings.bot.info["VERIFICATION_BYPASSED"]
          .replace(/\{0\}/g, member.user.username)
          .replace(/\{1\}/g, author.user.username)
      );

    const dmChannel = await member.user.getDMChannel();
    this.createMessage(
      dmChannel.id,
      `${this.master.strings.bot.info["VERIFICATION_BYPASSED_PM"]["FIRST"]
        .replace(/\{0\}/g, author.user.username)
        .replace(/\{1\}/g, member.guild.name)} ${
        partial
          ? this.master.strings.bot.info["VERIFICATION_BYPASSED_PM"]["SECOND"]
          : ""
      }`
    );
    return true;
  }

  backupOrImport(backup: boolean = true, channel: TextChannel = null) {
    const filePath = resolve(
      this.settings.backup.path && this.settings.backup.path.endsWith(".json")
        ? this.settings.backup.path.replace(
            /\{0\}/g,
            this.name.split(" ").join("_")
          )
        : `../DSV_backup_${this.name.split(" ").join("_")}.json`
    );

    if (backup) {
      if (!this.master.queue.size && !this.master.usedAccounts.length)
        return channel
          ? channel.createMessage(
              this.master.strings.bot.errors.commands.export[
                "NOTHING_TO_EXPORT"
              ]
            )
          : false;

      try {
        if (existsSync(filePath)) unlinkSync(filePath);

        const dataObj = {
          queue: [],
          usedAccounts: this.master.usedAccounts || [],
        };

        this.master.queue.forEach((r) => dataObj.queue.push(r));

        writeFileSync(filePath, JSON.stringify(dataObj));

        if (channel)
          return channel.createMessage(
            this.master.strings.bot.commands.export["SUCCESS"].replace(
              /\{0\}/g,
              filePath
            )
          );
      } catch (err) {
        if (channel)
          return channel.createMessage(
            this.master.strings.bot.errors.commands.export[
              "PERMISSION_ERROR"
            ].replace(/\{0\}/g, filePath)
          );
        else return consola.error(`Coulndn't create a backup to: ${filePath}`);
      }
    } else {
      try {
        if (!existsSync(filePath))
          return channel
            ? channel.createMessage(
                this.master.strings.bot.errors.commands.import[
                  "NO_BACKUP_FILE"
                ].replace(/\{0\}/g, filePath)
              )
            : false;

        const file = JSON.parse(readFileSync(filePath, "utf-8"));

        const dataObj = {
          queue: file.queue,
          usedAccounts: file.usedAccounts,
        };

        if (!dataObj.queue.length && !dataObj.usedAccounts.length)
          return channel
            ? channel.createMessage(
                this.master.strings.bot.errors.commands.import[
                  "NOTHING_TO_IMPORT"
                ]
              )
            : false;

        dataObj.queue.forEach((r) =>
          this.master.queue.set(`${r.server.id}/${r.user.id}`, r)
        );
        this.master.usedAccounts = dataObj.usedAccounts;

        if (channel)
          return channel.createMessage(
            this.master.strings.bot.commands.import["SUCCESS"]
              .replace(/\{0\}/g, String(this.master.queue.size))
              .replace(/\{1\}/g, String(this.master.usedAccounts.length))
          );
      } catch (err) {
        if (channel)
          return channel.createMessage(
            this.master.strings.bot.errors.commands.import[
              "PERMISSION_ERROR"
            ].replace(/\{0\}/g, filePath)
          );
        else return consola.error(`Couldn't read the backup from: ${filePath}`);
      }
    }
  }

  async reload(conn: boolean = true) {
    // Backup if auto backup is enabled
    this.settings.backup.auto ? this.backupOrImport() : false;

    this.disconnect({ reconnect: conn });
    this.commands.clear();
    await this.run();
  }
}
