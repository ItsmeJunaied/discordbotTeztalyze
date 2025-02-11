import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordController } from './discord.controller';
import { BotService } from './bot.service';
import { GrammarCorrectionService } from './grammar-correction.service';

@Module({
  imports: [],
  controllers: [DiscordController],
  providers: [DiscordService, BotService, GrammarCorrectionService],
})
export class DiscordModule {}
