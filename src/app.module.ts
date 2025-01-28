import { Module } from '@nestjs/common';
import { DiscordModule } from './modules/discord/discord.module';
import { GrammarModule } from './grammer/grammar.module';

@Module({
  imports: [DiscordModule, GrammarModule],
})
export class AppModule {}
