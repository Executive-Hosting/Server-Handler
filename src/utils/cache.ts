import Discord from "../modules/discord/discord";
import FileManager from "./fileManager";

export default class Cache {
  public static LogLines: string[] = [];

  private constructor() {}

  public static async Init(): Promise<void> {
    this.UploadLoop();
  }

  private static UploadLoop(): void {
    const config = FileManager.ReadConfig();

    if (!config.server_log) {
      return;
    }

    setInterval(() => {
      const lines = this.LogLines.splice(0, config.server_log_lines);

      if (lines.length === 0) {
        return;
      }

      const text = lines.join("\n");

      if (text.length > 4096) {
        return;
      }

      Discord.Write(lines, config.server_log_channel);
    }, config.server_log_speed * 1000);
  }
}
