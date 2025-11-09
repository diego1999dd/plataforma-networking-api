import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConvitesService } from './convites.service';
import { Convite } from '../entidades/convite.entidade';
import { Membro } from '../entidades/membro.entidade';
import { CompletarCadastroDto } from '../candidaturas/dto/completar-cadastro.dto';

@Controller('convites') // Prefixo da rota: /convites
@UsePipes(new ValidationPipe({ transform: true }))
export class ConvitesController {
  constructor(private readonly convitesService: ConvitesService) {}

  // 1. Rota: Valida o token (GET /convites/:token)
  @Get(':token')
  async validarToken(@Param('token') token: string): Promise<Convite> {
    // Retorna o objeto Convite se for válido, ou NotFound/BadRequest se falhar
    return this.convitesService.validarConvite(token);
  }

  // 2. Rota: Completa o cadastro (POST /convites/:token/completar)
  @Post(':token/completar')
  @HttpCode(HttpStatus.CREATED)
  async completarCadastro(
    @Param('token') token: string,
    @Body() completarCadastroDto: CompletarCadastroDto,
  ): Promise<Membro> {
    return this.convitesService.completarCadastro(token, completarCadastroDto);
  }
}
