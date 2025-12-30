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
    .setDescription("Server management commands.")
    .addSubcommand((command) =>
      command.setName("start").setDescription("Start the server.")
    )
    .addSubcommand((command) =>
      command.setName("stop").setDescription("Stop the server.")
    )
    .addSubcommand((command) =>
      command
        .setName("restart")
        .setDescription(
          "Restart the server. This will start your server if it is offline."
        )
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
    )
    .addSubcommand((command) =>
      command
        .setName("install")
        .setDescription("Install your server if it is not installed..")
        .addStringOption((option) =>
          option
            .setName("link")
            .setDescription(
              "The Linux version of the MCBE software download link."
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
      case "install":
        install(interaction);
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
): Promise<void> {
  if (!Handler.IsInstalled()) {
    Replies.ServerNotInstalled(interaction);
    return;
  }

  interaction.editReply({
    embeds: [
      Discord.BuildEmbed({
        title: "Restarting Server",
        description: "Please wait as we restart your server...",
        color: Colors.Blue,
        interaction,
      }),
    ],
  });

  const request = await Handler.Restart();

  if (!request) {
    Replies.InternalError(interaction);
    return;
  }

  interaction.editReply({
    embeds: [
      Discord.BuildEmbed({
        title: "Restarted Server",
        description: "We have successfully restarted your server!",
        color: Colors.Green,
        interaction,
      }),
    ],
  });
}
async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const command = interaction.options.getString("command", true);

  if (!Handler.IsRunning()) {
    Replies.ServerOffline(interaction);
    return;
  }

  Handler.Write(command);

  interaction.editReply({
    embeds: [
      Discord.BuildEmbed({
        title: "Command Ran",
        description:
          "Successfully ran your command! If you have server logging enabled, you can look at that channel to see your output!",
        color: Colors.Green,
        interaction,
      }),
    ],
  });
}
async function install(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const link = interaction.options.getString("link", true);

  if (Handler.IsInstalled()) {
    interaction.editReply({
      embeds: [
        Discord.BuildEmbed({
          title: "Server Already Installed",
          description:
            "Your server is already installed! This command is used for first time installs. If your server needs a reinstall/update, please contact support and we will help you!",
          color: Colors.Green,
          interaction: interaction,
        }),
      ],
    });
    return;
  }
  if (
    !link.startsWith(
      "https://www.minecraft.net/bedrockdedicatedserver/bin-linux"
    ) ||
    !link.endsWith(".zip")
  ) {
    interaction.editReply({
      embeds: [
        Discord.BuildEmbed({
          title: "Invalid Link",
          description: [
            "You have provided a link that is not from the official MCBE webpage, please go to the following link in order to find this. (Remember, the Linux version, not Windows!)\n",
            "link: https://www.minecraft.net/en-us/download/server/bedrock",
          ],
          color: Colors.Red,
          interaction,
        }),
      ],
    });
    return;
  }

  interaction.editReply({
    embeds: [
      Discord.BuildEmbed({
        title: "Installing Server",
        description: "Sit back while we install your server for you...",
        color: Colors.Blue,
        interaction,
      }),
    ],
  });

  const request = await Handler.Install(link);

  if (!request) {
    Replies.InternalError(interaction);
    return;
  }

  interaction.editReply({
    embeds: [
      Discord.BuildEmbed({
        title: "Server Installed",
        description: "We have successfully installed your server!",
        color: Colors.Green,
        interaction,
      }),
    ],
  });
}
