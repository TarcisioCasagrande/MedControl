using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/prontuarios")]
    public class ProntuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProntuariosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var prontuarios = await ProjetarProntuarios(Query())
                .ToListAsync();

            return Ok(prontuarios);
        }

        [HttpGet("por-agendamento/{agendamentoId:int}")]
        public async Task<IActionResult> BuscarPorAgendamento(int agendamentoId)
        {
            var prontuario = await ProjetarProntuarios(
                    Query().Where(p => p.AgendamentoId == agendamentoId)
                )
                .FirstOrDefaultAsync();

            return prontuario == null
                ? NotFound(new { mensagem = "Prontuário ainda não criado para este agendamento." })
                : Ok(prontuario);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> BuscarPorId(int id)
        {
            var prontuario = await ProjetarProntuarios(
                    Query().Where(p => p.Id == id)
                )
                .FirstOrDefaultAsync();

            return prontuario == null
                ? NotFound(new { mensagem = "Prontuário não encontrado." })
                : Ok(prontuario);
        }

        [HttpPost]
        public async Task<IActionResult> Criar([FromBody] Prontuario prontuario)
        {
            var validacao = await Validar(prontuario);

            if (!validacao.Valido)
                return BadRequest(new { mensagem = validacao.Mensagem });

            if (await _context.Prontuarios.AnyAsync(p => p.AgendamentoId == prontuario.AgendamentoId))
                return BadRequest(new { mensagem = "Este agendamento já possui prontuário." });

            prontuario.Id = 0;
            prontuario.DataRegistro = DateTime.UtcNow;
            prontuario.DataAtualizacao = null;

            if (string.IsNullOrWhiteSpace(prontuario.Receita))
                prontuario.Receita = prontuario.Prescricao;

            if (string.IsNullOrWhiteSpace(prontuario.Prescricao))
                prontuario.Prescricao = prontuario.Receita;

            _context.Prontuarios.Add(prontuario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(BuscarPorId), new { id = prontuario.Id }, new
            {
                mensagem = "Prontuário criado com sucesso.",
                prontuario.Id
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] Prontuario dados)
        {
            var prontuario = await _context.Prontuarios.FindAsync(id);

            if (prontuario == null)
                return NotFound(new { mensagem = "Prontuário não encontrado." });

            dados.Id = id;

            var validacao = await Validar(dados);

            if (!validacao.Valido)
                return BadRequest(new { mensagem = validacao.Mensagem });

            prontuario.AgendamentoId = dados.AgendamentoId;
            prontuario.QueixaPrincipal = dados.QueixaPrincipal;
            prontuario.HistoricoClinico = dados.HistoricoClinico;
            prontuario.Diagnostico = dados.Diagnostico;
            prontuario.Conduta = dados.Conduta;
            prontuario.Prescricao = string.IsNullOrWhiteSpace(dados.Prescricao) ? dados.Receita : dados.Prescricao;
            prontuario.Receita = string.IsNullOrWhiteSpace(dados.Receita) ? dados.Prescricao : dados.Receita;
            prontuario.ExamesSolicitados = dados.ExamesSolicitados;
            prontuario.Observacoes = dados.Observacoes;
            prontuario.DataAtualizacao = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var prontuario = await _context.Prontuarios.FindAsync(id);

            if (prontuario == null)
                return NotFound(new { mensagem = "Prontuário não encontrado." });

            _context.Prontuarios.Remove(prontuario);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private IQueryable<Prontuario> Query()
        {
            return _context.Prontuarios
                .AsNoTracking()
                .Include(p => p.Agendamento)!
                    .ThenInclude(a => a!.Paciente)
                .Include(p => p.Agendamento)!
                    .ThenInclude(a => a!.Medico)
                .Include(p => p.Agendamento)!
                    .ThenInclude(a => a!.Procedimento);
        }

        private static IQueryable<object> ProjetarProntuarios(IQueryable<Prontuario> query)
        {
            return query
                .OrderByDescending(p => p.DataRegistro)
                .Select(p => new
                {
                    p.Id,
                    p.QueixaPrincipal,
                    p.HistoricoClinico,
                    p.Diagnostico,
                    p.Conduta,
                    p.Prescricao,
                    p.Receita,
                    p.ExamesSolicitados,
                    p.Observacoes,
                    p.DataRegistro,
                    p.DataAtualizacao,
                    p.AgendamentoId,

                    PacienteNome = p.Agendamento != null && p.Agendamento.Paciente != null ? p.Agendamento.Paciente.Nome : null,
                    MedicoNome = p.Agendamento != null && p.Agendamento.Medico != null ? p.Agendamento.Medico.Nome : null,
                    ProcedimentoNome = p.Agendamento != null && p.Agendamento.Procedimento != null ? p.Agendamento.Procedimento.Nome : null,

                    Agendamento = p.Agendamento == null ? null : new
                    {
                        p.Agendamento.Id,
                        p.Agendamento.DataAgendamento,
                        p.Agendamento.Status,
                        p.Agendamento.TipoAtendimento,

                        Paciente = p.Agendamento.Paciente == null ? null : new
                        {
                            p.Agendamento.Paciente.Id,
                            p.Agendamento.Paciente.Nome,
                            p.Agendamento.Paciente.CPF,
                            p.Agendamento.Paciente.Telefone,
                            p.Agendamento.Paciente.Email
                        },

                        Medico = p.Agendamento.Medico == null ? null : new
                        {
                            p.Agendamento.Medico.Id,
                            p.Agendamento.Medico.Nome,
                            p.Agendamento.Medico.CRM,
                            p.Agendamento.Medico.Especialidade
                        },

                        Procedimento = p.Agendamento.Procedimento == null ? null : new
                        {
                            p.Agendamento.Procedimento.Id,
                            p.Agendamento.Procedimento.Nome,
                            p.Agendamento.Procedimento.Codigo,
                            p.Agendamento.Procedimento.Valor
                        }
                    }
                });
        }

        private async Task<(bool Valido, string Mensagem)> Validar(Prontuario p)
        {
            if (p.AgendamentoId <= 0)
                return (false, "Informe o agendamento.");

            if (!await _context.Agendamentos.AnyAsync(a => a.Id == p.AgendamentoId))
                return (false, "Agendamento não encontrado.");

            if (string.IsNullOrWhiteSpace(p.Diagnostico))
                return (false, "Informe o diagnóstico.");

            return (true, string.Empty);
        }
    }
}
