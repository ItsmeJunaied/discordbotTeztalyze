import { Module } from '@nestjs/common';
import { DiscordModule } from './modules/discord/discord.module';

@Module({
  imports: [DiscordModule],
})
export class AppModule {}
