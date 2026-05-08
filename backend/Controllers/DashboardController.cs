using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get(
            [FromQuery] int? medicoId,
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim)
        {
            var hoje = DateTime.UtcNow.Date;
            var inicioMes = new DateTime(hoje.Year, hoje.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var fimMes = inicioMes.AddMonths(1);

            var query = _context.Agendamentos
                .Include(a => a.Medico)
                .Include(a => a.Paciente)
                .Include(a => a.Pagamento)
                .AsQueryable();

            if (medicoId.HasValue)
            {
                query = query.Where(a => a.MedicoId == medicoId.Value);
            }

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

            var agendamentos = await query
                .OrderByDescending(a => a.DataAgendamento)
                .ToListAsync();

            var pagamentosPagos = agendamentos
                .Where(a => a.Pagamento != null && a.Pagamento.StatusPagamento == "Pago")
                .Select(a => a.Pagamento!);

            var faturamentoTotal = pagamentosPagos.Sum(p => p.Valor);

            var faturamentoMes = pagamentosPagos
                .Where(p => p.DataPagamento >= inicioMes && p.DataPagamento < fimMes)
                .Sum(p => p.Valor);

            var minutosAtendidos = agendamentos
                .Where(a => a.DataInicioAtendimento.HasValue && a.DataFimAtendimento.HasValue)
                .Sum(a => (int)(a.DataFimAtendimento!.Value - a.DataInicioAtendimento!.Value).TotalMinutes);

            var agendamentosPorStatus = agendamentos
                .GroupBy(a => a.Status)
                .Select(g => new
                {
                    status = g.Key,
                    total = g.Count()
                })
                .ToList();

            var agendamentosPorTipo = agendamentos
                .GroupBy(a => a.TipoAtendimento)
                .Select(g => new
                {
                    tipo = g.Key,
                    total = g.Count()
                })
                .ToList();

            var desempenhoPorMedico = agendamentos
                .GroupBy(a => new
                {
                    a.MedicoId,
                    Medico = a.Medico != null ? a.Medico.Nome : "Sem médico"
                })
                .Select(g => new
                {
                    medicoId = g.Key.MedicoId,
                    medico = g.Key.Medico,
                    atendimentos = g.Count(),
                    faturamento = g
                        .Where(a => a.Pagamento != null && a.Pagamento.StatusPagamento == "Pago")
                        .Sum(a => a.Pagamento!.Valor),
                    minutos = g
                        .Where(a => a.DataInicioAtendimento.HasValue && a.DataFimAtendimento.HasValue)
                        .Sum(a => (int)(a.DataFimAtendimento!.Value - a.DataInicioAtendimento!.Value).TotalMinutes)
                })
                .OrderByDescending(x => x.faturamento)
                .ToList();

            var medicos = await _context.Medicos
                .Where(m => m.Ativo)
                .OrderBy(m => m.Nome)
                .Select(m => new
                {
                    m.Id,
                    m.Nome,
                    m.CRM,
                    m.Especialidade
                })
                .ToListAsync();

            var dto = new
            {
                totalPacientes = await _context.Pacientes.CountAsync(),
                totalMedicos = await _context.Medicos.CountAsync(),
                totalAgendamentos = agendamentos.Count,
                agendamentosHoje = agendamentos.Count(a => a.DataAgendamento.Date == hoje),
                finalizados = agendamentos.Count(a => a.Status == "Finalizado" || a.Status == "Finalizado pelo médico"),
                cancelados = agendamentos.Count(a => a.Status == "Cancelado"),
                faturamentoTotal,
                faturamentoMes,
                minutosAtendidos,
                ticketMedio = agendamentos.Count == 0 ? 0 : faturamentoTotal / agendamentos.Count,
                agendamentosPorStatus,
                agendamentosPorTipo,
                desempenhoPorMedico,
                medicos
            };

            return Ok(dto);
        }
    }
}