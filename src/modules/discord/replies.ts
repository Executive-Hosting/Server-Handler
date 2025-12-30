import { Colors, type ChatInputCommandInteraction } from "discord.js";
import Discord from "./discord";

const Replies = {
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
};

export default Replies;
