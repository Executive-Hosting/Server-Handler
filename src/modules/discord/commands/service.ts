import { sleep } from "bun";
import {
  ChatInputCommandInteraction,
  Colors,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../../types/discord";
import FileManager from "../../../utils/fileManager";
import Logger from "../../../utils/logger";
import Handler from "../../handler";
import Discord from "../discord";

export default {
  data: new SlashCommandBuilder()
    .setName("service")
    .setDescription("Commands to manage the service.")
    .addSubcommand((command) =>
      command
        .setName("restart")
        .setDescription(
          "Restarts the service, used for updating config vars that are only applied on restart."
        )
    ),
  async callback(interaction) {
    const subcommand = interaction.options.getSubcommand(true);

    await interaction.deferReply();

    switch (subcommand) {
      case "restart":
        restart(interaction);
        break;
    }
  },
} as Command;

function restart(interaction: ChatInputCommandInteraction): void {
  interaction.editReply({
    embeds: [
      Discord.BuildEmbed({
        title: "Restarting Service",
        description:
          "Restarting service, shutdown your server for you if it is running...",
        color: Colors.DarkGrey,
        interaction,
      }),
    ],
  });

  if (Handler.IsRunning()) {
    Handler.Stop();
  }

  const config = FileManager.ReadConfig();
  const failsafe = setTimeout(async () => {
    clearInterval(loop);

    Logger.Warn("Server took too long to stop, forcing shutdown...");

    if (config.server_log) {
      Discord.Write(
        ["[SERVER HANDLER] Server took too long to stop, forcing shutdown..."],
        config.server_log_channel
      );

      await sleep(1000);
    }

    process.exit(0);
  }, 30 * 1000);
  const loop = setInterval(async () => {
    if (Handler.IsRunning()) {
      return;
    }

    clearTimeout(failsafe);
    clearInterval(loop);

    Logger.Notice("Safely shutting down...");

    if (config.server_log) {
      Discord.Write(
        ["[SERVER HANDLER] Safely shutting down..."],
        config.server_log_channel
      );

      await sleep(1000);
    }

    process.exit(0);
  }, 1000);
}
