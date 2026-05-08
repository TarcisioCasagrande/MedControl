using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/relatorios")]
    [Authorize(Roles = "Admin,Recepcionista")]
    public class RelatoriosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RelatoriosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("agendamentos-por-usuario")]
        public async Task<IActionResult> AgendamentosPorUsuario(
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim,
            [FromQuery] int? usuarioId)
        {
            var query = _context.Agendamentos
                .Include(a => a.Paciente)
                .Include(a => a.Medico)
                .Include(a => a.Procedimento)
                .Include(a => a.Pagamento)
                .Include(a => a.CriadoPorUsuario)
                .AsQueryable();

            if (dataInicio.HasValue)
            {
                var inicio = DateTime.SpecifyKind(dataInicio.Value.Date, DateTimeKind.Utc);
                query = query.Where(a => a.DataAgendamento >= inicio);
            }

            if (dataFim.HasValue)
            {
                var fim = DateTime.SpecifyKind(dataFim.Value.Date.AddDays(1), DateTimeKind.Utc);
                query = query.Where(a => a.DataAgendamento < fim);
            }

            if (usuarioId.HasValue)
            {
                query = query.Where(a => a.CriadoPorUsuarioId == usuarioId.Value);
            }

            var relatorio = await query
                .OrderByDescending(a => a.DataAgendamento)
                .Select(a => new
                {
                    agendamentoId = a.Id,
                    dataAgendamento = a.DataAgendamento,

                    pacienteId = a.PacienteId,
                    paciente = a.Paciente != null ? a.Paciente.Nome : "Paciente não informado",

                    medicoId = a.MedicoId,
                    medico = a.Medico != null ? a.Medico.Nome : "Médico não informado",

                    procedimentoId = a.ProcedimentoId,
                    procedimento = a.Procedimento != null ? a.Procedimento.Nome : "Procedimento não informado",
                    codigoProcedimento = a.Procedimento != null ? a.Procedimento.Codigo : "",

                    status = a.Status,
                    tipoAtendimento = a.TipoAtendimento,
                    valor = a.ValorCobrado,

                    criadoPorUsuarioId = a.CriadoPorUsuarioId,
                    criadoPor = a.CriadoPorUsuario != null
                        ? a.CriadoPorUsuario.Nome
                        : "Não identificado",
                    perfilCriador = a.CriadoPorUsuario != null
                        ? a.CriadoPorUsuario.Perfil.ToString()
                        : "Sem usuário",

                    pagamentoStatus = a.Pagamento != null
                        ? a.Pagamento.StatusPagamento
                        : "Sem pagamento",

                    formaPagamento = a.Pagamento != null
                        ? a.Pagamento.FormaPagamento
                        : "",

                    valorPago = a.Pagamento != null && a.Pagamento.StatusPagamento == "Pago"
                        ? a.Pagamento.Valor
                        : 0
                })
                .ToListAsync();

            return Ok(relatorio);
        }
    }
}