const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");

// ====== KONFIGŪRACIJA ======
const TOKEN = process.env.TOKEN;

const MC_HOST = "play.onemc.lt";
const MC_VERSION = "1.21.x";

// Kanalo ID
const CHANNEL_ID = "1470099282735661068";

// Jei nori redaguoti tą pačią žinutę – įrašyk jos ID
// Jei paliksi null → botas sukurs naują
const MESSAGE_ID = null;
// ===========================

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Apsauga nuo crash
process.on("unhandledRejection", err => {
  console.error("Unhandled Rejection:", err);
});
process.on("uncaughtException", err => {
  console.error("Uncaught Exception:", err);
});

async function updateMcStatus() {
  try {
    const res = await fetch(
      `https://api.mcstatus.io/v2/status/java/${MC_HOST}`,
      { timeout: 10000 }
    );
    const data = await res.json();

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    let message = null;

    if (MESSAGE_ID) {
      try {
        message = await channel.messages.fetch(MESSAGE_ID);
      } catch {
        message = null;
      }
    }

    let content = `**OneMc.lt**

IP: ${MC_HOST}
Version: ${MC_VERSION}

`;

    if (!data.online) {
      content += `🔴 **STATUSAS:** Offline`;
    } else {
      content += `🟢 **STATUSAS:** Online

👥 **ŽAIDĖJAI:**
${data.players.online}/${data.players.max}`;
    }

    if (message) {
      await message.edit(content);
    } else {
      await channel.send(content);
    }

  } catch (err) {
    console.error("MC status klaida:", err);
  }
}

client.once("ready", () => {
  console.log(`Prisijungta kaip ${client.user.tag}`);

  updateMcStatus();              // iškart
  setInterval(updateMcStatus, 60_000); // kas 1 minutę
});

client.login(TOKEN);

