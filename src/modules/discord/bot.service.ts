/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import { Injectable, OnModuleInit } from '@nestjs/common';
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
  InteractionReplyOptions,
} from 'discord.js';
import * as dotenv from 'dotenv';
import { GrammarCorrectionService } from './grammar-correction.service';

dotenv.config();

@Injectable()
export class BotService implements OnModuleInit {
  private readonly client: Client;

  constructor(
    private readonly grammarCorrectionService: GrammarCorrectionService,
  ) {
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
            await interaction.deferReply({ ephemeral: true });

            const originalMessage = interaction.options.get('message')?.value as string;

            // Function to check if a message is mostly English
            function isEnglish(text: string): boolean {
              const englishChars = text.match(/[a-zA-Z0-9\s.,!?'"()]/g) || []; 
              return englishChars.length / text.length > 0.8; 
            }

 
            const messageLength = [...originalMessage].length;

            const charLimit = isEnglish(originalMessage) ? 2000 : 1000;

            if (messageLength > charLimit) {
              await interaction.editReply({
                content: `❌ Your message exceeds the ${charLimit}-character limit.\n(English Limit: 2000, Non-English Limit: 1000)\nYour current character count: ${messageLength}`,
              });
              return;
            }




            let correctedMessage = originalMessage;

            // Correct grammar
            try {
              correctedMessage = await this.grammarCorrectionService.correctGrammar(originalMessage);
            } catch (error) {
              console.error('Error correcting grammar:', error.message);
              await interaction.editReply({ content: 'Failed to correct grammar. Please try again.' });
              return;
            }

            // Create Send, Send Original, Edit, and Cancel buttons
            const sendButton = new ButtonBuilder()
              .setCustomId('send_message')
              .setLabel('Send Corrected')
              .setStyle(ButtonStyle.Primary);

            const sendOriginalButton = new ButtonBuilder()
              .setCustomId('send_original')
              .setLabel('Send Original')
              .setStyle(ButtonStyle.Secondary);

            // const cancelButton = new ButtonBuilder()
            //   .setCustomId('cancel_message')
            //   .setLabel('Cancel')
            //   .setStyle(ButtonStyle.Danger);

            const editButton = new ButtonBuilder()
              .setCustomId('edit_message')
              .setLabel('Edit')
              .setStyle(ButtonStyle.Secondary);

            const copyButton = new ButtonBuilder()
              .setCustomId('copy_message')
              .setLabel('Copy')
              .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
              sendButton,
              sendOriginalButton,
              editButton,
              // cancelButton,
              copyButton
            );

            // Respond with the corrected message and buttons
            await interaction.editReply({
              content: `Corrected Message:\n${correctedMessage}`,
              components: [row],
            });

            // Store the original message in a map for later use in the button interactions
            this.storeOriginalMessage(interaction.id, originalMessage);
          }
        }

        if (interaction.isButton()) {
          const { customId } = interaction;

          // Handle "Send Corrected" button
          if (customId === 'send_message') {
            const correctedMessage = interaction.message.content.replace('Corrected Message:\n', '');
            await this.sendMessageToChannel(interaction, correctedMessage, 'Corrected message sent successfully!');
          }

          // Handle "Send Original" button
          if (customId === 'send_original') {
            const originalMessage = this.getOriginalMessage(interaction.message.interaction?.id);

            if (originalMessage) {
              await this.sendMessageToChannel(interaction, originalMessage, 'Original message sent successfully!');
            } else {
              await interaction.reply({
                content: 'Failed to retrieve the original message.',
                ephemeral: true,
              });
            }
          }

          // Handle "Copy Message" button
          // Handle "Copy Message" button
          if (customId === 'copy_message') {
            const correctedMessage = interaction.message.content.replace('Corrected Message:\n', '');

            await interaction.reply({
              content: `📋 **Copy the corrected message below and paste it manually:**\n\`\`\`${correctedMessage}\`\`\``,
              ephemeral: true,
            });
          }



          // if (customId === 'cancel_message') {
          //   try {
          //     await interaction.deferReply({ ephemeral: true }); // Defers the reply to avoid timing issues
          //     await interaction.editReply({ content: 'Action cancelled.' }); // Show "Action cancelled."
          //     await interaction.message.delete(); // Delete the original message
          //   } catch (error) {
          //     console.error('Error deleting the message:', error.message);
          //     await interaction.followUp({
          //       content: 'Failed to delete the message. Please try again.',
          //       ephemeral: true,
          //     });
          //   }
          // }

          // Handle "Edit" button
          if (customId === 'edit_message') {
            const modal = new ModalBuilder()
              .setCustomId('edit_message_modal')
              .setTitle('Edit Your Message');

            const messageInput = new TextInputBuilder()
              .setCustomId('new_message_input')
              .setLabel('Enter your new message')
              .setStyle(TextInputStyle.Paragraph)
              .setPlaceholder('Type your message here...')
              .setValue(interaction.message.content.replace('Corrected Message:\n', ''))
              .setRequired(true);

            const modalRow = new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput);

            modal.addComponents(modalRow);

            await interaction.showModal(modal);
          }
        }

        if (interaction.isModalSubmit() && interaction.customId === 'edit_message_modal') {
          const newMessage = interaction.fields.getTextInputValue('new_message_input');
          await interaction.reply({ content: newMessage });
        }
      });
    } catch (error) {
      console.error('Error logging in to Discord:', error.message);
    }
  }

  private messageCache = new Map<string, string>();

  // Store the original message in a cache
  private storeOriginalMessage(interactionId: string, message: string) {
    this.messageCache.set(interactionId, message);
  }

  // Retrieve the original message from the cache
  private getOriginalMessage(interactionId?: string): string | undefined {
    return interactionId ? this.messageCache.get(interactionId) : undefined;
  }

  // Function to send a message to the channel and update the interaction
  private async sendMessageToChannel(interaction: any, message: string, successMessage: string) {
    try {
      if (interaction.channel?.isTextBased() && interaction.channel instanceof TextChannel) {
        await interaction.channel.send(message);
        await interaction.deferUpdate();
        await interaction.editReply({
          content: successMessage,
          components: [],
        });
        setTimeout(async () => {
          try {
            await interaction.deleteReply();
          } catch (deleteError) {
            console.error('Failed to delete the ephemeral message:', deleteError.message);
          }
        }, 3000);
      } else {
        console.error('Channel is not a text channel');
        await interaction.reply({
          content: 'This command can only be used in text channels.',
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error('Error sending message to channel:', error.message);
      if (error.code === 50001) {
        await interaction.reply({
          content: 'I do not have permission to send messages in this channel. Please check my permissions.',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `Failed to send the message. Error: ${error.message}`,
          ephemeral: true,
        });
      }
    }
  }
}
