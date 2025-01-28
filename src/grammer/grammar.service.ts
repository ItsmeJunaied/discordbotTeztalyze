/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DiscordService {
  private originalMessages: Map<string, string> = new Map(); // Temporarily store original messages in-memory

  // Store the original message temporarily (you can use database if required)
  async storeOriginalMessage(message: string): Promise<void> {
    // Temporary storage in-memory (for example, in a Map)
    const messageId = this.generateMessageId();
    this.originalMessages.set(messageId, message);

    // Optionally, you can store the message in a database for persistence if needed
    console.log('Original message stored:', message);
  }

  // Call the grammar correction function (replace with your actual grammar correction logic)
  async correctGrammar(text: string): Promise<string> {
    try {
      const apiKey = process.env.OPENAI_API_KEY; // Retrieve API key from environment
      if (!apiKey) {
        throw new Error('OpenAI API Key is missing.');
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content:
                'Rewrite the following text to correct any grammar or spelling errors without changing its meaning.',
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: 0.2,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const correctedText = response.data.choices[0].message.content;
      return correctedText || text; // Return the original text if no correction is provided
    } catch (error) {
      console.error('Error with OpenAI API:', error.message || error);
      throw new Error('Failed to correct grammar');
    }
  }

  // Send the corrected message (via Discord bot)
  async sendCorrectedMessage(correctedMessage: string): Promise<void> {
    // Here you would send the corrected message to Discord, e.g., using Discord.js
    console.log('Sending corrected message:', correctedMessage);
  }

  // Generate a unique ID for each message (you can implement your own method for this)
  private generateMessageId(): string {
    return `${Date.now()}`;
  }
}
