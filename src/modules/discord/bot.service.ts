/* eslint-disable prettier/prettier */
import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType, TextChannel } from 'discord.js';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class BotService implements OnModuleInit {
  private readonly client: Client;

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });
  }

  async onModuleInit() {
    const token = process.env.DISCORD_TOKEN;

    if (!token) {
      throw new Error('DISCORD_TOKEN is not defined in the .env file.');
    }

    console.log('Logging in with token:', token);

    try {
      await this.client.login(token);

      this.client.on('ready', () => {
        if (this.client.user) {
          console.log(`Bot logged in as ${this.client.user.tag}`);
        } else {
          console.error('Client user is null');
        }
      });

      this.client.on('interactionCreate', async (interaction) => {
        if (interaction.type === InteractionType.ApplicationCommand) {
          const { commandName } = interaction;

          if (commandName === 'capture') {
            const userMessage = interaction.options.get('message')?.value as string;

            // Create a button
            const button = new ButtonBuilder()
              .setCustomId('send_message')
              .setLabel('Send')
              .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

            // Respond with the message and a button
            await interaction.reply({
              content: `Hello - this is your message: "${userMessage}"`,
              components: [row],
              ephemeral: true, // Only visible to the command user
            });

            // Save the message for button interaction handling
            this.client.once('interactionCreate', async (buttonInteraction) => {
              if (
                buttonInteraction.isButton() &&
                buttonInteraction.customId === 'send_message'
              ) {
                // Respond to the button interaction
                await buttonInteraction.reply({
                  content: `Message sent on behalf of ${buttonInteraction.user.username}: "${userMessage}"`,
                });

                // Send the message as the bot (indicating it's from the user)
                if (interaction.channel?.isTextBased()) {
                  await (interaction.channel as TextChannel).send(
                    `**${buttonInteraction.user.username} says:** ${userMessage}`
                  );
                }
              }
            });
          }
        }
      });
    } catch (error) {
      console.error('Error logging in to Discord:', error.message);
    }
  }
}
