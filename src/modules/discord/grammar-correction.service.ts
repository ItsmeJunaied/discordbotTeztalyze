/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GrammarCorrectionService {
  private readonly apiKey: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in the .env file.');
    }
    this.apiKey = apiKey;
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in the .env file.');
    }
  }

  async correctGrammar(text: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content:
                'Rewrite the following text to correct any grammar or spelling errors without changing its meaning. If the text is already correct, return it unchanged. Translate to English if no target language is specified. Summarize or use bullet points or suggest better text if requested, even if there are spelling or grammar mistakes in the request. Ensure any vulgar, inappropriate, or sensitive language is rephrased to a positive tone.',
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
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 30000, // Set a 30-second timeout
        },
      );

      const correctedText = response.data.choices[0].message.content;
      return correctedText || text; // Return the original text if no correction is provided
    } catch (error) {
      console.error('Error with OpenAI API:', error.message || error);
      throw new Error('Failed to correct grammar');
    }
  }
}