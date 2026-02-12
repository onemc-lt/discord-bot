import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField
} from "discord.js";

const TOKEN = process.env.TOKEN;

// █ Minecraft
const MC_HOST = "playonemc.falixsrv.me";
const MC_VERSION = "1.21.11";

// █ Discord
const STATUS_CHANNEL_ID = "1470099282735661068"; // statuso kanalas

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let statusMessage = null;

// =====================
// MC STATUS
// =====================
async function getMcStatus() {
  const res = await fetch(`https://api.mcstatus.io/v2/status/java/${MC_HOST}`);
  if (!res.ok) throw new Error("Fetch failed");

  const data = await res.json();
  if (!data.online) throw new Error("Server offline");

  return data;
}

// =====================
// UPDATE STATUS
// =====================
async function updateMcStatus() {
  try {
    const channel = await client.channels.fetch(STATUS_CHANNEL_ID);
    if (!channel) return;

    // rasti seną statuso žinutę
    if (!statusMessage) {
      const messages = await channel.messages.fetch({ limit: 20 });
      statusMessage =
        messages.find(
          m => m.author.id === client.user.id && m.embeds.length > 0
        ) || null;
    }

    let embed;

    try {
      // 🟢 ONLINE
      const data = await getMcStatus();

      embed = new EmbedBuilder()
        .setTitle("# 🟢 OneMc.lt Statusas 🟢")
        .setColor(0x2ecc71)
        .setDescription(
          "**🌍 Serverio IP:**\n" +
          "`playonemc.falixsrv.me`\n\n" +
          "**📦 Versija:**\n" +
          "`" + MC_VERSION + "`"
        )
        .addFields(
          {
            name: "📊 Serverio būsena",
            value: "🟢 ONLINE",
            inline: false
          },
          {
            name: "👥 Žaidėjai",
            value: `${data.players.online} / 64`,
            inline: false
          }
        )
        .setFooter({ text: "🔄 Atnaujinama kas 1 minutę" })
        .setTimestamp();

    } catch {
      // 🔴 OFFLINE
      embed = new EmbedBuilder()
        .setTitle("# 🔴 OneMc.lt Statusas 🔴")
        .setColor(0xe74c3c)
        .setDescription(
          "**🌍 Serverio IP:**\n" +
          "`playonemc.falixsrv.me`\n\n" +
          "**📦 Versija:**\n" +
          "`" + MC_VERSION + "`"
        )
        .addFields(
          {
            name: "📊 Serverio būsena",
            value: "🔴 OFFLINE",
            inline: false
          },
          {
            name: "👥 Žaidėjai",
            value: "0 / 64",
            inline: false
          }
        )
        .setFooter({ text: "🔄 Atnaujinama kas 1 minutę" })
        .setTimestamp();
    }

    // redaguoti arba kurti
    if (statusMessage) {
      try {
        await statusMessage.edit({ embeds: [embed] });
      } catch {
        statusMessage = await channel.send({ embeds: [embed] });
      }
    } else {
      statusMessage = await channel.send({ embeds: [embed] });
    }

  } catch (err) {
    console.error("MC status klaida:", err);
  }
}

// =====================
// ANNOUNCE COMMAND
// =====================
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "announce") return;

  // 🔒 Tik administratoriai
  if (
    !interaction.member.permissions.has(
      PermissionsBitField.Flags.Administrator
    )
  ) {
    return interaction.reply({
      content: "❌ Šią komandą gali naudoti tik administratoriai.",
      ephemeral: true
    });
  }

  const channel = interaction.options.getChannel("kanalas");
  const title = interaction.options.getString("title");
  const tekstas = interaction.options.getString("tekstas");
  const paveikslelis = interaction.options.getString("paveikslelis");

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(tekstas)
    .setColor(0x3498db)
    .setTimestamp();

  if (paveikslelis) embed.setImage(paveikslelis);

  await channel.send({ embeds: [embed] });

  await interaction.reply({
    content: `✅ Announcement išsiųstas į ${channel}`,
    ephemeral: true
  });
});

// =====================
// READY
// =====================
client.once("ready", () => {
  console.log(`✅ Prisijungta kaip ${client.user.tag}`);
  updateMcStatus();
  setInterval(updateMcStatus, 60_000);
});

client.login(TOKEN);
