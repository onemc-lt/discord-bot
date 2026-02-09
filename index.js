const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require("discord.js");
const mc = require("minecraft-server-util");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const TOKEN = process.env.TOKEN;
const MC_IP = "playonemc.falixsrv.me"; // pvz. play.serveris.lt
const MC_PORT = 21449;

client.once("ready", () => {
  console.log(`Prisijungta kaip ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // 📢 ANNOUNCE
  if (interaction.commandName === "announce") {
    const text = interaction.options.getString("text");
    const image = interaction.options.getString("image");

    const embed = new EmbedBuilder()
      .setTitle("📢 Pranešimas")
      .setDescription(text)
      .setColor("Green")
      .setImage(image)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  // 🎫 TICKET
  if (interaction.commandName === "ticket") {
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
      ],
    });

    await channel.send(`🎫 Sveiki ${interaction.user}, aprašykite savo problemą.`);
    await interaction.reply({ content: `Ticket sukurtas: ${channel}`, ephemeral: true });
  }

  // ⛏️ MC STATUS
  if (interaction.commandName === "mcstatus") {
    try {
      const status = await mc.status(MC_IP, MC_PORT);
      const embed = new EmbedBuilder()
        .setTitle("⛏️ Minecraft Serveris")
        .setColor("Blue")
        .addFields(
          { name: "Statusas", value: "🟢 Online", inline: true },
          { name: "Žaidėjai", value: `${status.players.online}/${status.players.max}`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    } catch {
      await interaction.reply("🔴 Serveris offline");
    }
  }
});

client.login(TOKEN);
