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

@Controller('convites')
@UsePipes(new ValidationPipe({ transform: true }))
export class ConvitesController {
  constructor(private readonly convitesService: ConvitesService) {}

  @Get(':token')
  async validarToken(@Param('token') token: string): Promise<Convite> {
    return this.convitesService.validarConvite(token);
  }

  @Post(':token/completar')
  @HttpCode(HttpStatus.CREATED)
  async completarCadastro(
    @Param('token') token: string,
    @Body() completarCadastroDto: CompletarCadastroDto,
  ): Promise<Membro> {
    return this.convitesService.completarCadastro(token, completarCadastroDto);
  }
}
