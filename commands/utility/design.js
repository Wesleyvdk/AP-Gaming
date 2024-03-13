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
} = require("discord.js");
const Database = require("better-sqlite3");

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
        .setDescription("show a  detailed version for design project")
        .addStringOption((option) =>
          option.setName("project_id").setDescription("select a project by id")
        )
        .addStringOption((option) =>
          option
            .setName("project_name")
            .setDescription("select a project by name")
        )
    ),
  async execute(interaction) {
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
      const descriptionRow = new ActionRowBuilder().addComponents(description);
      const extraNotes = new TextInputBuilder()
        .setCustomId("extranotes")
        .setLabel("Extra Notes")
        .setStyle(TextInputStyle.Short);
      const extraNotesRow = new ActionRowBuilder().addComponents(extraNotes);
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
        descriptionRow,
        deadlineRow,
        priorityRow,
        extraNotesRow
      );

      // Show the modal to the user
      await interaction.showModal(modal);
      const filter = (interaction) => interaction.customId === `projectname`;
      interaction
        .awaitModalSubmit({ filter, time: 30_000 })
        .then((modalInteraction) => {
          const nameReply = modalInteraction.getTextInputValue("name");
          const descriptionReply =
            modalInteraction.fields.getTextInputValue("description");
          const extraNotesReply =
            modalInteraction.fields.getTextInputValue("extranotes");
          const deadlineReply =
            modalInteraction.fields.getTextInputValue("deadline");
          const priorityReply =
            modalInteraction.fields.getTextInputValue("priority");
          let rProjects = client.getDesignsByName.get(nameReply);
          if (!rProjects) {
            rProjects = {
              name: `${nameReply}`,
              description: `${descriptionReply}`,
              extranotes: `${extraNotesReply}`,
              deadline: `${deadlineReply}`,
              priority: Number(priorityReply),
            };
          }
        });
    }
    if (interaction.options.getSubcommand() === "list") {
      let rProjects = client.getDesigns();
      if (!rProjects) {
        interaction.reply({
          content: "There are no projects",
          ephemeral: true,
        });
      }
      const embed = new EmbedBuilder().setTitle("Design Projects");
    }
    if (interaction.options.getSubcommand() === "show") {
      projectId = interaction.options.getString("project_id");
      projectName = interaction.options.getString("project_name");
      if (!projectId || !projectName) {
        interaction.reply({
          content: "Please specify a project name or a project id",
          ephemeral: true,
        });
      }
      let rProjectsId = client.getDesignsById.get(projectId);
      let rProjectsName = client.getDesignsByName.get(projectName);
      if (!rProjectsId || !rProjectsName) {
        interaction.reply({
          content: "There is no project with this name or id",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(project.title)
        .setDescription(project.description)
        .addFields(
          { name: "Deadline", value: `${project.deadline}`, inline: true },
          { name: "\u200B", value: "\u200B", inline: true },
          { name: "Priority", value: `${project.priority}`, inline: true }
        );
      await interaction.reply({ embeds: [embed] });
    }
  },
};
