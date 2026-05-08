using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/pagamentos")]
    public class PagamentosController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PagamentosController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var pagamentos = await Query().OrderByDescending(p => p.DataPagamento ?? p.DataCadastro).ToListAsync();
            return Ok(pagamentos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> BuscarPorId(int id)
        {
            var pagamento = await Query().FirstOrDefaultAsync(p => p.Id == id);
            return pagamento == null ? NotFound(new { mensagem = "Pagamento não encontrado." }) : Ok(pagamento);
        }

        [HttpPost]
        public async Task<IActionResult> Criar([FromBody] PagamentoRequest request)
        {
            var validacao = await Validar(request);
            if (!validacao.Valido) return BadRequest(new { mensagem = validacao.Mensagem });
            if (await _context.Pagamentos.AnyAsync(p => p.AgendamentoId == request.AgendamentoId)) return BadRequest(new { mensagem = "Este agendamento já possui pagamento." });
            var pagamento = new Pagamento
            {
                AgendamentoId = request.AgendamentoId,
                Valor = request.Valor,
                FormaPagamento = request.FormaPagamento,
                StatusPagamento = request.StatusPagamento,
                DataPagamento = request.DataPagamento.HasValue ? ParaUtc(request.DataPagamento.Value) : null,
                Observacoes = request.Observacoes
            };
            _context.Pagamentos.Add(pagamento);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(BuscarPorId), new { id = pagamento.Id }, pagamento);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] PagamentoRequest request)
        {
            var pagamento = await _context.Pagamentos.FindAsync(id);
            if (pagamento == null) return NotFound(new { mensagem = "Pagamento não encontrado." });
            request.AgendamentoId = request.AgendamentoId <= 0 ? pagamento.AgendamentoId : request.AgendamentoId;
            var validacao = await Validar(request);
            if (!validacao.Valido) return BadRequest(new { mensagem = validacao.Mensagem });
            pagamento.AgendamentoId = request.AgendamentoId;
            pagamento.Valor = request.Valor;
            pagamento.FormaPagamento = request.FormaPagamento;
            pagamento.StatusPagamento = request.StatusPagamento;
            pagamento.DataPagamento = request.DataPagamento.HasValue ? ParaUtc(request.DataPagamento.Value) : null;
            pagamento.Observacoes = request.Observacoes;
            pagamento.DataAtualizacao = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(pagamento);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var pagamento = await _context.Pagamentos.FindAsync(id);
            if (pagamento == null) return NotFound(new { mensagem = "Pagamento não encontrado." });
            _context.Pagamentos.Remove(pagamento);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private IQueryable<Pagamento> Query() => _context.Pagamentos.Include(p => p.Agendamento)!.ThenInclude(a => a!.Paciente).Include(p => p.Agendamento)!.ThenInclude(a => a!.Medico).Include(p => p.Agendamento)!.ThenInclude(a => a!.Procedimento);

        private async Task<(bool Valido, string Mensagem)> Validar(PagamentoRequest r)
        {
            if (r.AgendamentoId <= 0) return (false, "Informe o agendamento.");
            if (!await _context.Agendamentos.AnyAsync(a => a.Id == r.AgendamentoId)) return (false, "Agendamento não encontrado.");
            if (r.Valor < 0) return (false, "O valor não pode ser negativo.");
            if (string.IsNullOrWhiteSpace(r.FormaPagamento)) return (false, "Informe a forma de pagamento.");
            if (string.IsNullOrWhiteSpace(r.StatusPagamento)) return (false, "Informe o status do pagamento.");
            return (true, string.Empty);
        }

        private static DateTime ParaUtc(DateTime data) => data.Kind == DateTimeKind.Utc ? data : DateTime.SpecifyKind(data, DateTimeKind.Local).ToUniversalTime();
    }

    public class PagamentoRequest
    {
        public int Id { get; set; }
        public int AgendamentoId { get; set; }
        public decimal Valor { get; set; }
        public string FormaPagamento { get; set; } = "Pix";
        public string StatusPagamento { get; set; } = "Pendente";
        public DateTime? DataPagamento { get; set; }
        public string? Observacoes { get; set; }
    }
}
