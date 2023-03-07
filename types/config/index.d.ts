export type FailureAction = "NONE" | "KICK" | "BAN";

interface Config {
  appId: string | string[] | number | number[];
  name: string;
  prefix: string;
  roles: string[];
  failureAction: FailureAction;
  logChannel: string;
  backup: {
    auto: boolean;
    interval: number;
    path: string;
  };
}
