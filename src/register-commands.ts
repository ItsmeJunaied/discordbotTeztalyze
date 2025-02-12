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

// Check for required environment variables
if (!process.env.DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN is not defined');
}

if (!process.env.CLIENT_ID) {
    throw new Error('CLIENT_ID is not defined');
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Registering global commands...');
        console.log('Discord Token:', process.env.DISCORD_TOKEN);
        console.log('Client ID:', process.env.CLIENT_ID);

        // Register commands globally
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID!),
            { body: commands },
        );

        console.log('Global commands registered successfully!');
    } catch (error) {
        console.error('Error registering global commands:', error);
    }
})();