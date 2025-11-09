import { Module } from '@nestjs/common';
import { MembrosService } from './membros.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membro } from '../entidades/membro.entidade';

@Module({
  imports: [TypeOrmModule.forFeature([Membro])],
  providers: [MembrosService],
  exports: [MembrosService],
})
export class MembrosModule {}
