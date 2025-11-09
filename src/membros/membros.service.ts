import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membro } from '../entidades/membro.entidade';

// Interface para entrada de dados
interface CriarMembroData {
  nome: string;
  email: string;
  empresa: string;
  telefone: string;
  funcao: string;
  bio: string;
}

@Injectable()
export class MembrosService {
  constructor(
    @InjectRepository(Membro)
    private repositorioMembro: Repository<Membro>,
  ) {}

  async criarMembro(dados: CriarMembroData): Promise<Membro> {
    // Note: 'ativo' é true por padrão na entidade
    const novoMembro = this.repositorioMembro.create(dados);
    return this.repositorioMembro.save(novoMembro);
  }
}
