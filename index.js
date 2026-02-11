import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";

const TOKEN = process.env.TOKEN;

// █ Minecraft
const MC_HOST = "playonemc.falixsrv.me";
const MC_VERSION = "1.21.11";

// █ Discord
const CHANNEL_ID = "1470099282735661068";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let statusMessage = null;

async function getMcStatus() {
  const res = await fetch(`https://api.mcstatus.io/v2/status/java/${MC_HOST}`);
  if (!res.ok) throw new Error("Fetch failed");

  const data = await res.json();

  // 🔴 jei serveris offline
  if (!data.online) {
    throw new Error("Server offline");
  }

  return data;
}

async function updateMcStatus() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    // randam seną bot žinutę
    if (!statusMessage) {
      const messages = await channel.messages.fetch({ limit: 20 });
      statusMessage = messages.find(
        m => m.author.id === client.user.id && m.embeds.length > 0
      ) || null;
    }

    let embed;

    try {
      // 🟢 ONLINE
      const data = await getMcStatus();

if (!data.online) {
  throw new Error("Server offline");
      embed = new EmbedBuilder()
        
        .setTitle("#🟢 OneMc.lt Statusas 🟢")
        .setColor(0x2ecc71)
        .setDescription(
          "**🌍 Serverio IP:**\n" +
          "```playonemc.falixsrv.me```\n" +
          "**📦 Versija:**\n" +
          "`" + MC_VERSION + "`\n"
        )
        .addFields(
          {
            name: "**📊 Serverio būsena:**",
            value: "🟢 ONLINE",
            inline: false
          },
          {
            name: "**👥 Žaidėjai:**",
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
          "```playonemc.falixsrv.me```\n" +
          "**📦 Versija:**\n" +
          "`" + MC_VERSION + "`\n"
        )
        .addFields(
          {
            name: "**📊 Serverio būsena:**",
            value: "🔴 OFFLINE",
            inline: false
          },
          {
            name: "**👥 Žaidėjai:**",
            value: "**0 / 64**",
            inline: false
          }
        )
        .setFooter({ text: "🔄 Atnaujinama kas 1 minutę" })
        .setTimestamp();
    }

    // redaguojam arba kuriam
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

client.once("ready", () => {
  console.log(`Prisijungta kaip ${client.user.tag}`);
  updateMcStatus();
  setInterval(updateMcStatus, 60_000);
});

client.login(TOKEN);
