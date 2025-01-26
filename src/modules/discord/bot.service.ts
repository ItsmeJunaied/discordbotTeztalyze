/* eslint-disable prettier/prettier */
import { Client, GatewayIntentBits } from 'discord.js';
import { Injectable, OnModuleInit } from '@nestjs/common';

import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class BotService implements OnModuleInit {
  private readonly client: Client;

  constructor() {
    this.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
  }

  async onModuleInit() {
    await this.client.login(process.env.DISCORD_TOKEN);

    this.client.on('ready', () => {
      if (this.client.user) {
        console.log(`Bot logged in as ${this.client.user.tag}`);
      } else {
        console.log('Bot logged in, but user is null');
      }
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return;

      const { commandName } = interaction;

      if (commandName === 'capture') {
        const userMessage = interaction.options.get('message')?.value as string;
        await interaction.reply(`Hello - this is your message -> ${userMessage}`);
      }
    });
  }
}
