import { sleep } from "bun";
import { spawn, type ChildProcess } from "child_process";
import * as fs from "fs";
import { v4 } from "uuid";
import FileManager from "../utils/fileManager";
import Logger from "../utils/logger";

export default class Handler {
  private static instance: ChildProcess;

  private constructor() {}

  public static async Init(): Promise<void> {
    if (!fs.existsSync("data")) {
      Logger.Debug("Initalizing data folder...");

      fs.mkdirSync("data/backups", { recursive: true });
      fs.writeFileSync("data/backups.json", "[]", "utf8");
    }

    this.DeleteHangedBackups();
    this.BackupLoop();
    this.RestartLoop();
  }

  public static Start(): boolean {
    const config = FileManager.ReadConfig();

    if (!this.IsInstalled()) {
      Logger.Warn("Attempted to start server, but server is not installed.");
      return false;
    }
    if (this.instance) {
      Logger.Warn("Attempted to start server, but server is already running.");
      return false;
    }

    this.instance = spawn("./bedrock_server", [], {
      cwd: "data/server",
    });

    Logger.Notice("Server process started with PID " + this.instance.pid);

    this.instance.stdout?.on("data", (buffer: Buffer) => {
      if (config.show_console) {
        process.stdout.write(buffer);
      }
    });
    this.instance.stderr?.on("data", (buffer: Buffer) => {
      if (config.show_console) {
        process.stderr.write(buffer);
      }
    });

    this.instance.once("exit", (code) => {
      Logger.Notice("Server process exited with code " + code);

      this.instance = undefined!;
    });

    return true;
  }
  public static Stop(): boolean {
    if (!this.instance) {
      Logger.Warn("Attempted to stop server, but server is not running.");
      return false;
    }

    this.Write("stop");
    return true;
  }
  public static async Restart(): Promise<boolean> {
    if (!this.instance) {
      this.Start();
      return true;
    }

    this.Stop();

    return new Promise<boolean>((resolve) => {
      const failsafe = setTimeout(() => {
        if (this.instance) {
          Logger.Warn("Server failed to stop, killing process...");

          this.instance.kill();
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 30 * 1000);
      const checkInterval = setInterval(() => {
        if (!this.instance) {
          clearInterval(checkInterval);
          clearTimeout(failsafe);
          this.Start();
          resolve(true);
        }
      }, 1000);
    });
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
  public static async Backup(
    isProtected?: boolean,
    name?: string
  ): Promise<boolean> {
    const id = v4();

    const process = spawn("scripts/backup.sh", [], {
      env: {
        cachepath: "data/cache",
        backuppath: "data/backups",
        backupname: id,
        serverpath: "data/server",
      },
    });

    return new Promise<boolean>((resolve) => {
      process.once("exit", async (code) => {
        switch (code) {
          case 0:
            FileManager.WriteBackups([
              ...FileManager.ReadBackups(),
              {
                created_at: new Date(),
                id,
                name,
                protected: isProtected === undefined ? false : isProtected,
              },
            ]);

            await sleep(1000); // Wait a second to ensure file write completion

            const deleted = await this.DeleteOldBackups();

            Logger.Notice(
              `Server backed up successfully! Deleted ${deleted} old backups.`
            );
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
    if (this.instance) {
      Logger.Warn("Attempted to restore backup, but server is running.");
      return false;
    }

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

  public static Write(data: string): boolean {
    if (!this.instance) {
      Logger.Warn("Attempted to write to server, but server is not running.");
      return false;
    }

    this.instance.stdin?.write(data + "\n");
    return true;
  }

  public static IsInstalled(): boolean {
    return fs.existsSync("data/server/");
  }
  public static IsRunning(): boolean {
    return this.instance !== undefined;
  }

  private static async DeleteOldBackups(): Promise<number> {
    const config = FileManager.ReadConfig();
    const backups = FileManager.ReadBackups()
      .filter((backup) => !backup.protected)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    if (config.auto_backup_retention >= backups.length) {
      return 0;
    }

    const extras = backups.slice(config.auto_backup_retention);

    for (const backup of extras) {
      fs.rmSync(`data/backups/${backup.id}.tar.gz`);

      const backups = FileManager.ReadBackups().filter(
        (b) => b.id !== backup.id
      );

      FileManager.WriteBackups(backups);

      await sleep(100); // Small delay to ensure file system stability
    }

    return extras.length;
  }
  private static DeleteHangedBackups(): number {
    const backups = FileManager.ReadBackups();
    const files = fs.readdirSync("data/backups");
    let deleted = 0;

    for (const file of files) {
      const id = file.replace(".tar.gz", "");

      if (!backups.some((backup) => backup.id === id)) {
        fs.rmSync(`data/backups/${file}`);
        deleted++;
      }
    }

    if (deleted > 0) {
      Logger.Warn(`Deleted ${deleted} hanged backups.`);
    }

    return deleted;
  }

  private static BackupLoop(): void {
    const config = FileManager.ReadConfig();

    if (!config.auto_backup) {
      return;
    }

    Logger.Debug("Automatic backup loop started.");

    setInterval(() => {
      Logger.Info("Running automatic backup...");
      this.Backup();
    }, config.auto_backup_speed * 1000 * 60);
  }
  private static RestartLoop(): void {
    const config = FileManager.ReadConfig();

    if (!config.auto_restart) {
      return;
    }
    if (config.auto_restart_timing.length === 0) {
      Logger.Warn(
        "Automatic restart is enabled but no timings are set. Ignoring..."
      );
      return;
    }

    Logger.Debug("Automatic restart loop started.");

    setInterval(async () => {
      const date = new Date();
      const minutes = date.getUTCMinutes().toString().padStart(2, "0");
      const hours = date.getUTCHours().toString().padStart(2, "0");

      if (!this.instance) {
        return;
      }
      if (!config.auto_restart_timing.includes(`${hours}:${minutes}`)) {
        return;
      }

      Logger.Info("Running automatic restart...");

      for (const option of config.auto_restart_countdown_options) {
        option.commands?.forEach((command) => {
          this.Write(command);
        });

        await sleep(option.delay * 1000);
      }

      this.Restart();
    }, 1000 * 60);
  }
}
