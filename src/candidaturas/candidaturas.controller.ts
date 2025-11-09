import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Param,
} from '@nestjs/common';
import { CandidaturasService } from './candidaturas.service';
import { CriarCandidaturaDto } from './dto/criar-candidatura.dto';
import { Candidatura } from '../entidades/candidatura.entidade';
import { ApiKeyGuard } from '../auth/api-key/api-key.guard';

@Controller()
@UsePipes(new ValidationPipe())
export class CandidaturasController {
  constructor(private readonly candidaturasService: CandidaturasService) {}

  //@UseGuards(ApiKeyGuard)
  @Post('candidaturas')
  @HttpCode(HttpStatus.CREATED)
  async criar(
    @Body() criarCandidaturaDto: CriarCandidaturaDto,
  ): Promise<Candidatura> {
    return this.candidaturasService.criarCandidatura(criarCandidaturaDto);
  }

  @UseGuards(ApiKeyGuard)
  @Get('admin/candidaturas')
  async listarTodas(): Promise<Candidatura[]> {
    return this.candidaturasService.listarTodas();
  }

  @Post('admin/candidaturas/:id/aprovar')
  async aprovarCandidatura(@Param('id') id: string) {
    return this.candidaturasService.aprovarCandidatura(Number(id));
  }

  @UseGuards(ApiKeyGuard)
  @Post('admin/candidaturas/:id/recusar')
  async recusarCandidatura(@Param('id') id: string): Promise<Candidatura> {
    return this.candidaturasService.recusarCandidatura(Number(id));
  }
}
