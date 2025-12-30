import * as fs from "fs";
import type { Backup, Config } from "../types/fileManager";

export default class FileManager {
  private constructor() {}

  public static ReadConfig(): Config {
    return JSON.parse(fs.readFileSync("lib/config.json", "utf8"));
  }
  public static WriteConfig(config: Config): void {
    fs.writeFileSync("lib/config.json", JSON.stringify(config, null, 2));
  }

  public static ReadBackups(): Backup[] {
    return JSON.parse(fs.readFileSync("data/backups.json", "utf8"));
  }
  public static WriteBackups(backups: Backup[]): void {
    fs.writeFileSync("data/backups.json", JSON.stringify(backups, null, 2));
  }
}
