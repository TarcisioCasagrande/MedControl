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

        public MedicosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Medico>>> Listar()
        {
            var medicos = await _context.Medicos
                .OrderBy(m => m.Nome)
                .ToListAsync();

            return Ok(medicos);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Medico>> BuscarPorId(int id)
        {
            var medico = await _context.Medicos.FindAsync(id);

            if (medico == null)
                return NotFound(new { mensagem = "Médico não encontrado." });

            return Ok(medico);
        }

        [HttpPost]
        public async Task<ActionResult<Medico>> Criar(Medico medico)
        {
            medico.CRM = NormalizarCrm(medico.CRM);

            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var crmJaExiste = await _context.Medicos
                .AnyAsync(m => m.CRM == medico.CRM);

            if (crmJaExiste)
                return BadRequest(new { mensagem = "Já existe médico com este CRM." });

            medico.Id = 0;
            medico.DataCadastro = DateTime.UtcNow;
            medico.DataAtualizacao = null;
            medico.Ativo = true;

            _context.Medicos.Add(medico);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(BuscarPorId), new { id = medico.Id }, medico);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Atualizar(int id, Medico dados)
        {
            var medico = await _context.Medicos.FindAsync(id);

            if (medico == null)
                return NotFound(new { mensagem = "Médico não encontrado." });

            dados.CRM = NormalizarCrm(dados.CRM);

            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var crmJaExiste = await _context.Medicos
                .AnyAsync(m => m.Id != id && m.CRM == dados.CRM);

            if (crmJaExiste)
                return BadRequest(new { mensagem = "Já existe outro médico com este CRM." });

            medico.Nome = dados.Nome.Trim();
            medico.CRM = dados.CRM;
            medico.Especialidade = dados.Especialidade.Trim();
            medico.Telefone = dados.Telefone.Trim();
            medico.Email = dados.Email.Trim().ToLower();
            medico.Clinica = dados.Clinica?.Trim() ?? string.Empty;
            medico.TurnoAtendimento = dados.TurnoAtendimento?.Trim() ?? string.Empty;
            medico.Ativo = dados.Ativo;
            medico.DataAtualizacao = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var medico = await _context.Medicos.FindAsync(id);

            if (medico == null)
                return NotFound(new { mensagem = "Médico não encontrado." });

            var possuiAgendamentos = await _context.Agendamentos
                .AnyAsync(a => a.MedicoId == id);

            if (possuiAgendamentos)
                return BadRequest(new { mensagem = "Não é possível excluir médico com agendamentos vinculados." });

            _context.Medicos.Remove(medico);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static string NormalizarCrm(string? crm)
        {
            return (crm ?? string.Empty)
                .Trim()
                .ToUpper();
        }
    }
}