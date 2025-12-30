import {
  ChatInputCommandInteraction,
  Colors,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../../types/discord";
import FileManager from "../../../utils/fileManager";
import Formatter from "../../../utils/formatter";
import Handler from "../../handler";
import Discord from "../discord";
import Replies from "../replies";

export default {
  data: new SlashCommandBuilder()
    .setName("backups")
    .setDescription("Backup management commands.")
    .addSubcommand((command) =>
      command.setName("list").setDescription("List all backups.")
    )
    .addSubcommand((command) =>
      command
        .setName("create")
        .setDescription("Create a new backup now.")
        .addBooleanOption((option) =>
          option
            .setName("protected")
            .setDescription("Would you like this backup to be protected?")
        )
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("What would you like to name this backup?")
        )
    )
    .addSubcommand((command) =>
      command
        .setName("restore")
        .setDescription("Restore a backup.")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the backup.")
            .setMinLength(36)
            .setMaxLength(36)
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("set-protected")
        .setDescription("Update the protected status on a backup.")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the backup.")
            .setMinLength(36)
            .setMaxLength(36)
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("protected")
            .setDescription("Would you like this backup protected?")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("set-name")
        .setDescription("Sets the name of a backup.")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the backup.")
            .setMinLength(36)
            .setMaxLength(36)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription(
              "The new name of the backup, otherwise nothing to delete."
            )
        )
    ),
  callback: async (interaction) => {
    const subcommand = interaction.options.getSubcommand(true);

    await interaction.deferReply();

    switch (subcommand) {
      case "list":
        list(interaction);
        break;
      case "create":
        create(interaction);
        break;
      case "restore":
        restore(interaction);
        break;
      case "set-protected":
        setProtected(interaction);
        break;
      case "set-name":
        setName(interaction);
        break;
    }
  },
} as Command;

async function list(interaction: ChatInputCommandInteraction): Promise<void> {
  const backups = FileManager.ReadBackups().sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const protectedBackups = backups.filter((backup) => backup.protected);
  const unprotectedBackups = backups.filter((backup) => !backup.protected);

  if (backups.length === 0) {
    interaction.editReply({
      embeds: [
        Discord.BuildEmbed({
          title: "No Backups",
          description: "No backups were found!",
          color: Colors.Yellow,
          interaction,
        }),
      ],
    });
    return;
  }

  interaction.editReply({
    embeds: [
      Discord.BuildEmbed({
        title: `${backups.length} Backups`,
        description: [
          `**Here are your current backups!**`,
          `### Protected Backups:`,
          protectedBackups.length === 0
            ? "**None!**"
            : Formatter.Backups(protectedBackups),
          `### Normal Backups:`,
          unprotectedBackups.length === 0
            ? "**None!**"
            : Formatter.Backups(unprotectedBackups),
        ],
        color: Colors.Green,
        interaction,
      }),
    ],
  });
}
async function create(interaction: ChatInputCommandInteraction): Promise<void> {
  const isProtected = interaction.options.getBoolean("protected");
  const name = interaction.options.getString("name");

  if (!Handler.IsInstalled()) {
    Replies.ServerNotInstalled(interaction);
    return;
  }

  interaction.editReply({
    embeds: [
      Discord.BuildEmbed({
        title: "Creating Backup",
        description: "Please wait as we create a backup...",
        color: Colors.Blue,
        interaction,
      }),
    ],
  });

  const request = await Handler.Backup(
    isProtected ?? undefined,
    name ?? undefined
  );

  if (!request) {
    Replies.InternalError(interaction);
    return;
  }

  interaction.editReply({
    embeds: [
      Discord.BuildEmbed({
        title: "Backup Created",
        description:
          "The backup has been created, and can be viewed in the backups view command.",
        color: Colors.Green,
        interaction,
      }),
    ],
  });
}
async function restore(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const id = interaction.options.getString("id", true);
  const backup = FileManager.ReadBackups().find((backup) => backup.id === id);

  if (!backup) {
    Replies.BackupNotFound(interaction);
    return;
  }
  if (Handler.IsRunning()) {
    Replies.ServerRunning(interaction);
    return;
  }

  interaction.editReply({
    embeds: [
      Discord.BuildEmbed({
        title: "Restoring Backup",
        description: "Please wait as we restore your server...",
        color: Colors.Blue,
        interaction,
      }),
    ],
  });

  const request = await Handler.Restore(backup.id);

  if (!request) {
    Replies.InternalError(interaction);
    return;
  }

  interaction.editReply({
    embeds: [
      Discord.BuildEmbed({
        title: "Server Restored",
        description: "Your server has been restored to the backup's state!",
        color: Colors.Green,
        interaction,
      }),
    ],
  });
}
async function setProtected(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const id = interaction.options.getString("id", true);
  const isProtected = interaction.options.getBoolean("protected", true);
  const backups = FileManager.ReadBackups();
  const backup = backups.find((backup) => backup.id === id);

  if (!backup) {
    Replies.BackupNotFound(interaction);
    return;
  }

  backup.protected = isProtected;
  backups.splice(backups.indexOf(backup), 1);
  FileManager.WriteBackups([...backups, backup]);

  Replies.BackupUpdated(interaction);
}
async function setName(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const id = interaction.options.getString("id", true);
  const name = interaction.options.getString("name");
  const backups = FileManager.ReadBackups();
  const backup = backups.find((backup) => backup.id === id);

  if (!backup) {
    Replies.BackupNotFound(interaction);
    return;
  }

  backup.name = name ?? undefined;
  backups.splice(backups.indexOf(backup), 1);
  FileManager.WriteBackups([...backups, backup]);

  Replies.BackupUpdated(interaction);
}
