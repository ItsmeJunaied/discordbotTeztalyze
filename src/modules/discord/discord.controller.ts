/* eslint-disable no-unused-vars */
import { Controller, Post, Body } from '@nestjs/common';
import { DiscordService } from './discord.service';
// import { DiscordService } from './discord.service';

@Controller('discord')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}

  @Post('/capture')
  async handleCommand(@Body('message') message: string): Promise<string> {
    return this.discordService.processMessage(message);
  }
}
