import get from "axios";
import consola from "consola";
import API from "@/util/api";
import { Response } from "express";
import { RequestWithExtraInformation } from "types/express";
import config from "@/config";
import { useReplacer } from "@/functions/replacer";

export const path = "/verify";
export const method = "post";

export const handler = async (
  req: RequestWithExtraInformation,
  res: Response,
  api: API
) => {
  if (!req.user || !req.user.username) {
    req.session[
      "redirectUri"
    ] = `/verify/${req.body.serverId}/${req.body.userId}`;

    return res.redirect("/login");
  } else if (
    !req.body ||
    !req.body.userId ||
    !req.body.serverId ||
    !req.body.steamId
  )
    return res.status(400).json({
      error: true,
      message: api.master.strings.api.endpoints.verifyPost["MISSING_FIELDS"],
    });
  else if (!api.master.queue.has(`${req.body.serverId}/${req.body.userId}`))
    return res.status(400).json({
      error: true,
      message: api.master.strings.api.info["USER_NOT_IN_VERIFICATION"],
    });
  else if (
    api.master.usedAccounts.includes(`${req.body.userId}/${req.body.steamId}`)
  ) {
    api.master.bot.emit(
      "verificationFailed",
      `${req.body.serverId}/${req.body.userId}/true`
    );

    api.master.queue.delete(`${req.body.serverId}/${req.body.userId}`);

    return res.status(400).json({
      error: true,
      message: api.master.strings.api.info["ACCOUNT_ALREADY_USED"],
    });
  }

  try {
    // The Steam API endpoint of getting users' game list.
    let { data } = await get(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${req.body.steamId}`
    );

    if (!data.response?.games?.length)
      return res.status(406).json({
        error: true,
        message:
          api.master.strings.api.endpoints.verifyPost[
            "NO_GAMES_OR_PRIVATE_PROFILE"
          ],
      });
    else if (data.response.games.length) {
      const notFound = [];
      const appIds =
        typeof config.appId === "object" ? config.appId : [config.appId];

      for (const appId of appIds) {
        const game = data.response.games.find(
          (g: { appid: number }) => g.appid === Number(appId)
        );

        if (!game) notFound.push(appId);
      }

      if (notFound.length > 0) {
        api.master.bot.emit(
          "verificationFailed",
          `${req.body.serverId}/${req.body.userId}`
        );

        api.master.queue.delete(`${req.body.serverId}/${req.body.userId}`);

        return res.status(400).json({
          error: true,
          message: useReplacer(
            api.master.strings.api.endpoints.verifyPost["APP_NOT_FOUND"],
            [notFound.join(", ")]
          ),
        });
      } else {
        api.master.usedAccounts.push(`${req.body.userId}/${req.body.steamId}`);

        api.master.bot.emit(
          "verificationPassed",
          `${req.body.serverId}/${req.body.userId}`
        );
        api.master.queue.delete(`${req.body.serverId}/${req.body.userId}`);

        return res
          .status(200)
          .json({ error: false, verified: true, message: "Success." });
      }
    }
  } catch (err) {
    consola.error(err);

    return res.status(500).json({
      error: true,
      message: api.master.strings.api.endpoints.verifyPost["STEAM_API_ERROR"],
    });
  }
};
