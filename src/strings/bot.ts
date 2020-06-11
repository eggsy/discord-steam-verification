export default {
  info: {
    VERIFICATION_STARTING:
      ":information_source: Starting verification for user: **{0}**",
    VERIFICATION_SUCCESS:
      ":white_check_mark: User **{0}** has successfully passed verification.",
    VERIFICATION_FAILED:
      ":name_badge: User {0} (`{1}`) doesn't have the app/game in their library!",
    VERIFICATION_BYPASSED:
      ":white_check_mark: User **{0}** has been removed/bypassed from verification by **{1}**.",
    VERIFICATION_BYPASSED_PM: {
      FIRST:
        ":tada: You are manually bypassed by **{0}** in server **{1}**, you can access the server now.",
      SECOND:
        "_Please note that the bot was unable to give you some roles, you may not have full access to the server._",
    },
    VERIFICATION_PRIVATE_MESSAGE:
      "Hello **{0}** :wave: You have to verify yourself before starting to chat in **{1}** server! Please use the following link to verify that you own the specific Steam item in your library.\n\n:link: <{2}>",
  },
  errors: {
    commands: {
      common: {
        WRONG_USAGE: ":no_entry: Please use the command as instructed: `{0}`",
        MEMBER_NOT_FOUND:
          ":no_entry: Couldn't find the user. Make sure you mentioned the right person or entered their ID right.",
        NOT_IN_QUEUE: ":no_entry: This user is not in the verification queue.",
      },
      bypass: {
        NO_ROLES_ADDED:
          ":no_entry: Couldn't add any of the roles to the user. Please make sure I have enough permissions on this user.",
        PARTIALLY_ADDED:
          ":grey_question: We added some of the success roles but we were unable to add following roles to this user: {0}",
        COULDNT_REMOVE_QUEUE:
          ":no_entry: Something went wrong while trying to remove user from the queue. Are you sure they were not removed before the bypassing process? _Don't worry this won't cause any issues_.",
      },
      disable: {
        ALREADY_DISABLED: ":no_entry: The bot is already disabled.",
      },
      enable: {
        ALREADY_ENABLED:
          ":no_entry: The bot is already enabled and functioning.",
      },
      eval: {
        ERROR: ":no_entry: **Error**:\n\n{0}",
      },
      help: {
        COMMAND_NOT_FOUND: "Couldn't found any command with the name: `{0}`",
      },
      list: {
        NO_USERS_IN_VERIFICATION:
          ":no_entry: There aren't any users waiting for verification right now.",
      },
      reverify: {
        COULDNT_REMOVE_ROLES:
          ":no_entry: Couldn't remove any roles from user. Here's the list the roles we couldn't remove: {0}",
        PARTIALLY_REMOVED:
          ":grey_question: We were unable to remove some roles from this user, we have succeeded removing {0} roles but we couldn't remove: {1}",
      },
      unverify: {
        NO_VERIFIED_ROLES:
          ":no_entry: This user doesn't have verified roles. Please make sure they're verified and they have all the success roles.",
      },
    },
  },
  commands: {
    common: {
      embed: {
        NOT_AFILLIATED: "Not affilliated with Steam or Discord.",
      },
    },
    bypass: {
      SUCCESS:
        ":white_check_mark: All success roles have given to the user and removed them from the verification queue.",
    },
    disable: {
      SUCCESS: ":white_check_mark: Bot will stop functioning from now on.",
    },
    enable: {
      SUCCESS:
        ":white_check_mark: Bot will continue working on every server now.",
    },
    eval: {
      OUTPUT: ":white_check_mark: **Output:**\n{0}",
    },
    help: {
      embed: {
        fields: {
          MORE_INFORMATION: {
            title: "More information?",
            value:
              "Use `{0}help <command>` to see more information about a command.",
          },
          USAGE: {
            title: "Usage",
          },
          ALTERNATIVES: {
            title: "Alternatives",
            value_NO_ALIASES: "No aliases",
          },
        },
      },
    },
    isverified: {
      USER_IS_VERIFIED:
        ":white_check_mark: This user is verified and has all the roles they need!",
      USER_NOT_VERIFIED:
        ":no_entry: This user is not verified. Please use the `reverify` command to make sure they're verified.",
      MISSING_ROLES:
        ":information_source: This user has some of the verification roles but seems like they're missing some roles, the IDs of missing roles are: {0}",
    },
    list: {
      embed: {
        title: "Users waiting for verification",
        fields: {
          TOTAL: {
            title: "Total",
          },
        },
      },
    },
    reverify: {
      SUCCESS:
        ":white_check_mark: Successfully removed all roles from user and started the verification process.",
    },
    unverify: {
      SUCCESS:
        ":white_check_mark: Successfully removed all successfull verification roles from the user.",
    },
  },
  events: {
    verificationFailed: {
      FAILED_PRIVATE_MESSAGE:
        ":name_badge: You don't have the required app in your Steam library. You have failed verification and bot will take action according to the server's settings.",
      FAILED_LOG_MESSAGE:
        ":name_badge: User {0} (`{1}`) doesn't have the app/game in their library!",
      AUDIT_LOG_REASON_KICK:
        "User has been kicked for not having app in their Steam library.",
      AUDIT_LOG_REASON_BAN:
        "User has been banned for not having required app in their Steam library",
    },
    verificationPassed: {
      SUCCESS_PRIVATE_MESSAGE:
        ":tada: You have successfully passed verification. Congrats and enjoy our server!",
      SUCCESS_LOG_MESSAGE:
        ":white_check_mark: User **{0}** has successfully passed verification.",
    },
  },
};
