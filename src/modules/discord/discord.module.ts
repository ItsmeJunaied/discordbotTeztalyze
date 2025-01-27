import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordController } from './discord.controller';
import { BotService } from './bot.service';

@Module({
  imports: [],
  controllers: [DiscordController],
  providers: [DiscordService, BotService],
})
export class DiscordModule {}
