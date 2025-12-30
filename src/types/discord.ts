import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export interface Command {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  callback: (interaction: ChatInputCommandInteraction) => void;
}
