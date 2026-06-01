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

        public PagamentosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var pagamentos = await Query()
                .OrderByDescending(p => p.DataPagamento ?? p.DataCadastro)
                .Select(p => new
                {
                    p.Id,
                    p.AgendamentoId,
                    p.Valor,
                    p.FormaPagamento,
                    p.StatusPagamento,
                    p.DataPagamento,
                    p.Observacoes,
                    p.DataCadastro,
                    p.DataAtualizacao,

                    PacienteNome = p.Agendamento != null && p.Agendamento.Paciente != null ? p.Agendamento.Paciente.Nome : null,
                    MedicoNome = p.Agendamento != null && p.Agendamento.Medico != null ? p.Agendamento.Medico.Nome : null,
                    ProcedimentoNome = p.Agendamento != null && p.Agendamento.Procedimento != null ? p.Agendamento.Procedimento.Nome : null,

                    Agendamento = p.Agendamento == null ? null : new
                    {
                        p.Agendamento.Id,
                        p.Agendamento.DataAgendamento,
                        p.Agendamento.Status,
                        p.Agendamento.TipoAtendimento,
                        p.Agendamento.ValorCobrado,

                        Paciente = p.Agendamento.Paciente == null ? null : new
                        {
                            p.Agendamento.Paciente.Id,
                            p.Agendamento.Paciente.Nome,
                            p.Agendamento.Paciente.CPF,
                            p.Agendamento.Paciente.Telefone,
                            p.Agendamento.Paciente.Email
                        },

                        Medico = p.Agendamento.Medico == null ? null : new
                        {
                            p.Agendamento.Medico.Id,
                            p.Agendamento.Medico.Nome,
                            p.Agendamento.Medico.CRM,
                            p.Agendamento.Medico.Especialidade
                        },

                        Procedimento = p.Agendamento.Procedimento == null ? null : new
                        {
                            p.Agendamento.Procedimento.Id,
                            p.Agendamento.Procedimento.Nome,
                            p.Agendamento.Procedimento.Codigo,
                            p.Agendamento.Procedimento.Valor
                        }
                    }
                })
                .ToListAsync();

            return Ok(pagamentos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> BuscarPorId(int id)
        {
            var pagamento = await Query()
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.AgendamentoId,
                    p.Valor,
                    p.FormaPagamento,
                    p.StatusPagamento,
                    p.DataPagamento,
                    p.Observacoes,
                    p.DataCadastro,
                    p.DataAtualizacao,

                    PacienteNome = p.Agendamento != null && p.Agendamento.Paciente != null ? p.Agendamento.Paciente.Nome : null,
                    MedicoNome = p.Agendamento != null && p.Agendamento.Medico != null ? p.Agendamento.Medico.Nome : null,
                    ProcedimentoNome = p.Agendamento != null && p.Agendamento.Procedimento != null ? p.Agendamento.Procedimento.Nome : null,

                    Agendamento = p.Agendamento == null ? null : new
                    {
                        p.Agendamento.Id,
                        p.Agendamento.DataAgendamento,
                        p.Agendamento.Status,
                        p.Agendamento.TipoAtendimento,
                        p.Agendamento.ValorCobrado,

                        Paciente = p.Agendamento.Paciente == null ? null : new
                        {
                            p.Agendamento.Paciente.Id,
                            p.Agendamento.Paciente.Nome,
                            p.Agendamento.Paciente.CPF,
                            p.Agendamento.Paciente.Telefone,
                            p.Agendamento.Paciente.Email
                        },

                        Medico = p.Agendamento.Medico == null ? null : new
                        {
                            p.Agendamento.Medico.Id,
                            p.Agendamento.Medico.Nome,
                            p.Agendamento.Medico.CRM,
                            p.Agendamento.Medico.Especialidade
                        },

                        Procedimento = p.Agendamento.Procedimento == null ? null : new
                        {
                            p.Agendamento.Procedimento.Id,
                            p.Agendamento.Procedimento.Nome,
                            p.Agendamento.Procedimento.Codigo,
                            p.Agendamento.Procedimento.Valor
                        }
                    }
                })
                .FirstOrDefaultAsync();

            return pagamento == null
                ? NotFound(new { mensagem = "Pagamento não encontrado." })
                : Ok(pagamento);
        }

        [HttpPost]
        public async Task<IActionResult> Criar([FromBody] PagamentoRequest request)
        {
            var validacao = await Validar(request);

            if (!validacao.Valido)
                return BadRequest(new { mensagem = validacao.Mensagem });

            if (await _context.Pagamentos.AnyAsync(p => p.AgendamentoId == request.AgendamentoId))
                return BadRequest(new { mensagem = "Este agendamento já possui pagamento." });

            var pagamento = new Pagamento
            {
                AgendamentoId = request.AgendamentoId,
                Valor = request.Valor,
                FormaPagamento = request.FormaPagamento,
                StatusPagamento = request.StatusPagamento,
                DataPagamento = request.DataPagamento.HasValue ? ParaUtc(request.DataPagamento.Value) : null,
                Observacoes = request.Observacoes,
                DataCadastro = DateTime.UtcNow,
                DataAtualizacao = null
            };

            _context.Pagamentos.Add(pagamento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(BuscarPorId), new { id = pagamento.Id }, new
            {
                mensagem = "Pagamento criado com sucesso.",
                pagamento.Id
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] PagamentoRequest request)
        {
            var pagamento = await _context.Pagamentos.FindAsync(id);

            if (pagamento == null)
                return NotFound(new { mensagem = "Pagamento não encontrado." });

            request.AgendamentoId = request.AgendamentoId <= 0 ? pagamento.AgendamentoId : request.AgendamentoId;

            var validacao = await Validar(request, id);

            if (!validacao.Valido)
                return BadRequest(new { mensagem = validacao.Mensagem });

            pagamento.AgendamentoId = request.AgendamentoId;
            pagamento.Valor = request.Valor;
            pagamento.FormaPagamento = request.FormaPagamento;
            pagamento.StatusPagamento = request.StatusPagamento;
            pagamento.DataPagamento = request.DataPagamento.HasValue ? ParaUtc(request.DataPagamento.Value) : null;
            pagamento.Observacoes = request.Observacoes;
            pagamento.DataAtualizacao = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var pagamento = await _context.Pagamentos.FindAsync(id);

            if (pagamento == null)
                return NotFound(new { mensagem = "Pagamento não encontrado." });

            _context.Pagamentos.Remove(pagamento);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private IQueryable<Pagamento> Query()
        {
            return _context.Pagamentos
                .AsNoTracking()
                .Include(p => p.Agendamento)!
                    .ThenInclude(a => a!.Paciente)
                .Include(p => p.Agendamento)!
                    .ThenInclude(a => a!.Medico)
                .Include(p => p.Agendamento)!
                    .ThenInclude(a => a!.Procedimento);
        }

        private async Task<(bool Valido, string Mensagem)> Validar(PagamentoRequest r, int? idIgnorar = null)
        {
            if (r.AgendamentoId <= 0)
                return (false, "Informe o agendamento.");

            if (!await _context.Agendamentos.AnyAsync(a => a.Id == r.AgendamentoId))
                return (false, "Agendamento não encontrado.");

            var jaExiste = await _context.Pagamentos.AnyAsync(p =>
                p.Id != idIgnorar &&
                p.AgendamentoId == r.AgendamentoId
            );

            if (jaExiste)
                return (false, "Este agendamento já possui pagamento.");

            if (r.Valor < 0)
                return (false, "O valor não pode ser negativo.");

            if (string.IsNullOrWhiteSpace(r.FormaPagamento))
                return (false, "Informe a forma de pagamento.");

            if (string.IsNullOrWhiteSpace(r.StatusPagamento))
                return (false, "Informe o status do pagamento.");

            return (true, string.Empty);
        }

        private static DateTime ParaUtc(DateTime data)
        {
            if (data.Kind == DateTimeKind.Utc)
                return data;

            return DateTime.SpecifyKind(data, DateTimeKind.Local).ToUniversalTime();
        }
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
