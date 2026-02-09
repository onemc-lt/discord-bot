import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";

const TOKEN = process.env.TOKEN;

// █ Minecraft
const MC_HOST = "play.onemc.lt";
const MC_VERSION = "1.21.x";

// █ Discord
const CHANNEL_ID = "1470099282735661068";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let statusMessage = null;

async function getMcStatus() {
  try {
    const res = await fetch(`https://api.mcstatus.io/v2/status/java/${MC_HOST}`);
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  } catch (err) {
    throw err;
  }
}

async function updateMcStatus() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    // jei neturim žinutės dar – ieškome paskutinės bot žinutės
    if (!statusMessage) {
      const messages = await channel.messages.fetch({ limit: 20 });
      statusMessage = messages.find(
        msg => msg.author.id === client.user.id && msg.embeds.length > 0
      ) || null;
    }

    let embed;

    // bandome gauti serverio info
    try {
      const data = await getMcStatus();

      embed = new EmbedBuilder()
        .setTitle("🟢 OneMc.lt Minecraft serverio statusas")
        .setColor(0x2ecc71)
        .addFields(
          { name: "IP:", value: MC_HOST, inline: true },
          { name: "Version:", value: MC_VERSION, inline: true },
          { name: "Statusas:", value: "🟢 Online", inline: true },
          { name: "Žaidėjai:", value: `${data.players.online}/${data.players.max}`, inline: true }
        )
        .setFooter({ text: "Atnaujinama kas 1 minutę" })
        .setTimestamp();

    } catch (err) {
      // jei serveris offline arba fetch error
      embed = new EmbedBuilder()
        .setTitle("🔴 OneMc.lt Minecraft serverio statusas")
        .setColor(0xe74c3c)
        .addFields(
          { name: "IP:", value: MC_HOST, inline: true },
          { name: "Version:", value: MC_VERSION, inline: true },
          { name: "Statusas:", value: "🔴 Offline", inline: true }
        )
        .setFooter({ text: "Atnaujinama kas 1 minutę" })
        .setTimestamp();
    }

    // jei radome seną žinutę – redaguojame
    if (statusMessage) {
      try {
        await statusMessage.edit({ embeds: [embed] });
      } catch {
        // jei redagavimas nepavyksta (pvz. žinutė ištrinta) – sukuriame naują
        statusMessage = await channel.send({ embeds: [embed] });
      }
    } else {
      // jei neturim jokios – kuriam naują
      statusMessage = await channel.send({ embeds: [embed] });
    }

  } catch (err) {
    console.error("MC status klaida:", err);
  }
}

client.once("ready", () => {
  console.log(`Prisijungta kaip ${client.user.tag}`);
  // iškarto atnaujinam statusą
  updateMcStatus();

  // ir toliau atnaujinam kas minutę
  setInterval(updateMcStatus, 60 * 1000); // 60s
});

client.login(TOKEN);
