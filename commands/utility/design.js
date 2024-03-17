const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ComponentType,
  PermissionFlagsBits,
} = require("discord.js");

const moment = require("moment/moment");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("design")
    .setDescription("commands for design projects")
    .addSubcommand((option) =>
      option.setName("add").setDescription("add a new design project")
    )
    .addSubcommand((option) =>
      option.setName("list").setDescription("list all design projects")
    )
    .addSubcommand((option) =>
      option
        .setName("show")
        .setDescription("show a detailed version for design project")
        .addStringOption((option) =>
          option.setName("project_id").setDescription("select a project by id")
        )
        .addStringOption((option) =>
          option
            .setName("project_name")
            .setDescription("select a project by name")
        )
    )
    .addSubcommand((option) =>
      option
        .setName("edit")
        .setDescription("edit an existing project")
        .addStringOption((option) =>
          option
            .setName("project_id")
            .setDescription("select a project by id")
            .setRequired(true)
        )
    )
    .addSubcommand((option) =>
      option
        .setName("delete")
        .setDescription("delete an existing project")
        .addStringOption((option) =>
          option
            .setName("project_id")
            .setDescription("select a project by id")
            .setRequired(true)
        )
    )
    .addSubcommand((option) =>
      option
        .setName("completed")
        .setDescription("set a design as completed")
        .addStringOption((option) =>
          option.setName("project_id").setDescription("select a project by id")
        )
        .addStringOption((option) =>
          option
            .setName("project_name")
            .setDescription("select a project by name")
        )
    )
    .addSubcommand((option) =>
      option
        .setName("archived")
        .setDescription("Shows a list of archived projects")
    ),
  async execute(client, interaction, APdb) {
    const allowedUserIds = [
      "1042028297795682364", // Spider
      "593393250501656586", // Ehz
      "944583696952999946", // Ahas
    ];
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        interaction.reply({
          content: "You're not allowed to use this command",
          ephemeral: true,
        });
      } else {
        if (interaction.options.getSubcommand() === "add") {
          const modal = new ModalBuilder()
            .setCustomId("projectdesign")
            .setTitle(`Add Design Project`);
          const projectName = new TextInputBuilder()
            .setCustomId("name")
            .setLabel("Project Name")
            .setStyle(TextInputStyle.Short);
          // Create the text input components
          const description = new TextInputBuilder()
            .setCustomId("description")
            // The label is the prompt the user sees for this input
            .setLabel("Description")
            // Short means only a single line of text
            .setStyle(TextInputStyle.Paragraph);
          const projectNameRow = new ActionRowBuilder().addComponents(
            projectName
          );
          const descriptionRow = new ActionRowBuilder().addComponents(
            description
          );
          // const extraNotes = new TextInputBuilder()
          //   .setCustomId("extranotes")
          //   .setLabel("Extra Notes")
          //   .setStyle(TextInputStyle.Short);
          // const extraNotesRow = new ActionRowBuilder().addComponents(extraNotes);
          const deadline = new TextInputBuilder()
            .setCustomId("deadline")
            .setLabel("Deadline")
            .setStyle(TextInputStyle.Short);
          const deadlineRow = new ActionRowBuilder().addComponents(deadline);
          const priority = new TextInputBuilder()
            .setCustomId("priority")
            .setLabel("Priority")
            .setStyle(TextInputStyle.Short);
          const priorityRow = new ActionRowBuilder().addComponents(priority);
          // Add inputs to the modal
          modal.addComponents(
            projectNameRow,
            descriptionRow,
            deadlineRow,
            priorityRow
            //extraNotesRow
          );

          // Show the modal to the user
          await interaction.showModal(modal);
          const filter = (interaction) =>
            interaction.customId === `projectdesign`;
          interaction
            .awaitModalSubmit({ filter, time: 600_000 })
            .then((modalInteraction) => {
              const nameReply =
                modalInteraction.fields.getTextInputValue("name");
              const descriptionReply =
                modalInteraction.fields.getTextInputValue("description");
              // const extraNotesReply =
              //   modalInteraction.fields.getTextInputValue("extranotes");
              const deadlineReply =
                modalInteraction.fields.getTextInputValue("deadline");
              const priorityReply =
                modalInteraction.fields.getTextInputValue("priority");
              let rProjects = client.getDesignsByName.get(nameReply);
              if (!rProjects) {
                rProjects = {
                  name: `${nameReply}`,
                  description: `${descriptionReply}`,
                  extranotes: ``,
                  deadline: `${deadlineReply}`,
                  priority: Number(priorityReply),
                  completed: 0,
                  completedDate: "",
                };
              }
              client.setDesigns.run(rProjects);
              const embed = new EmbedBuilder()
                .setTitle(nameReply)
                .setDescription(descriptionReply)
                .addFields(
                  { name: "Deadline", value: `${deadlineReply}`, inline: true },
                  { name: "\u200B", value: "\u200B", inline: true },
                  { name: "Priority", value: `${priorityReply}`, inline: true }
                );
              modalInteraction.reply({
                content: "Project added",
                embeds: [embed],
              });
            });
        }
        if (interaction.options.getSubcommand() === "list") {
          const rows = await APdb.prepare(
            "SELECT * FROM designs WHERE completed = 0"
          ).all();

          let maxIdLength = "Id".length;
          let maxTitleLength = "Title".length;
          let maxPriorityLength = "Priority".length;
          let maxDeadlineLength = "Deadline".length;

          for (const data of rows) {
            maxIdLength = Math.max(maxIdLength, data.id.toString().length);
            maxTitleLength = Math.max(maxTitleLength, data.name.length);
            maxPriorityLength = Math.max(
              maxPriorityLength,
              data.priority.toString().length
            );
            maxDeadlineLength = Math.max(
              maxDeadlineLength,
              data.deadline.length
            );
          }
          // Create a header row
          let message = "```\n";
          message += `${"Id".padEnd(maxIdLength)} | ${"Title".padEnd(
            maxTitleLength
          )} | ${"Priority".padEnd(maxPriorityLength)} | ${"Deadline".padEnd(
            maxDeadlineLength
          )} |\n`;
          message += `${"-".repeat(maxIdLength)} | ${"-".repeat(
            maxTitleLength
          )} | ${"-".repeat(maxPriorityLength)} | ${"-".repeat(
            maxDeadlineLength
          )} |\n`;
          for (const data of rows) {
            message += `${data.id
              .toString()
              .padEnd(maxIdLength)} | ${data.name.padEnd(
              maxTitleLength
            )} | ${data.priority
              .toString()
              .padEnd(maxPriorityLength)} | ${data.deadline.padEnd(
              maxDeadlineLength
            )} |\n`;
          }
          message += "```";
          interaction.reply(message);
        }
        if (interaction.options.getSubcommand() === "show") {
          projectId = interaction.options.getString("project_id");
          projectName = interaction.options.getString("project_name");
          if (projectId) {
            let rProjectsId = client.getDesignsById.get(projectId);
            if (!rProjectsId) {
              interaction.reply({
                content: "There is no project with this name or id",
                ephemeral: true,
              });
            }
            const embed = new EmbedBuilder()
              .setTitle(`${rProjectsId.name}`)
              .setDescription(`**Description**\n${rProjectsId.description}\n`)
              .addFields(
                {
                  name: "Deadline",
                  value: `${rProjectsId.deadline}`,
                  inline: true,
                },
                { name: "\u200B", value: "\u200B", inline: true },
                {
                  name: "Priority",
                  value: `${rProjectsId.priority}`,
                  inline: true,
                }
              );
            await interaction.reply({ embeds: [embed] });
          }
          if (projectName) {
            let rProjectsName = client.getDesignsByName.get(projectName);
            if (!rProjectsName) {
              interaction.reply({
                content: "There is no project with this name or id",
                ephemeral: true,
              });
            }
            const embed = new EmbedBuilder()
              .setTitle(`${rProjectsName.name}`)
              .setDescription(`**Description**\n${rProjectsName.description}`)
              .addFields(
                {
                  name: "Deadline",
                  value: `${rProjectsName.deadline}`,
                  inline: true,
                },
                { name: "\u200B", value: "\u200B", inline: true },
                {
                  name: "Priority",
                  value: `${rProjectsName.priority}`,
                  inline: true,
                }
              );
            await interaction.reply({ embeds: [embed] });
          }
          if (!projectId && !projectName) {
            interaction.reply({
              content: "Please specify a project name or a project id",
              ephemeral: true,
            });
          }
        }
        if (interaction.options.getSubcommand() === "edit") {
          projectId = interaction.options.getString("project_id");

          if (projectId) {
            let rProjectsId = client.getDesignsById.get(projectId);
            if (!rProjectsId) {
              interaction.reply({
                content: "There is no project with this name or id",
                ephemeral: true,
              });
            }
            const modal = new ModalBuilder()
              .setCustomId("projectdesign")
              .setTitle(`Edit Design Project`);
            const projectName = new TextInputBuilder()
              .setCustomId("name")
              .setLabel("Project Name")
              .setStyle(TextInputStyle.Short)
              .setValue(`${rProjectsId.name}`)
              .setRequired(false);
            // Create the text input components
            const description = new TextInputBuilder()
              .setCustomId("description")
              // The label is the prompt the user sees for this input
              .setLabel("Description")
              // Short means only a single line of text
              .setStyle(TextInputStyle.Paragraph)
              .setValue(`${rProjectsId.description}`)
              .setRequired(false);
            const projectNameRow = new ActionRowBuilder().addComponents(
              projectName
            );
            const descriptionRow = new ActionRowBuilder().addComponents(
              description
            );
            // const extraNotes = new TextInputBuilder()
            //   .setCustomId("extranotes")
            //   .setLabel("Extra Notes")
            //   .setStyle(TextInputStyle.Short);
            // const extraNotesRow = new ActionRowBuilder().addComponents(extraNotes);
            const deadline = new TextInputBuilder()
              .setCustomId("deadline")
              .setLabel("Deadline")
              .setStyle(TextInputStyle.Short)
              .setValue(`${rProjectsId.deadline}`)
              .setRequired(false);
            const deadlineRow = new ActionRowBuilder().addComponents(deadline);
            const priority = new TextInputBuilder()
              .setCustomId("priority")
              .setLabel("Priority")
              .setStyle(TextInputStyle.Short)
              .setValue(`${rProjectsId.priority}`)
              .setRequired(false);
            const priorityRow = new ActionRowBuilder().addComponents(priority);
            // Add inputs to the modal
            modal.addComponents(
              projectNameRow,
              descriptionRow,
              deadlineRow,
              priorityRow
              //extraNotesRow
            );

            // Show the modal to the user
            await interaction.showModal(modal);
            const filter = (interaction) =>
              interaction.customId === `projectdesign`;
            interaction
              .awaitModalSubmit({ filter, time: 6_000_000 })
              .then((modalInteraction) => {
                const nameReply =
                  modalInteraction.fields.getTextInputValue("name");
                const descriptionReply =
                  modalInteraction.fields.getTextInputValue("description");
                // const extraNotesReply =
                //   modalInteraction.fields.getTextInputValue("extranotes");
                const deadlineReply =
                  modalInteraction.fields.getTextInputValue("deadline");
                const priorityReply =
                  modalInteraction.fields.getTextInputValue("priority");

                client.setDesignsUpdateById.run(rProjectsId);
                const embed = new EmbedBuilder()
                  .setTitle(nameReply)
                  .setDescription(descriptionReply)
                  .addFields(
                    {
                      name: "Deadline",
                      value: `${deadlineReply}`,
                      inline: true,
                    },
                    { name: "\u200B", value: "\u200B", inline: true },
                    {
                      name: "Priority",
                      value: `${priorityReply}`,
                      inline: true,
                    }
                  );
                modalInteraction.reply({
                  content: "Project updated",
                  embeds: [embed],
                });
              });
          }

          if (!projectId) {
            interaction.reply({
              content: "Please specify a project id",
              ephemeral: true,
            });
          }
        }
        if (interaction.options.getSubcommand() === "delete") {
          projectId = interaction.options.getString("project_id");
          if (projectId) {
            let rProjectsId = client.getDesignsById.get(projectId);
            if (!rProjectsId) {
              interaction.reply({
                content: "There is no project with this name or id",
                ephemeral: true,
              });
            }
            client.setDesignsDeleteById.run(rProjectsId);
            await interaction.reply({ content: "Project deleted" });
          }

          if (!projectId) {
            interaction.reply({
              content: "Please specify a project id",
              ephemeral: true,
            });
          }
        }
        if (interaction.options.getSubcommand() === "completed") {
          projectId = interaction.options.getString("project_id");
          projectName = interaction.options.getString("project_name");
          if (projectId) {
            let rProjectsId = client.getDesignsById.get(projectId);
            if (!rProjectsId) {
              interaction.reply({
                content: "There is no project with this name or id",
                ephemeral: true,
              });
            }
            rProjectsId.completedDate = moment().format("DD/MM/YYYY");
            rProjectsId.completed = 1;
            client.setDesignsCompletedById.run(rProjectsId);
            await interaction.reply({ content: "Project set as completed" });
          }
          if (projectName) {
            let rProjectsName = client.getDesignsByName.get(projectName);
            if (!rProjectsName) {
              interaction.reply({
                content: "There is no project with this name or id",
                ephemeral: true,
              });
            }
            rProjectsName.completedDate = moment().format("DD/MM/YYYY");
            rProjectsName.completed = 1;
            client.setDesignsCompletedByName.run(rProjectsName);
            await interaction.reply({});
          }
          if (!projectId && !projectName) {
            interaction.reply({
              content: "Please specify a project name or a project id",
              ephemeral: true,
            });
          }
        }
        if (interaction.options.getSubcommand() === "archived") {
          const rows = await APdb.prepare(
            "SELECT * FROM designs WHERE completed = 1"
          ).all();

          let maxIdLength = "Id".length;
          let maxTitleLength = "Title".length;

          let maxDoCLength = "Date of Completion".length;

          for (const data of rows) {
            maxIdLength = Math.max(maxIdLength, data.id.toString().length);
            maxTitleLength = Math.max(maxTitleLength, data.name.length);

            maxDoCLength = Math.max(maxDoCLength, data.completedDate.length);
          }
          // Create a header row
          let message = "```\n";
          message += `${"Id".padEnd(maxIdLength)} | ${"Title".padEnd(
            maxTitleLength
          )} | ${"Date of Completion".padEnd(maxDoCLength)} |\n`;
          message += `${"-".repeat(maxIdLength)} | ${"-".repeat(
            maxTitleLength
          )} | ${"-".repeat(maxDoCLength)} |\n`;
          for (const data of rows) {
            message += `${data.id
              .toString()
              .padEnd(maxIdLength)} | ${data.name.padEnd(
              maxTitleLength
            )} | ${data.completedDate.padEnd(maxDoCLength)} |\n`;
          }
          message += "```";
          interaction.reply(message);
        }
      }
    } catch (e) {
      console.log(e);
    }
  },
};
