import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands = [
  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Paskelbti pranešimą su embed')
    .addStringOption(opt =>
      opt.setName('tekstas')
        .setDescription('Žinutės tekstas')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('paveikslelis')
        .setDescription('Paveiksliuko URL (nebūtina)')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('mcstatus')
    .setDescription('Parodo Minecraft serverio statusą')
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

await rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: commands }
);

console.log('✅ Slash komandos užregistruotos');
