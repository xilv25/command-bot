const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

let interval = null;
let messageContent = "Pesan default 🚀";
let delay = 300000; // default 5 menit
const channelId = "ID_CHANNEL"; // ganti ID channel tujuan

// --- Slash Commands Setup ---
const commands = [
  new SlashCommandBuilder()
    .setName("speed")
    .setDescription("Set interval pengiriman pesan")
    .addIntegerOption(option =>
      option.setName("detik")
        .setDescription("Interval dalam detik")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("content")
    .setDescription("Set isi pesan otomatis")
    .addStringOption(option =>
      option.setName("text")
        .setDescription("Isi pesan yang mau dikirim")
        .setRequired(true)
    )
].map(command => command.toJSON());

client.once("ready", async () => {
  console.log(`Bot logged in as ${client.user.tag}`);

  // Register slash commands
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log("Slash commands registered!");
  } catch (err) {
    console.error(err);
  }

  startInterval(); // mulai auto message
});

// --- Function untuk interval ---
function startInterval() {
  if (interval) clearInterval(interval);

  interval = setInterval(() => {
    const channel = client.channels.cache.get(channelId);
    if (channel) {
      channel.send(messageContent);
    }
  }, delay);
}

// --- Event Slash Command ---
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "speed") {
    const detik = interaction.options.getInteger("detik");
    delay = detik * 1000;
    startInterval();
    await interaction.reply(`✅ Interval diubah jadi **${detik} detik**`);
  }

  if (interaction.commandName === "content") {
    const text = interaction.options.getString("text");
    messageContent = text;
    await interaction.reply(`✅ Pesan otomatis diubah jadi: \n> ${text}`);
  }
});

client.login(process.env.TOKEN);
