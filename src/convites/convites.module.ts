import { Membro } from './../entidades/membro.entidade';
import { Convite } from './../entidades/convite.entidade';
import { Candidatura } from './../entidades/candidatura.entidade';
import { Module } from '@nestjs/common';
import { ConvitesController } from './convites.controller';
import { ConvitesService } from './convites.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembrosModule } from 'src/membros/membros.module';

@Module({
  imports: [
    MembrosModule,

    TypeOrmModule.forFeature([Convite, Candidatura, Membro]),
  ],
  controllers: [ConvitesController],
  providers: [ConvitesService],

  exports: [ConvitesService],
})
export class ConvitesModule {}
