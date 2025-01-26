import { Injectable } from '@nestjs/common';

@Injectable()
export class DiscordService {
  async processMessage(userMessage: string): Promise<string> {
    return `Hello - this is your message -> ${userMessage}`;
  }
}
