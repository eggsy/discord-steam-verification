import { defineConfig } from "tsup";
import { config } from "dotenv";
import { ChildProcess, spawn } from "child_process";
import { cp } from "fs";
import consola from "consola";

config();

let cProcess: ChildProcess;

export default defineConfig({
  entry: ["src/**/*.ts"],
  watch: process.env.NODE_ENV !== "production",
  clean: true,
  env: {
    BOT_TOKEN: process.env.BOT_TOKEN,
  },
  loader: {
    ".handlebars": "file",
  },
  async onSuccess() {
    cp(
      "src/views",
      "dist/views",
      {
        recursive: true,
      },
      (err) => {
        if (err) consola.error(err);
      }
    );

    if (process.env.NODE_ENV === "production") return;

    if (cProcess?.killed === false) {
      cProcess.kill();
      cProcess = null;
    }

    cProcess = spawn("node", ["dist/index.js"], {
      stdio: "inherit",
    });
  },
});
