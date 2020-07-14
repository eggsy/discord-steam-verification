export class Config {
  // Your bot's token, set it in your .env file
  token = process.env.BOT_TOKEN;

  // The name of the bot that'll be used in certain places
  name = "Steam Verification Bot";

  // Bot's prefix for commands
  prefix = "!";

  // Roles that will be given to user on successfull verification
  roles = ["732568597229993995"];

  // Choose what action bot will take when user doesn't have the app in their library.
  // Options: 0 = NONE, 1 = KICK, 2 = BAN
  failureAction = 2;

  // Set if you want to log verification steps to a channel
  logChannel = "732568606059003920";

  // Set backup options, you can also use "export" and "import" commands
  backup = {
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
  };
}
