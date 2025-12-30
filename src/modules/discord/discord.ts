import {
  Client,
  Colors,
  EmbedBuilder,
  Events,
  IntentsBitField,
  MessageFlags,
  REST,
  Routes,
  TextChannel,
  type EmbedData as DiscordEmbedData,
} from "discord.js";
import * as fs from "fs";
import type { Command, EmbedData } from "../../types/discord";
import FileManager from "../../utils/fileManager";
import Logger from "../../utils/logger";

export default class Discord {
  private static instance: Client;
  private static Commands: Command[] = [];

  private constructor() {}

  public static async Init(): Promise<void> {
    const token = process.env.DISCORDTOKEN;
    const id = process.env.DISCORDID;

    if (!token || !id) {
      Logger.Fatal("Discord token or ID is missing in environment variables.");
      return;
    }

    this.LoadCommands();
    await this.DeployCommands(token, id);
    this.Start(token);
  }

  public static BuildEmbed(data: EmbedData): EmbedBuilder {
    const avatar = data.interaction.user.avatarURL();
    const embed = new EmbedBuilder({
      title: data.title,
      description:
        typeof data.description === "string"
          ? data.description
          : data.description.join("\n"),
      color: data.color,
      footer: data.footer ?? {
        text: data.interaction.guild!.name,
        icon_url: data.interaction.guild?.iconURL() ?? undefined,
      },
      thumbnail:
        !data.thumbnail && avatar
          ? {
              url: avatar,
            }
          : undefined,
      timestamp: new Date(),
    } as DiscordEmbedData);

    return embed;
  }

  private static Start(token: string): void {
    this.instance = new Client({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
      ],
    });

    this.instance.once(Events.ClientReady, (client) => {
      Logger.Notice(`Logged in as ${client.user.tag}!`);

      const config = FileManager.ReadConfig();

      if (config.server_log) {
        this.Write(
          ["[SERVER HANDLER] Systems have safely started!"],
          config.server_log_channel
        );
      }
    });
    this.instance.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) {
        return;
      }
      if (!interaction.guild) {
        await interaction.deferReply();

        interaction.editReply({
          content: "This command can only be used in a server.",
        });
        return;
      }

      const command = this.Commands.find(
        (command) => command.data.name === interaction.commandName
      );

      if (!command) {
        Logger.Warn(
          `${interaction.user.tag} attempted to use unknown command ${interaction.commandName}.`
        );

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        interaction.editReply({
          content: "This command does not exist!",
        });
        return;
      }

      try {
        command.callback(interaction);
      } catch (error) {
        if (!interaction.deferred) {
          await interaction.deferReply();
        }

        Logger.Error(`Error executing command ${command.data.name}:`, error);

        interaction.editReply({
          content:
            "There was an error while executing this command. Please contact our team to get this adjusted!",
        });
      }
    });

    this.instance.login(token);
  }

  public static Write(lines: string[], channelId: string): void {
    const channel = this.instance.channels.cache.get(channelId) as
      | TextChannel
      | undefined;

    if (!channel) {
      Logger.Warn("Could not find log channel!");
      return;
    }

    channel.send({
      embeds: [
        new EmbedBuilder({
          description: lines.join("\n"),
          color: Colors.Gold,
          footer: {
            text: channel.guild.name,
            icon_url: channel.guild.iconURL() ?? undefined,
          },
          timestamp: new Date(),
        }),
      ],
    });
  }

  private static LoadCommands(): void {
    const files = fs.readdirSync(`${__dirname}/commands`);

    for (const file of files) {
      try {
        const data = require(`${__dirname}/commands/${file}`)
          .default as Command;

        if (!data.callback || !data.data) {
          Logger.Warn(
            `Command ${file} is missing a required "data" or "callback" property.`
          );
          continue;
        }

        this.Commands.push(data);

        Logger.Debug(`Loaded command ${data.data.name}`);
      } catch (error) {
        Logger.Error(`Failed to load ${file}`, error);
      }
    }
  }
  private static async DeployCommands(
    token: string,
    id: string
  ): Promise<void> {
    const rest = new REST({ version: "10" });

    rest.setToken(token);

    try {
      await rest.put(Routes.applicationCommands(id), {
        body: this.Commands.map((command) => command.data.toJSON()),
      });

      Logger.Notice(`Successfully deployed ${this.Commands.length} commands.`);
    } catch (error) {
      Logger.Error("Failed to deploy commands", error);
    }
  }
}
