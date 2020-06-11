import { Client, Member, TextChannel, Guild } from "eris";
import { Command, Event, Master } from "../structures";
import { readdirSync } from "fs";
import { Config } from "../config";
import consola from "consola";
import path from "path";

export default class Bot extends Client {
  name: string;
  prefix: string;
  master: Master;
  ready: boolean = false;
  commands: Map<string, Command> = new Map();
  settings: {
    enabled: boolean;
    servers: string[];
    successRoles: string[];
    failureAction: "BAN" | "KICK" | "NONE";
    logChannel: {
      id: string;
      channel: TextChannel;
    };
  } = {
    enabled: true,
    servers: [],
    successRoles: [],
    failureAction: "NONE",
    logChannel: { id: undefined, channel: null },
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

    this.loadCommands();
    this.loadEvents();

    this.run();
  }

  async run() {
    consola.info("Bot is starting...");
    this.connect();
  }

  loadCommands() {
    try {
      const files = readdirSync(path.resolve("./commands"));

      files.forEach((name: any) => {
        if (name.endsWith(".map")) return;

        const command: Command = new (require(path.resolve(
          `./commands/${name}`
        )).default)();

        this.commands.set(command.name, command);

        for (let alias of command.aliases) {
          this.commands.set(alias, command);
        }
      });
    } catch (err) {
      consola.error(err);
    }
  }

  loadEvents() {
    const files = readdirSync(path.resolve("./events"));

    files.forEach((name: any) => {
      if (name.endsWith(".map")) return;

      const event: Event = new (require(path.resolve(
        `./events/${name}`
      )).default)();

      if (event.name === "messageCreate")
        this.on("messageCreate", (message) => event.execute(message, this));
      else if (
        event.name === "guildMemberAdd" ||
        event.name === "guildMemberRemove"
      )
        this.on(event.name, (guild, member) => event.execute(member, this));
      else if (event.name === "ready")
        this.once("ready", () => event.execute(this));
      else if (
        event.name === "verificationPassed" ||
        event.name === "verificationFailed"
      )
        this.on(event.name, (id: string) => event.execute(id, this));
      else this.on(event.name, event.execute);
    });
  }

  async startVerification(guild: Guild, member: Member): Promise<boolean> {
    if (this.master.queue.has(`${member.guild.id}/${member.id}`)) return false;

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
        this.master.strings.bot.info["VERIFICATION_STARTING"].replace(
          /\{0\}/g,
          member.username
        )
      );

    const dmChannel = await member.user.getDMChannel();
    if (!dmChannel) return false;
    await this.createMessage(
      dmChannel.id,
      this.master.strings.bot.info["VERIFICATION_PRIVATE_MESSAGE"]
        .replace(/\{0\}/g, member.username)
        .replace(/\{1\}/g, guild.name)
        .replace(
          /\{2\}/g,
          `${process.env.HOST}/verify/${member.guild.id}/${member.id}`
        )
    );
    return true;
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

  async reload(conn: boolean = true) {
    this.disconnect({ reconnect: conn });
    this.commands.clear();
    await this.run();
  }
}
