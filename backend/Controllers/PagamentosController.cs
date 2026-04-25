using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PagamentosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PagamentosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pagamento>>> GetPagamentos()
        {
            return await _context.Pagamentos
                .Include(p => p.Consulta)
                    .ThenInclude(c => c!.Paciente)
                .Include(p => p.Consulta)
                    .ThenInclude(c => c!.Medico)
                .OrderByDescending(p => p.Id)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Pagamento>> GetPagamento(int id)
        {
            var pagamento = await _context.Pagamentos
                .Include(p => p.Consulta)
                    .ThenInclude(c => c!.Paciente)
                .Include(p => p.Consulta)
                    .ThenInclude(c => c!.Medico)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pagamento == null)
                return NotFound(new { mensagem = "Pagamento não encontrado." });

            return pagamento;
        }

        [HttpPost]
        public async Task<ActionResult<Pagamento>> CriarPagamento(Pagamento pagamento)
        {
            var consultaExiste = await _context.Consultas.AnyAsync(c => c.Id == pagamento.ConsultaId);

            if (!consultaExiste)
                return BadRequest(new { mensagem = "Consulta não encontrada." });

            var pagamentoJaExiste = await _context.Pagamentos
                .AnyAsync(p => p.ConsultaId == pagamento.ConsultaId);

            if (pagamentoJaExiste)
                return BadRequest(new { mensagem = "Essa consulta já possui um pagamento cadastrado." });

            if (pagamento.Valor <= 0)
                return BadRequest(new { mensagem = "O valor do pagamento deve ser maior que zero." });

            if (pagamento.StatusPagamento == "Pago" && pagamento.DataPagamento == null)
                pagamento.DataPagamento = DateTime.UtcNow;

            _context.Pagamentos.Add(pagamento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPagamento), new { id = pagamento.Id }, pagamento);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarPagamento(int id, Pagamento pagamento)
        {
            if (id != pagamento.Id)
                return BadRequest(new { mensagem = "ID do pagamento inválido." });

            var pagamentoBanco = await _context.Pagamentos.FindAsync(id);

            if (pagamentoBanco == null)
                return NotFound(new { mensagem = "Pagamento não encontrado." });

            if (pagamento.Valor <= 0)
                return BadRequest(new { mensagem = "O valor do pagamento deve ser maior que zero." });

            pagamentoBanco.Valor = pagamento.Valor;
            pagamentoBanco.FormaPagamento = pagamento.FormaPagamento;
            pagamentoBanco.StatusPagamento = pagamento.StatusPagamento;
            pagamentoBanco.Observacoes = pagamento.Observacoes;

            if (pagamento.StatusPagamento == "Pago")
                pagamentoBanco.DataPagamento = pagamento.DataPagamento ?? DateTime.UtcNow;
            else
                pagamentoBanco.DataPagamento = pagamento.DataPagamento;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> ExcluirPagamento(int id)
        {
            var pagamento = await _context.Pagamentos.FindAsync(id);

            if (pagamento == null)
                return NotFound(new { mensagem = "Pagamento não encontrado." });

            _context.Pagamentos.Remove(pagamento);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}