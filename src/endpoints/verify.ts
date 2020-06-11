import API from "../util/api";
import { Route } from "../structures";
import { Response } from "express";
import { RequestWithExtraInformation } from "../../@types/express";

export default class VerifyRoute extends Route {
  path = "/verify/:serverId/:userId";

  handler(req: RequestWithExtraInformation, res: Response, api: API) {
    if (!req.user || !req.user.username) {
      req.session["redirectUri"] = req.url;
      return res.redirect("/login");
    } else if (!req.params.serverId || !req.params.userId)
      return res.status(400).json({ error: true, message: "Bad request." });

    if (!api.master.bot.ready)
      return res.send(api.master.strings.api.info["BOT_STARTING"]);
    else if (!api.master.bot.settings.servers.includes(req.params.serverId))
      return res.send(api.master.strings.api.info["BOT_NOT_IN_GUILD"]);
    else if (
      !api.master.queue.has(`${req.params.serverId}/${req.params.userId}`)
    )
      return res.send(api.master.strings.api.info["USER_NOT_IN_VERIFICATION"]);

    const verification = api.master.queue.get(
      `${req.params.serverId}/${req.params.userId}`
    );

    res.render("verify", {
      verification,
      user: req.user,
      strings: api.master.strings.web,
    });
  }
}
