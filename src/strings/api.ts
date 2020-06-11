export default {
  info: {
    BOT_STARTING: "Please wait while the bot is still loading",
    BOT_NOT_IN_GUILD: "Bot is not even in that guild ._.",
    USER_NOT_IN_VERIFICATION:
      "This user is not currently in verification. Please make sure they're being verified",
  },
  endpoints: {
    verifyPost: {
      MISSING_FIELDS:
        "Missing fields, make sure you have 'userId', 'serverId' and 'steamId' sent in the request body.",
      NO_GAMES_OR_PRIVATE_PROFILE:
        "Couldn't fetch anything from Steam API. Please make sure your profile is set to public and people can see your game details, and then try again.",
      APP_NOT_FOUND:
        "User doesn't have the app in their library. This might be caused by user having a private profile.",
      STEAM_API_ERROR:
        "Something happened while sending the request to the Steam API.",
    },
  },
};
