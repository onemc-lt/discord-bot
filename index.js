import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";

const TOKEN = process.env.TOKEN;

// ===== Minecraft =====
const MC_HOST = "play.onemc.lt";
const MC_VERSION = "1.21.x";

// ===== Discord =====
const CHANNEL_ID = "1470099282735661068";

// ===== Client =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let statusMessage = null;

// ===== Minecraft status =====
async function getMcStatus() {
  const res = await fetch(`https://api.mcstatus.io/v2/status/java/${MC_HOST}`);
  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
  return res.json();
}

async function updateMcStatus() {
  try {
    const data = await getMcStatus();
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle("OneMc.lt")
      .setColor(data.online ? 0x2ecc71 : 0xe74c3c)
      .addFields(
        { name: "IP", value: MC_HOST, inline: true },
        { name: "Version", value: MC_VERSION, inline: true },
        {
          name: "Statusas",
          value: data.online
            ? `🟢 Online\n👥 ${data.players.online}/${data.players.max}`
            : "🔴 Offline"
        }
      )
      .setFooter({ text: "Atnaujinama kas 1 minutę" })
      .setTimestamp();

    // jei dar neturim žinutės – ieškom paskutinės
    if (!statusMessage) {
      const messages = await channel.messages.fetch({ limit: 5 });
      statusMessage = messages.find(m => m.author.id === client.user.id) || null;
    }

    if (statusMessage) {
      await statusMessage.edit({ embeds: [embed] });
    } else {
      statusMessage = await channel.send({ embeds: [embed] });
    }

  } catch (err) {
    console.error("MC status klaida:", err.message);
  }
}

client.once("ready", () => {
  console.log(`Prisijungta kaip ${client.user.tag}`);
  updateMcStatus();
  setInterval(updateMcStatus, 60_000);
});

client.login(TOKEN);

