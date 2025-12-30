import {
  ChatInputCommandInteraction,
  Colors,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../../types/discord";
import Handler from "../../handler";
import Discord from "../discord";
import Replies from "../replies";

export default {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Base server management commands.")
    .addSubcommand((command) =>
      command.setName("start").setDescription("Start the server.")
    )
    .addSubcommand((command) =>
      command.setName("stop").setDescription("Stop the server.")
    )
    .addSubcommand((command) =>
      command.setName("restart").setDescription("Restart the server.")
    )
    .addSubcommand((command) =>
      command
        .setName("execute")
        .setDescription("Execute a command on the server")
        .addStringOption((option) =>
          option
            .setName("command")
            .setDescription(
              "The command you would like to execute to the server."
            )
            .setRequired(true)
        )
    ),
  callback: async (interaction) => {
    const subcommand = interaction.options.getSubcommand(true);

    await interaction.deferReply();

    switch (subcommand) {
      case "start":
        start(interaction);
        break;
      case "stop":
        stop(interaction);
        break;
      case "restart":
        restart(interaction);
        break;
      case "execute":
        execute(interaction);
        break;
    }
  },
} as Command;

async function start(interaction: ChatInputCommandInteraction): Promise<void> {
  if (Handler.IsRunning()) {
    interaction.editReply({
      embeds: [
        Discord.BuildEmbed({
          title: "Server Already Online.",
          description:
            "If you believe that your server is offline and this is a false positive, please contact support.",
          color: Colors.Red,
          interaction,
        }),
      ],
    });
    return;
  }
  if (!Handler.IsInstalled()) {
    Replies.ServerNotInstalled(interaction);
    return;
  }

  const request = Handler.Start();

  if (!request) {
    Replies.InternalError(interaction);
    return;
  }

  interaction.editReply({
    embeds: [
      Discord.BuildEmbed({
        title: "Server Started",
        description: "The server has been started successfully!",
        color: Colors.Green,
        interaction,
      }),
    ],
  });
}
async function stop(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!Handler.IsRunning()) {
    interaction.editReply({
      embeds: [
        Discord.BuildEmbed({
          title: "Server Already Offline",
          description:
            "If you believe that your server is offline and this is a false positive, please contact support.",
          color: Colors.Red,
          interaction,
        }),
      ],
    });
    return;
  }

  const request = Handler.Stop();

  if (!request) {
    Replies.InternalError(interaction);
    return;
  }

  interaction.editReply({
    embeds: [
      Discord.BuildEmbed({
        title: "Server Stopping",
        description:
          "A stop request has been sent to the server, and should be off in the matter of seconds!",
        color: Colors.Green,
        interaction,
      }),
    ],
  });
}
async function restart(
  interaction: ChatInputCommandInteraction
): Promise<void> {}
async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {}
