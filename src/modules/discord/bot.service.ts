/* eslint-disable prettier/prettier */
import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionType,
  TextChannel,
  TextInputBuilder,
  ModalBuilder,
  TextInputStyle,
} from 'discord.js';
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
            let userMessage = interaction.options.get('message')?.value as string;

            // Create Send, Cancel, and Edit buttons
            const sendButton = new ButtonBuilder()
              .setCustomId('send_message')
              .setLabel('Send')
              .setStyle(ButtonStyle.Primary);

            const cancelButton = new ButtonBuilder()
              .setCustomId('cancel_message')
              .setLabel('Cancel')
              .setStyle(ButtonStyle.Danger);

            const editButton = new ButtonBuilder()
              .setCustomId('edit_message')
              .setLabel('Edit')
              .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
              sendButton,
              editButton,
              cancelButton
            );

            // Respond with the message and buttons
            await interaction.reply({
              content: `${userMessage}`,
              components: [row],
              ephemeral: true, 
            });

            // Handle button interactions
            this.client.on('interactionCreate', async (buttonInteraction) => {
              if (!buttonInteraction.isButton()) return;

              // Handle Send button
              if (buttonInteraction.customId === 'send_message') {
                await buttonInteraction.reply({
                  content: `${userMessage}`,
                  // ephemeral: true,
                });

                if (interaction.channel?.isTextBased()) {
                  await (interaction.channel as TextChannel).send(
                    `**${buttonInteraction.user.username} says:** ${userMessage}`
                  );
                }
              }

              // Handle Cancel button
              if (buttonInteraction.customId === 'cancel_message') {
                // Delete the original bot response
                await interaction.deleteReply();
              }

              // Handle Edit button
              if (buttonInteraction.customId === 'edit_message') {
                // Create a modal for editing the message
                const modal = new ModalBuilder()
                  .setCustomId('edit_message_modal')
                  .setTitle('Edit Your Message');

                const messageInput = new TextInputBuilder()
                  .setCustomId('new_message_input')
                  .setLabel('Enter your new message')
                  .setStyle(TextInputStyle.Paragraph)
                  .setPlaceholder('Type your message here...')
                  .setValue(userMessage)
                  .setRequired(true);

                const modalRow = new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput);

                modal.addComponents(modalRow);

                // Show the modal to the user
                await buttonInteraction.showModal(modal);
              }
            });

            // Handle modal submissions
            this.client.on('interactionCreate', async (modalInteraction) => {
              if (!modalInteraction.isModalSubmit()) return;

              if (modalInteraction.customId === 'edit_message_modal') {
                const newMessage = modalInteraction.fields.getTextInputValue('new_message_input');

                // Update the interaction with the new message and buttons
                await modalInteraction.reply({
                  content: ` ${newMessage}`,
                  components: [row],
                  ephemeral: true,
                });

                // Update the userMessage variable for further actions
                userMessage = newMessage;
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
