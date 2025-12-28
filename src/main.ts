import * as fs from "fs";
import Handler from "./modules/handler";
import Logger from "./utils/logger";

if (!fs.existsSync("data")) {
  Logger.Debug("Creating data directory...");
  fs.mkdirSync("data/backups", { recursive: true });
}
