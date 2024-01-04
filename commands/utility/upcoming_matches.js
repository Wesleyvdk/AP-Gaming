const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  channelLink,
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
        .setCustomId(`team1`)
        .setLabel(`Vote ${teamOne}`)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`team2`)
        .setLabel(`Vote ${teamTwo}`)
        .setStyle(ButtonStyle.Danger)
    );
    await channel.send({ embeds: [embed], components: [button] });
  },
};
