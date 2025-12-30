import {
  Client,
  Events,
  IntentsBitField,
  MessageFlags,
  REST,
  Routes,
} from "discord.js";
import * as fs from "fs";
import type { Command } from "../../types/discord";
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

  private static Start(token: string): void {
    this.instance = new Client({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
      ],
    });

    this.instance.once(Events.ClientReady, (client) => {
      Logger.Notice(`Logged in as ${client.user.tag}!`);
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

      command.callback(interaction);
    });

    this.instance.login(token);
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
