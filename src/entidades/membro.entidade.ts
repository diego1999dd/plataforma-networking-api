import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('members')
export class Membro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 150, nullable: true })
  empresa: string;

  @Column({ length: 100, nullable: true })
  funcao: string; // Adicionando a coluna que faltava

  @Column({ length: 50, nullable: true })
  telefone: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  dataAdesao: Date;
}
