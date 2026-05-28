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

        public ProcedimentosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<ProcedimentoResponse>>> Listar()
        {
            var procedimentos = await _context.Procedimentos
                .OrderBy(p => p.Nome)
                .ToListAsync();

            return Ok(procedimentos.Select(Mapear));
        }

        [HttpGet("ativos")]
        public async Task<ActionResult<List<ProcedimentoResponse>>> ListarAtivos()
        {
            var procedimentos = await _context.Procedimentos
                .Where(p => p.Ativo)
                .OrderBy(p => p.Nome)
                .ToListAsync();

            return Ok(procedimentos.Select(Mapear));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProcedimentoResponse>> BuscarPorId(int id)
        {
            var procedimento = await _context.Procedimentos.FindAsync(id);

            if (procedimento == null)
            {
                return NotFound(new
                {
                    mensagem = "Procedimento não encontrado."
                });
            }

            return Ok(Mapear(procedimento));
        }

        [HttpPost]
        public async Task<ActionResult<ProcedimentoResponse>> Criar(
            [FromBody] ProcedimentoRequest request
        )
        {
            var validacao = Validar(request);

            if (!validacao.Valido)
            {
                return BadRequest(new
                {
                    mensagem = validacao.Mensagem
                });
            }

            if (
                !string.IsNullOrWhiteSpace(request.Codigo)
                && await _context.Procedimentos.AnyAsync(
                    p => p.Codigo == request.Codigo
                )
            )
            {
                return BadRequest(new
                {
                    mensagem = "Já existe um procedimento com este código."
                });
            }

            var procedimento = new Procedimento
            {
                Nome = request.Nome.Trim(),
                Codigo = string.IsNullOrWhiteSpace(request.Codigo)
                    ? null
                    : request.Codigo.Trim(),
                Valor = request.Valor,
                Ativo = request.Ativo
            };

            _context.Procedimentos.Add(procedimento);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(BuscarPorId),
                new { id = procedimento.Id },
                Mapear(procedimento)
            );
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Atualizar(
            int id,
            [FromBody] ProcedimentoRequest request
        )
        {
            var procedimento = await _context.Procedimentos.FindAsync(id);

            if (procedimento == null)
            {
                return NotFound(new
                {
                    mensagem = "Procedimento não encontrado."
                });
            }

            var validacao = Validar(request);

            if (!validacao.Valido)
            {
                return BadRequest(new
                {
                    mensagem = validacao.Mensagem
                });
            }

            if (
                !string.IsNullOrWhiteSpace(request.Codigo)
                && await _context.Procedimentos.AnyAsync(
                    x => x.Id != id && x.Codigo == request.Codigo
                )
            )
            {
                return BadRequest(new
                {
                    mensagem = "Já existe outro procedimento com este código."
                });
            }

            procedimento.Nome = request.Nome.Trim();

            procedimento.Codigo = string.IsNullOrWhiteSpace(request.Codigo)
                ? null
                : request.Codigo.Trim();

            procedimento.Valor = request.Valor;
            procedimento.Ativo = request.Ativo;
            procedimento.DataAtualizacao = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> AlterarStatus(int id)
        {
            var procedimento = await _context.Procedimentos.FindAsync(id);

            if (procedimento == null)
            {
                return NotFound(new
                {
                    mensagem = "Procedimento não encontrado."
                });
            }

            procedimento.Ativo = !procedimento.Ativo;
            procedimento.DataAtualizacao = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(Mapear(procedimento));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var procedimento = await _context.Procedimentos.FindAsync(id);

            if (procedimento == null)
            {
                return NotFound(new
                {
                    mensagem = "Procedimento não encontrado."
                });
            }

            var totalAgendamentos = await _context.Agendamentos
                .CountAsync(a => a.ProcedimentoId == id);

            if (totalAgendamentos > 0)
            {
                return BadRequest(new
                {
                    mensagem =
                        $"Não é possível excluir este procedimento porque ele está vinculado a {totalAgendamentos} agendamento(s)."
                });
            }

            _context.Procedimentos.Remove(procedimento);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static (bool Valido, string Mensagem) Validar(
            ProcedimentoRequest request
        )
        {
            if (string.IsNullOrWhiteSpace(request.Nome))
            {
                return (false, "Informe o nome do procedimento.");
            }

            if (request.Valor < 0)
            {
                return (false, "O valor não pode ser negativo.");
            }

            return (true, string.Empty);
        }

        private ProcedimentoResponse Mapear(Procedimento procedimento)
        {
            var totalAgendamentos = _context.Agendamentos
                .Count(a => a.ProcedimentoId == procedimento.Id);

            return new ProcedimentoResponse
            {
                Id = procedimento.Id,
                Nome = procedimento.Nome,
                Codigo = procedimento.Codigo,
                Valor = procedimento.Valor,
                Ativo = procedimento.Ativo,
                PossuiAgendamentos = totalAgendamentos > 0,
                TotalAgendamentosVinculados = totalAgendamentos
            };
        }
    }
}