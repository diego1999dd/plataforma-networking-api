import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum StatusCandidatura {
  PENDING = 'PENDENTE',
  APPROVED = 'APROVADA',
  REJECTED = 'RECUSADA',
}

@Entity('applications')
export class Candidatura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 150 })
  empresa: string;

  @Column({ type: 'text' })
  motivoParticipacao: string;

  @Column({
    type: 'enum',
    enum: StatusCandidatura,
    default: StatusCandidatura.PENDING,
  })
  status: StatusCandidatura;

  @CreateDateColumn({ type: 'timestamp' })
  dataCriacao: Date;
}
