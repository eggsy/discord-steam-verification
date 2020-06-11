import { Event } from "../structures";
import consola from "consola";

export default class ErrorEvent extends Event {
  name = "error";

  execute(err) {
    consola.error(err);
  }
}
