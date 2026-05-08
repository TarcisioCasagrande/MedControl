using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.DTOs;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/procedimentos")]
    public class ProcedimentosController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ProcedimentosController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<List<ProcedimentoResponse>>> Listar() => Ok((await _context.Procedimentos.OrderBy(p => p.Nome).ToListAsync()).Select(Mapear));

        [HttpGet("ativos")]
        public async Task<ActionResult<List<ProcedimentoResponse>>> ListarAtivos() => Ok((await _context.Procedimentos.Where(p => p.Ativo).OrderBy(p => p.Nome).ToListAsync()).Select(Mapear));

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProcedimentoResponse>> BuscarPorId(int id)
        {
            var p = await _context.Procedimentos.FindAsync(id);
            return p == null ? NotFound(new { mensagem = "Procedimento não encontrado." }) : Ok(Mapear(p));
        }

        [HttpPost]
        public async Task<ActionResult<ProcedimentoResponse>> Criar([FromBody] ProcedimentoRequest request)
        {
            var validacao = Validar(request);
            if (!validacao.Valido) return BadRequest(new { mensagem = validacao.Mensagem });
            if (!string.IsNullOrWhiteSpace(request.Codigo) && await _context.Procedimentos.AnyAsync(p => p.Codigo == request.Codigo))
                return BadRequest(new { mensagem = "Já existe um procedimento com este código." });
            var p = new Procedimento { Nome = request.Nome.Trim(), Codigo = string.IsNullOrWhiteSpace(request.Codigo) ? null : request.Codigo.Trim(), Valor = request.Valor, Ativo = request.Ativo };
            _context.Procedimentos.Add(p);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(BuscarPorId), new { id = p.Id }, Mapear(p));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] ProcedimentoRequest request)
        {
            var p = await _context.Procedimentos.FindAsync(id);
            if (p == null) return NotFound(new { mensagem = "Procedimento não encontrado." });
            var validacao = Validar(request);
            if (!validacao.Valido) return BadRequest(new { mensagem = validacao.Mensagem });
            if (!string.IsNullOrWhiteSpace(request.Codigo) && await _context.Procedimentos.AnyAsync(x => x.Id != id && x.Codigo == request.Codigo))
                return BadRequest(new { mensagem = "Já existe outro procedimento com este código." });
            p.Nome = request.Nome.Trim();
            p.Codigo = string.IsNullOrWhiteSpace(request.Codigo) ? null : request.Codigo.Trim();
            p.Valor = request.Valor;
            p.Ativo = request.Ativo;
            p.DataAtualizacao = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> AlterarStatus(int id)
        {
            var p = await _context.Procedimentos.FindAsync(id);
            if (p == null) return NotFound(new { mensagem = "Procedimento não encontrado." });
            p.Ativo = !p.Ativo;
            p.DataAtualizacao = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(Mapear(p));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var p = await _context.Procedimentos.FindAsync(id);
            if (p == null) return NotFound(new { mensagem = "Procedimento não encontrado." });
            if (await _context.Agendamentos.AnyAsync(a => a.ProcedimentoId == id)) return BadRequest(new { mensagem = "Não é possível excluir procedimento vinculado a agendamentos. Inative-o." });
            _context.Procedimentos.Remove(p);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static (bool Valido, string Mensagem) Validar(ProcedimentoRequest r)
        {
            if (string.IsNullOrWhiteSpace(r.Nome)) return (false, "Informe o nome do procedimento.");
            if (r.Valor < 0) return (false, "O valor não pode ser negativo.");
            return (true, string.Empty);
        }

        private static ProcedimentoResponse Mapear(Procedimento p) => new() { Id = p.Id, Nome = p.Nome, Codigo = p.Codigo, Valor = p.Valor, Ativo = p.Ativo };
    }
}
