import { Module } from '@nestjs/common';
import { MembrosService } from './membros.service';

@Module({
  providers: [MembrosService]
})
export class MembrosModule {}
