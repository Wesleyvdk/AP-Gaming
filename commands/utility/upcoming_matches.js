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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("upcoming_match")
    .setDescription("enter an upcoming match!")
    .addStringOption((option) =>
      option
        .setName("teamone")
        .setDescription("set home team")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("teamtwo")
        .setDescription("set opposing team")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("game category")
        .setRequired(true)
        .addChoices(
          { name: "Rocket League", value: "Rocket League" },
          { name: "CSGO", value: "csgo" },
          { name: "FIFA", value: "fifa" },
          { name: "Fortnite", value: "fortnite" }
        )
    ),
  async execute(interaction) {
    const teamOne = interaction.options.getString("teamone");
    const teamTwo = interaction.options.getString("teamtwo");
    const game = interaction.options.getString("game");
    const embed = new EmbedBuilder()
      .setDescription(`AP Esports ${game} team has an upcoming match at [date]`)
      .addFields(
        { name: "Team 1", value: `${teamOne}`, inline: true },
        { name: "\u200B", value: "vs", inline: true },
        { name: "Team 2", value: `${teamTwo}`, inline: true }
      );
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`team1button`)
        .setLabel(`Vote ${teamOne}`)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`team2button`)
        .setLabel(`Vote ${teamTwo}`)
        .setStyle(ButtonStyle.Danger)
    );
    await interaction.channel.send({ embeds: [embed], components: [button] });
    try {
      const Collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
      });
      Collector.on("collect", async (i) => {
        if (i.customId === "team1button") {
          const modal = new ModalBuilder()
            .setCustomId("team1modal")
            .setTitle(`Voting ${teamOne}`);

          // Create the text input components
          const coinsBet = new TextInputBuilder()
            .setCustomId("coinsBet")
            // The label is the prompt the user sees for this input
            .setLabel("How much coins do you want to bet?")
            // Short means only a single line of text
            .setStyle(TextInputStyle.Short);
          const firstActionRow = new ActionRowBuilder().addComponents(coinsBet);

          // Add inputs to the modal
          modal.addComponents(firstActionRow);

          // Show the modal to the user
          await i.showModal(modal);
        }
        if (i.customId === "team2button") {
          const modal = new ModalBuilder()
            .setCustomId("team2modal")
            .setTitle(`Voting ${teamTwo}`);

          // Create the text input components
          const coinsBet = new TextInputBuilder()
            .setCustomId("coinsBet")
            // The label is the prompt the user sees for this input
            .setLabel("How much coins do you want to bet?")
            // Short means only a single line of text
            .setStyle(TextInputStyle.Short);
          const firstActionRow = new ActionRowBuilder().addComponents(coinsBet);

          // Add inputs to the modal
          modal.addComponents(firstActionRow);

          // Show the modal to the user
          await i.showModal(modal);
        }
      });
    } catch (e) {
      console.log(e);
    }
  },
};
