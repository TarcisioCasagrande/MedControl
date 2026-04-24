using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MedicosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Medico>>> GetMedicos()
        {
            var medicos = await _context.Medicos
                .OrderBy(m => m.Nome)
                .ToListAsync();

            return Ok(medicos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Medico>> GetMedico(int id)
        {
            var medico = await _context.Medicos
                .FirstOrDefaultAsync(m => m.Id == id);

            if (medico == null)
            {
                return NotFound(new { mensagem = $"Médico com ID {id} não encontrado." });
            }

            return Ok(medico);
        }

        [HttpPost]
        public async Task<ActionResult<Medico>> PostMedico(Medico medico)
        {
            var crmJaExiste = await _context.Medicos
                .AnyAsync(m => m.CRM == medico.CRM);

            if (crmJaExiste)
            {
                return BadRequest(new { mensagem = "Já existe um médico cadastrado com este CRM." });
            }

            medico.DataCadastro = DateTime.UtcNow;

            _context.Medicos.Add(medico);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMedico), new { id = medico.Id }, medico);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutMedico(int id, Medico medico)
        {
            if (id != medico.Id)
            {
                return BadRequest(new { mensagem = "O ID da URL não corresponde ao ID do médico no body." });
            }

            var medicoExistente = await _context.Medicos.FindAsync(id);

            if (medicoExistente == null)
            {
                return NotFound(new { mensagem = $"Médico com ID {id} não encontrado." });
            }

            var crmJaExiste = await _context.Medicos
                .AnyAsync(m => m.CRM == medico.CRM && m.Id != medico.Id);

            if (crmJaExiste)
            {
                return BadRequest(new { mensagem = "Já existe outro médico cadastrado com este CRM." });
            }

            medicoExistente.Nome = medico.Nome;
            medicoExistente.CRM = medico.CRM;
            medicoExistente.Especialidade = medico.Especialidade;
            medicoExistente.Telefone = medico.Telefone;
            medicoExistente.Email = medico.Email;
            medicoExistente.Clinica = medico.Clinica;
            medicoExistente.TurnoAtendimento = medico.TurnoAtendimento;
            medicoExistente.ValorConsulta = medico.ValorConsulta;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedico(int id)
        {
            var medico = await _context.Medicos.FindAsync(id);

            if (medico == null)
            {
                return NotFound(new { mensagem = $"Médico com ID {id} não encontrado." });
            }

            var medicoPossuiConsultas = await _context.Consultas
                .AnyAsync(c => c.MedicoId == id);

            if (medicoPossuiConsultas)
            {
                return BadRequest(new
                {
                    mensagem = "Este médico possui consultas vinculadas e não pode ser excluído."
                });
            }

            _context.Medicos.Remove(medico);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}