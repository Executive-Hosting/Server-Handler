import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../../types/discord";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Development testing command."),
  callback: async (interaction) => {
    await interaction.deferReply();

    interaction.editReply({ content: "Pong!" });
  },
} as Command;
