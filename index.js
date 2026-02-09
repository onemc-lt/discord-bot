import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import { status } from "minecraft-server-util";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

// ⬇️ SVARBU
const CHANNEL_ID = "1470099282735661068"; // tavo kanalas
const MESSAGE_ID = "https://discord.com/channels/1470032921896288340/1470099282735661068/1470495900618068010"; // 👈 PAKEISI

const MC_HOST = "play.onemc.lt";
const MC_PORT = 25565;

async function updateMcStatus() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    const message = await channel.messages.fetch(MESSAGE_ID);

    let embed;

    try {
      const res = await status(MC_HOST, MC_PORT);

      embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("🟢 OneMc.lt")
        .setDescription(
          `**IP:** play.onemc.lt\n` +
          `**Versija:** 1.21.x\n\n` +
          `**STATUSAS:** Online\n` +
          `**ŽAIDĖJAI:** ${res.players.online}/${res.players.max}`
        )
        .setFooter({ text: "Atnaujinama kas 1 minutę" })
        .setTimestamp();

    } catch {
      embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("🔴 OneMc.lt")
        .setDescription(
          `**IP:** play.onemc.lt\n` +
          `**Versija:** 1.21.x\n\n` +
          `**STATUSAS:** Offline`
        )
        .setFooter({ text: "Atnaujinama kas 1 minutę" })
        .setTimestamp();
    }

    await message.edit({ embeds: [embed] });

  } catch (err) {
    console.error("MC status klaida:", err.message);
  }
}

client.once("ready", async () => {
  console.log(`Prisijungta kaip ${client.user.tag}`);

  updateMcStatus();
  setInterval(updateMcStatus, 60_000);
});

client.login(TOKEN);
