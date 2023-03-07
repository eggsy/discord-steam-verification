import { type Config } from "types/config";

export const config: Config = {
  // Steam APP IDs to check for
  appId: ["123123", "343434"],

  // The name of the bot that'll be used in certain places
  name: "Steam Verification Bot",

  // Bot's prefix for commands
  prefix: "!",

  // Roles that will be given to user on successfull verification
  roles: ["000111222333444555"],

  /*
    Choose what action bot will take when user doesn't have the app in their library.
    Options:
      - NONE
      - KICK
      - BAN
  */
  failureAction: "NONE",

  // Set if you want to log verification steps to a channel
  logChannel: "555444333222111000",

  // Set backup options, you can also use "export" and "import" commands
  backup: {
    // Set if you want to enable auto back up feature
    // If set, bot will keep backing up the data in the memory to
    // a local file.
    auto: false,

    // Back up every once in this time (only if auto backup is enabled,
    // in seconds, it's better to keep this value high as possible):
    interval: 600, // 10 minutes

    // Options: {0} will be replaced with the bot's name
    //          - Path must end with .json
    path: "../DSV_Backup_{0}.json",
  },
};

export default config;
