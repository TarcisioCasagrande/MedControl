using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/medicos")]
    public class MedicosController : ControllerBase
    {
        private readonly AppDbContext _context;
        public MedicosController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Medico>>> Listar() => Ok(await _context.Medicos.OrderBy(m => m.Nome).ToListAsync());

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Medico>> BuscarPorId(int id)
        {
            var medico = await _context.Medicos.FindAsync(id);
            return medico == null ? NotFound(new { mensagem = "Médico não encontrado." }) : Ok(medico);
        }

        [HttpPost]
        public async Task<ActionResult<Medico>> Criar(Medico medico)
        {
            if (await _context.Medicos.AnyAsync(m => m.CRM == medico.CRM)) return BadRequest(new { mensagem = "Já existe médico com este CRM." });
            medico.Id = 0;
            medico.DataCadastro = DateTime.UtcNow;
            _context.Medicos.Add(medico);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(BuscarPorId), new { id = medico.Id }, medico);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Atualizar(int id, Medico dados)
        {
            var medico = await _context.Medicos.FindAsync(id);
            if (medico == null) return NotFound(new { mensagem = "Médico não encontrado." });
            if (await _context.Medicos.AnyAsync(m => m.Id != id && m.CRM == dados.CRM)) return BadRequest(new { mensagem = "Já existe outro médico com este CRM." });
            medico.Nome = dados.Nome;
            medico.CRM = dados.CRM;
            medico.Especialidade = dados.Especialidade;
            medico.Telefone = dados.Telefone;
            medico.Email = dados.Email;
            medico.Clinica = dados.Clinica;
            medico.TurnoAtendimento = dados.TurnoAtendimento;
            medico.Ativo = dados.Ativo;
            medico.DataAtualizacao = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var medico = await _context.Medicos.FindAsync(id);
            if (medico == null) return NotFound(new { mensagem = "Médico não encontrado." });
            if (await _context.Agendamentos.AnyAsync(a => a.MedicoId == id)) return BadRequest(new { mensagem = "Não é possível excluir médico com agendamentos vinculados." });
            _context.Medicos.Remove(medico);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
