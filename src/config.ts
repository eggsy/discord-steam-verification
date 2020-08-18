export class Config {
  token = process.env.BOT_TOKEN;
  name = "Steam Verification Bot";
  prefix = "!";
  roles = ["732568597229993995"];
  failureAction = 2;
  logChannel = "732568606059003920";
  backup = {
    auto: false,
    interval: 600, // 10 minutes
    path: "../DSV_Backup_{0}.json",
  };
}
