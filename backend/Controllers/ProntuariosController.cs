using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProntuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProntuariosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Prontuario>>> GetProntuarios()
        {
            var prontuarios = await _context.Prontuarios
                .Include(p => p.Consulta!)
                    .ThenInclude(c => c.Paciente)
                .Include(p => p.Consulta!)
                    .ThenInclude(c => c.Medico)
                .OrderByDescending(p => p.DataRegistro)
                .ToListAsync();

            return Ok(prontuarios);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Prontuario>> GetProntuario(int id)
        {
            var prontuario = await _context.Prontuarios
                .Include(p => p.Consulta!)
                    .ThenInclude(c => c.Paciente)
                .Include(p => p.Consulta!)
                    .ThenInclude(c => c.Medico)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (prontuario == null)
            {
                return NotFound(new { mensagem = $"Prontuário com ID {id} não encontrado." });
            }

            return Ok(prontuario);
        }

        [HttpPost]
        public async Task<ActionResult<Prontuario>> PostProntuario(Prontuario prontuario)
        {
            var consultaExiste = await _context.Consultas.AnyAsync(c => c.Id == prontuario.ConsultaId);
            if (!consultaExiste)
            {
                return BadRequest(new { mensagem = "A consulta informada não existe." });
            }

            var consultaJaTemProntuario = await _context.Prontuarios
                .AnyAsync(p => p.ConsultaId == prontuario.ConsultaId);

            if (consultaJaTemProntuario)
            {
                return BadRequest(new { mensagem = "Esta consulta já possui um prontuário cadastrado." });
            }

            prontuario.DataRegistro = DateTime.UtcNow;

            _context.Prontuarios.Add(prontuario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProntuario), new { id = prontuario.Id }, prontuario);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutProntuario(int id, Prontuario prontuario)
        {
            if (id != prontuario.Id)
            {
                return BadRequest(new { mensagem = "O ID da URL não corresponde ao ID do prontuário no body." });
            }

            var prontuarioExistente = await _context.Prontuarios.FindAsync(id);

            if (prontuarioExistente == null)
            {
                return NotFound(new { mensagem = $"Prontuário com ID {id} não encontrado." });
            }

            var consultaExiste = await _context.Consultas.AnyAsync(c => c.Id == prontuario.ConsultaId);
            if (!consultaExiste)
            {
                return BadRequest(new { mensagem = "A consulta informada não existe." });
            }

            var outraConsultaJaTemProntuario = await _context.Prontuarios
                .AnyAsync(p => p.ConsultaId == prontuario.ConsultaId && p.Id != prontuario.Id);

            if (outraConsultaJaTemProntuario)
            {
                return BadRequest(new { mensagem = "Esta consulta já está vinculada a outro prontuário." });
            }

            prontuarioExistente.QueixaPrincipal = prontuario.QueixaPrincipal;
            prontuarioExistente.HistoricoClinico = prontuario.HistoricoClinico;
            prontuarioExistente.Diagnostico = prontuario.Diagnostico;
            prontuarioExistente.Conduta = prontuario.Conduta;
            prontuarioExistente.Prescricao = prontuario.Prescricao;
            prontuarioExistente.ExamesSolicitados = prontuario.ExamesSolicitados;
            prontuarioExistente.Observacoes = prontuario.Observacoes;
            prontuarioExistente.ConsultaId = prontuario.ConsultaId;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProntuario(int id)
        {
            var prontuario = await _context.Prontuarios.FindAsync(id);

            if (prontuario == null)
            {
                return NotFound(new { mensagem = $"Prontuário com ID {id} não encontrado." });
            }

            _context.Prontuarios.Remove(prontuario);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}