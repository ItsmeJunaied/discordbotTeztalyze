/* eslint-disable prettier/prettier */
import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
const commands = [
    {
        name: 'capture',
        description: 'Send a message and get a reply!',
        options: [
            {
                name: 'message',
                type: 3, // String type
                description: 'The message you want to send',
                required: true,
            },
        ],
    },
];

console.log('Discord Token:', process.env.DISCORD_TOKEN);
if (!process.env.DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN is not defined');
}
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

if (!process.env.CLIENT_ID) {
    throw new Error('CLIENT_ID is not defined');
}

if (!process.env.GUILD_ID) {
    throw new Error('GUILD_ID is not defined');
}

(async () => {
    try {
        console.log('Registering commands...');
        console.log('Discord Token:', process.env.DISCORD_TOKEN);
console.log('Client ID:', process.env.CLIENT_ID);
console.log('Guild ID:', process.env.GUILD_ID);

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
            { body: commands },
        );
        console.log('Commands registered successfully!');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
})();
