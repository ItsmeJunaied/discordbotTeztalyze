/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import { Controller, Post, Body } from '@nestjs/common';
import { GrammarService } from './grammar.service';
import { GrammarCorrectionDto } from './dto/grammar.dto';

@Controller('grammar')
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @Post('correct')
  async correctGrammar(@Body() dto: GrammarCorrectionDto): Promise<{ correctedText: string }> {
    const correctedText = await this.grammarService.correctGrammar(dto.text);
    return { correctedText };
  }
}
