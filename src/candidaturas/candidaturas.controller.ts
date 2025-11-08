// api/src/candidaturas/candidaturas.controller.ts
// ...
import { Candidatura } from '../entidades/candidatura.entidade'; // <-- NOVO NOME

@Controller('candidaturas')
export class CandidaturasController {
    // ...
    async criar(
        @Body() createCandidaturaDto: CreateCandidaturaDto,
    ): Promise<Candidatura> { // <-- NOVO NOME
        const novaCandidatura = await this.candidaturasService.criarCandidatura(
            createCandidaturaDto,
        );
        return novaCandidatura;
    }
}