import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField
} from "discord.js";

import "./commands.js";

const TOKEN = process.env.TOKEN;

// █ Minecraft
const MC_HOST = "play.onemc.lt";
const MC_VERSION = "1.21.8";

// █ Discord
const STATUS_CHANNEL_ID = "1470099282735661068";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let statusMessage = null;

// =====================
// MC STATUS FETCH
// =====================
async function getMcStatus() {
  try {
    const res = await fetch(`https://api.mcsrvstat.us/2/${MC_HOST}`);
    if (!res.ok) throw new Error("Fetch failed");
    return await res.json();
  } catch (err) {
    console.error("API klaida:", err);
    return null;
  }
}

// =====================
// UPDATE STATUS
// =====================
async function updateMcStatus() {
  try {
    const channel = await client.channels.fetch(STATUS_CHANNEL_ID);
    if (!channel) return;

    if (!statusMessage) {
      const messages = await channel.messages.fetch({ limit: 20 });
      statusMessage =
        messages.find(
          m => m.author.id === client.user.id && m.embeds.length > 0
        ) || null;
    }

    const data = await getMcStatus();
    let embed;

    if (data && data.online === true) {
      // 🟢 ONLINE
      embed = new EmbedBuilder()
        .setTitle("## **🟢 OneMc.lt Statusas 🟢**")
        .setColor(0x2ecc71)
        .addFields(
          {
            name: "**🌍 Serverio IP:**",
            value: "play.onemc.lt",
            inline: false
          },
          {
            name: "**📌 Versija:**",
            value: MC_VERSION,
            inline: false
          },
          {
            name: "## **📈 Serverio būsena:**",
            value: "🟢 ONLINE",
            inline: false
          },
          {
            name: "**👥 Žaidėjai:**",
            value: data.players
              ? `${data.players.online} / 64`
              : "0 / 64",
            inline: false
          }
        )
        .setFooter({ text: "🔄 Atnaujinama kas 1 minutę" })
        .setTimestamp();

    } else {
      // 🔴 OFFLINE
      embed = new EmbedBuilder()
        .setTitle("**🔴 OneMc.lt Statusas 🔴**")
        .setColor(0xe74c3c)
        .addFields(
          {
            name: "**🌍 Serverio IP:**",
            value: "play.onemc.lt",
            inline: false
          },
          {
            name: "**📌 Versija:**",
            value: MC_VERSION,
            inline: false
          },
          {
            name: "**📉 Serverio būsena:**",
            value: "🔴 OFFLINE",
            inline: false
          },
          {
            name: "**👥 Žaidėjai:**",
            value: "0 / 64",
            inline: false
          }
        )
        .setFooter({ text: "🔄 Atnaujinama kas 1 minutę" })
        .setTimestamp();
    }

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
