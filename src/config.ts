export class Config {
  // Your bot's token, set it in your .env file
  token = process.env.BOT_TOKEN;
  // The name of the bot that'll be used in certain places
  name = "Steam Verification Bot";
  // Bot's prefix for commands
  prefix = "!";
  // Roles that will be given to user on successfull verification
  roles = ["720319640814878740"];
  // Choose what action bot will take when user doesn't have the app in their library.
  failureAction: "KICK" | "BAN" | "NONE" = "NONE";
  // Set if you want to log verification steps to a channel
  logChannel = "440213876546732033";
}
