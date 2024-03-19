const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  AttachmentBuilder,
  messageLink,
  roleMention,
} = require("discord.js");
require("dotenv").config();
const Database = require("better-sqlite3");
const moment = require("moment/moment");

const APdb = new Database("./database/AP.sqlite");

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember,
    Partials.ThreadMember,
    Partials.GuildScheduledEvent,
  ],
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

client.once(Events.ClientReady, async () => {
  const APTable = APdb.prepare(
    "SELECT count() FROM sqlite_master WHERE type='table' AND name = 'designs';"
  ).get();
  if (!APTable["count()"]) {
    // If the table isn't there, create it and setup the database correctly.

    APdb.prepare(
      "CREATE TABLE designs (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, extranotes TEXT, deadline TEXT, priority INTEGER, completed INTEGER, completedDate TEXT);"
    ).run();
    APdb.prepare("CREATE UNIQUE INDEX idx_design_id ON designs (id);").run();
    APdb.exec("PRAGMA journal_mode = WAL;");
  }
  client.getDesignsByName = APdb.prepare(
    "SELECT * FROM designs WHERE name = ?"
  );
  client.getDesignsById = APdb.prepare("SELECT * FROM designs WHERE id = ?");
  client.getDesigns = APdb.prepare("SELECT * FROM designs");
  client.setDesigns = APdb.prepare(
    "INSERT OR REPLACE INTO designs (name, description, extranotes, deadline, priority, completed, completedDate) VALUES (@name, @description, @extranotes, @deadline, @priority, @completed, @completedDate);"
  );
  client.setDesignsCompletedById = APdb.prepare(
    "UPDATE designs SET completed = @completed, completedDate = @completedDate WHERE id = @id;"
  );
  client.setDesignsCompletedByName = APdb.prepare(
    "UPDATE designs SET completed = @completed, completedDate = @completedDate  WHERE name = @name;"
  );
  client.setDesignsUpdateById = APdb.prepare(
    "UPDATE designs SET name = @name, description = @description, deadline = @deadline, priority = @priority WHERE id = @id;"
  );
  client.setDesignsDeleteById = APdb.prepare(
    "DELETE from designs WHERE id = @id;"
  );
  console.log(`designs table loaded successfully`);
  console.log(`logged in as: ${client.user.username}. ready to be used!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(client, interaction, APdb);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.id === "1187457826747076608") return;
  if (message.channel.id === "1188979321457614878") {
    // NOTIFICATIE CHANNELS

    // bsl-announcements
    const roleName = "BSL notif.";
    const role = message.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    const roleMention = role.toString();
    message.channel.send(roleMention);
  }
  // Apex News
  if (message.channel.id === "1189105088296402984") {
    const roleName = "Apex news";
    const role = message.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    const roleMention = role.toString();
    message.channel.send(roleMention);
  }
  // CSGO news
  if (message.channel.id === "1189104957266329700") {
    const roleName = "CSGO news";
    const role = message.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    const roleMention = role.toString();
    message.channel.send(roleMention);
  }
  // FIFA news
  if (message.channel.id === "1189104806992826388") {
    const roleName = "FIFA news";
    const role = message.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    const roleMention = role.toString();
    message.channel.send(roleMention);
  }
  // Fortnite news
  if (message.channel.id === "1189104997154181140") {
    const roleName = "Fortnite news";
    const role = message.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    const roleMention = role.toString();
    message.channel.send(roleMention);
  }
  // LOL news
  if (message.channel.id === "1189104745743388693") {
    const roleName = "LOL news";
    const role = message.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    const roleMention = role.toString();
    message.channel.send(roleMention);
  }
  // Overwatch news
  if (message.channel.id === "1189104912613781524") {
    const roleName = "Overwatch news";
    const role = message.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    const roleMention = role.toString();
    message.channel.send(roleMention);
  }
  // R6S news
  if (message.channel.id === "1189105140028944384") {
    const roleName = "R6S news";
    const role = message.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    const roleMention = role.toString();
    message.channel.send(roleMention);
  }
  // RL news
  if (message.channel.id === "1189104613647990804") {
    const roleName = "RL news";
    const role = message.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    const roleMention = role.toString();
    message.channel.send(roleMention);
  }
  // Valorant news
  if (message.channel.id === "1189104689816551454") {
    const roleName = "Valorant news";
    const role = message.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    const roleMention = role.toString();
    message.channel.send(roleMention);
  }
  // Gaming news
  if (message.channel.id === "1193197272096313405") {
    const roleName = "Gaming news";
    const role = message.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    const roleMention = role.toString();
    message.channel.send(roleMention);
  }
  // upcoming matches notif,
  if (message.channel.id === "1188687188620218459") {
    const roleName = "Upcoming matches notif.";
    const role = message.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    const roleMention = role.toString();
    message.channel.send(roleMention);
  }
});
client.login(process.env.DISCORD_TOKEN);
