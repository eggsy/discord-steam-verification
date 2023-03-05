import express, { Express, Router, Request, Response } from "express";
import { readdirSync } from "fs";
import { Master } from "@/structures";
import { join } from "path";
import consola from "consola";
import { engine } from "express-handlebars";
import steam from "steam-login";
import session from "express-session";
import bodyParser from "body-parser";

export default class API {
  port: number = Number(process.env.API_PORT) || 3000;
  server: Express = express();
  router: Router = express.Router();
  master: Master;

  constructor(port: number, master: Master) {
    this.port = port;
    this.master = master;

    this.server.engine("handlebars", engine());
    this.server.set("view engine", "handlebars");
    this.server.set("views", join(__dirname, "./views"));
    this.server.use(bodyParser.urlencoded({ extended: false }));
    this.server.use(bodyParser.json());
    this.server.use(
      session({ resave: false, saveUninitialized: false, secret: "a secret" })
    );
    this.server.use(
      steam.middleware({
        realm: `${process.env.HOST}`,
        verify: `${process.env.HOST}/callback`,
        apiKey: process.env.STEAM_API_KEY,
      })
    );

    this.loadEndpoints();
    this.run();
  }

  run() {
    consola.info(`Starting express server on port ${this.port}`);
    this.server.listen(this.port, () => {
      consola.success(`Express server is running on port ${this.port}`);
    });
  }

  loadEndpoints() {
    try {
      const endpoints = readdirSync(join(__dirname, "/endpoints"));

      endpoints.forEach(async (file: string) => {
        if (file.endsWith(".map")) return;

        const { method, path, handler } = await import(
          join(__dirname, `/endpoints/${file}`)
        );

        if (path === "/login")
          this.server.get(path, steam.authenticate(), handler);
        else if (path === "/callback")
          this.server.get(path, steam.verify(), handler);
        else
          this.server[method || "get"](
            path,
            async (req: Request, res: Response) => handler(req, res, this)
          );
      });
    } catch (err) {
      consola.error(err);
    }
  }
}
