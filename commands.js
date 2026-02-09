const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1470419253797720108";

const commands = [
  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Siųsti pranešimą su nuotrauka")
    .addStringOption(o =>
      o.setName("text").setDescription("Tekstas").setRequired(true))
    .addStringOption(o =>
      o.setName("image").setDescription("Nuotraukos URL").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Sukurti support ticket"),

  new SlashCommandBuilder()
    .setName("mcstatus")
    .setDescription("Minecraft serverio statusas")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
  .then(() => console.log("✅ Slash komandos užregistruotos"))
  .catch(console.error);
