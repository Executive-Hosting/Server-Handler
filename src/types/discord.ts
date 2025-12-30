import type {
  ChatInputCommandInteraction,
  EmbedFooterOptions,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export interface Command {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  callback: (interaction: ChatInputCommandInteraction) => void;
}
export interface EmbedData {
  interaction: ChatInputCommandInteraction;
  title: string;
  description: string | string[];
  color: number;
  footer?: EmbedFooterOptions;
  thumbnail?: string;
}
