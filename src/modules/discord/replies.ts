import { Colors, type ChatInputCommandInteraction } from "discord.js";
import Discord from "./discord";

const Replies = {
  // General
  InternalError: (interaction: ChatInputCommandInteraction): void => {
    interaction.editReply({
      embeds: [
        Discord.BuildEmbed({
          title: "Internal Error",
          description:
            "An internal error has occurred. Please contact support.",
          color: Colors.Red,
          interaction,
        }),
      ],
    });
  },
  ServerNotInstalled: (interaction: ChatInputCommandInteraction): void => {
    interaction.editReply({
      embeds: [
        Discord.BuildEmbed({
          title: "Server Not Installed",
          description:
            "The server is not installed. Please install the server first before running this command!",
          color: Colors.Red,
          interaction,
        }),
      ],
    });
  },
  ServerOffline: (interaction: ChatInputCommandInteraction): void => {
    interaction.editReply({
      embeds: [
        Discord.BuildEmbed({
          title: "Server Offline",
          description:
            "In order to run this command, your server must be online!",
          color: Colors.Red,
          interaction,
        }),
      ],
    });
  },
  ServerRunning: (interaction: ChatInputCommandInteraction): void => {
    interaction.editReply({
      embeds: [
        Discord.BuildEmbed({
          title: "Server Running",
          description:
            "You cannot run this command while the server is running! Please stop the server then try again.",
          color: Colors.Red,
          interaction,
        }),
      ],
    });
  },
  // General

  // Backups
  BackupNotFound: (interaction: ChatInputCommandInteraction): void => {
    interaction.editReply({
      embeds: [
        Discord.BuildEmbed({
          title: "Backup Not Found",
          description:
            "The ID you provided does not link to a backup! Please make sure you provided a valid backup id, and try again.",
          color: Colors.Red,
          interaction,
        }),
      ],
    });
  },
  BackupUpdated: (interaction: ChatInputCommandInteraction): void => {
    interaction.editReply({
      embeds: [
        Discord.BuildEmbed({
          title: "Backup Updated",
          description:
            "Successfully applied your changes to the backup provided!",
          color: Colors.Green,
          interaction,
        }),
      ],
    });
  },
};

export default Replies;
