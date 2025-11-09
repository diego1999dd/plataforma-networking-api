import { Module } from '@nestjs/common';
import { MembrosService } from './membros.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membro } from '../entidades/membro.entidade';

@Module({
  imports: [
    TypeOrmModule.forFeature([Membro]), // Registra o repositório
  ],
  providers: [MembrosService],
  exports: [MembrosService], // Exporta o serviço para ser injetado no ConvitesModule
})
export class MembrosModule {}
