import type { Backup } from "../types/fileManager";

export default class Formatter {
  private constructor() {}

  public static Backups(backups: Backup[]): string {
    return backups
      .map(({ name = "None!", id, created_at }) => {
        const createdAtTimestamp = Math.floor(
          new Date(created_at).getTime() / 1000
        );
        return `**Name**: \`${name}\`\n**ID**: \`${id}\`\n**Created At**: <t:${createdAtTimestamp}:R>`;
      })
      .join("\n\n");
  }
}
