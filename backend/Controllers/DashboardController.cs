using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            var totalMedicos = await _context.Medicos.CountAsync();
            var totalPacientes = await _context.Pacientes.CountAsync();
            var totalConsultas = await _context.Consultas.CountAsync();
            var totalProntuarios = await _context.Prontuarios.CountAsync();

            var faturamentoTotal = await _context.Consultas
                .SumAsync(c => (decimal?)c.ValorCobrado) ?? 0;

            var consultasPorStatus = await _context.Consultas
                .GroupBy(c => c.Status)
                .Select(g => new
                {
                    status = g.Key,
                    total = g.Count()
                })
                .ToListAsync();

            var consultasPorTipo = await _context.Consultas
                .GroupBy(c => c.TipoAtendimento)
                .Select(g => new
                {
                    tipo = g.Key,
                    total = g.Count()
                })
                .ToListAsync();

            return Ok(new
            {
                totalMedicos,
                totalPacientes,
                totalConsultas,
                totalProntuarios,
                faturamentoTotal,
                consultasPorStatus,
                consultasPorTipo
            });
        }
    }
}