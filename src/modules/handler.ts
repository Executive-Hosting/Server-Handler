import { spawn, type ChildProcess } from "child_process";
import * as fs from "fs";
import { v4 } from "uuid";
import Logger from "../utils/logger";

export default class Handler {
  public static instance: ChildProcess;

  private constructor() {}

  public static Start(): void {
    if (!fs.existsSync("data/server")) {
      Logger.Warn("Attempted to start server, but server is not installed.");
      return;
    }
  }
  public static async Install(link: string): Promise<boolean> {
    const process = spawn("scripts/install.sh", [], {
      env: {
        serverlink: link,
        serverpath: "data/server",
      },
    });

    return new Promise<boolean>((resolve) => {
      process.once("exit", (code) => {
        switch (code) {
          case 0:
            Logger.Notice("Server installed successfully");
            resolve(true);
            break;
          case 1:
            Logger.Error("Server installation failed due to missing env!");
            resolve(false);
            break;
          case 2:
            Logger.Warn(
              "Server installation failed due to the server already being installed!"
            );
            resolve(false);
            break;
          default:
            Logger.Error("Server installation failed, reason unknown!");
            resolve(false);
            break;
        }
      });
    });
  }
  public static async Backup(): Promise<boolean> {
    const process = spawn("scripts/backup.sh", [], {
      env: {
        cachepath: "data/cache",
        backuppath: "data/backups",
        backupname: v4(),
        serverpath: "data/server",
      },
    });

    return new Promise<boolean>((resolve) => {
      process.once("exit", (code) => {
        switch (code) {
          case 0:
            Logger.Notice("Server backed up successfully");
            resolve(true);
            break;
          case 1:
            Logger.Error("Server backup failed due to missing env!");
            resolve(false);
            break;
          case 2:
            Logger.Warn("Server backup failed due to cache path in use!");
            resolve(false);
            break;
          case 3:
            Logger.Warn("Server backup failed due to server not found!");
            resolve(false);
            break;
          default:
            Logger.Error("Server backup failed, reason unknown!");
            resolve(false);
            break;
        }
      });
    });
  }
  public static async Restore(id: string): Promise<boolean> {
    const process = spawn("scripts/restore.sh", [], {
      env: {
        cachepath: "data/cache",
        backuppath: "data/backups",
        filename: id,
        serverpath: "data/server",
      },
    });

    return new Promise<boolean>((resolve) => {
      process.once("exit", (code) => {
        switch (code) {
          case 0:
            Logger.Notice("Restored backup successfully");
            resolve(true);
            break;
          case 1:
            Logger.Error("Restore failed due to missing env!");
            resolve(false);
            break;
          case 2:
            Logger.Warn("Restore failed due to cache path in use!");
            resolve(false);
            break;
          case 3:
            Logger.Error("Restore failed due to backup not found!");
            resolve(false);
            break;
          default:
            Logger.Error("Restore failed, reason unknown!");
            resolve(false);
            break;
        }
      });
    });
  }
}
