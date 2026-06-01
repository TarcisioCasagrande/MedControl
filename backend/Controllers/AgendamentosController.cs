using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.DTOs;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/agendamentos")]
    public class AgendamentosController : ControllerBase
    {
        private readonly AppDbContext _context;

        private static readonly string[] StatusValidos =
        {
            "Agendado",
            "AtendidoRecepcao",
            "EmAndamento",
            "Finalizado",
            "Cancelado"
        };

        public AgendamentosController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult> Listar()
        {
            var query = QueryCompleta();

            if (User.IsInRole("Medico"))
            {
                var medico = await ObterMedicoLogado();

                if (medico == null)
                    return NotFound(new { mensagem = "Nenhum cadastro de médico está vinculado ao usuário logado." });

                query = query.Where(a => a.MedicoId == medico.Id);
            }

            var agendamentos = await query
                .OrderBy(a => a.DataAgendamento)
                .Select(a => new
                {
                    a.Id,
                    a.DataAgendamento,
                    a.Status,
                    a.MotivoAgendamento,
                    a.Observacoes,
                    a.TipoAtendimento,
                    a.ValorCobrado,
                    a.DataCadastro,
                    a.DataAtualizacao,
                    a.DataInicioAtendimento,
                    a.DataFimAtendimento,

                    a.MedicoId,
                    MedicoNome = a.Medico != null ? a.Medico.Nome : null,
                    MedicoEspecialidade = a.Medico != null ? a.Medico.Especialidade : null,
                    Medico = a.Medico == null ? null : new
                    {
                        a.Medico.Id,
                        a.Medico.Nome,
                        a.Medico.CRM,
                        a.Medico.Especialidade,
                        a.Medico.Telefone,
                        a.Medico.Email
                    },

                    a.PacienteId,
                    PacienteNome = a.Paciente != null ? a.Paciente.Nome : null,
                    PacienteTelefone = a.Paciente != null ? a.Paciente.Telefone : null,
                    Paciente = a.Paciente == null ? null : new
                    {
                        a.Paciente.Id,
                        a.Paciente.Nome,
                        a.Paciente.CPF,
                        a.Paciente.Telefone,
                        a.Paciente.Email,
                        a.Paciente.DataNascimento
                    },

                    a.ProcedimentoId,
                    ProcedimentoNome = a.Procedimento != null ? a.Procedimento.Nome : null,
                    ProcedimentoValor = a.Procedimento != null ? a.Procedimento.Valor : 0,
                    Procedimento = a.Procedimento == null ? null : new
                    {
                        a.Procedimento.Id,
                        a.Procedimento.Nome,
                        a.Procedimento.Codigo,
                        a.Procedimento.Valor,
                        a.Procedimento.Ativo
                    },

                    a.CriadoPorUsuarioId,
                    CriadoPorUsuarioNome = a.CriadoPorUsuario != null ? a.CriadoPorUsuario.Nome : null,

                    PagamentoId = a.Pagamento != null ? a.Pagamento.Id : (int?)null,
                    PagamentoStatus = a.Pagamento != null ? a.Pagamento.StatusPagamento : null,
                    PagamentoValor = a.Pagamento != null ? a.Pagamento.Valor : 0,

                    TemProntuario = a.Prontuario != null
                })
                .ToListAsync();

            return Ok(agendamentos);
        }

        [Authorize(Roles = "Medico")]
        [HttpGet("meus")]
        public async Task<ActionResult> MeusAgendamentos(
            [FromQuery] string? status = null,
            [FromQuery] DateTime? data = null)
        {
            return await ListarDoMedicoLogado(status, data);
        }

        [Authorize(Roles = "Medico")]
        [HttpGet("medico-logado")]
        public async Task<ActionResult> ListarDoMedicoLogado(
            [FromQuery] string? status = null,
            [FromQuery] DateTime? data = null)
        {
            var medico = await ObterMedicoLogado();

            if (medico == null)
            {
                return NotFound(new
                {
                    mensagem = "Nenhum cadastro de médico está vinculado ao usuário logado. Verifique o usuário associado ao médico."
                });
            }

            var query = QueryCompleta().Where(a => a.MedicoId == medico.Id);

            if (!string.IsNullOrWhiteSpace(status))
            {
                var statusNormalizado = NormalizarStatus(status, status);
                query = query.Where(a => a.Status == statusNormalizado);
            }

            if (data.HasValue)
            {
                var inicio = DateTime.SpecifyKind(data.Value.Date, DateTimeKind.Local).ToUniversalTime();
                var fim = inicio.AddDays(1);

                query = query.Where(a => a.DataAgendamento >= inicio && a.DataAgendamento < fim);
            }

            var agendamentos = await query
                .OrderBy(a => a.DataAgendamento)
                .Select(a => new
                {
                    a.Id,
                    a.DataAgendamento,
                    a.Status,
                    a.MotivoAgendamento,
                    a.Observacoes,
                    a.TipoAtendimento,
                    a.ValorCobrado,
                    a.DataInicioAtendimento,
                    a.DataFimAtendimento,

                    a.MedicoId,
                    MedicoNome = a.Medico != null ? a.Medico.Nome : null,
                    MedicoEspecialidade = a.Medico != null ? a.Medico.Especialidade : null,
                    Medico = a.Medico == null ? null : new
                    {
                        a.Medico.Id,
                        a.Medico.Nome,
                        a.Medico.CRM,
                        a.Medico.Especialidade,
                        a.Medico.Telefone,
                        a.Medico.Email
                    },

                    a.PacienteId,
                    PacienteNome = a.Paciente != null ? a.Paciente.Nome : null,
                    PacienteTelefone = a.Paciente != null ? a.Paciente.Telefone : null,
                    Paciente = a.Paciente == null ? null : new
                    {
                        a.Paciente.Id,
                        a.Paciente.Nome,
                        a.Paciente.CPF,
                        a.Paciente.Telefone,
                        a.Paciente.Email,
                        a.Paciente.DataNascimento
                    },

                    a.ProcedimentoId,
                    ProcedimentoNome = a.Procedimento != null ? a.Procedimento.Nome : null,
                    ProcedimentoValor = a.Procedimento != null ? a.Procedimento.Valor : 0,
                    Procedimento = a.Procedimento == null ? null : new
                    {
                        a.Procedimento.Id,
                        a.Procedimento.Nome,
                        a.Procedimento.Codigo,
                        a.Procedimento.Valor,
                        a.Procedimento.Ativo
                    },

                    a.CriadoPorUsuarioId,
                    CriadoPorUsuarioNome = a.CriadoPorUsuario != null ? a.CriadoPorUsuario.Nome : null,

                    PagamentoId = a.Pagamento != null ? a.Pagamento.Id : (int?)null,
                    PagamentoStatus = a.Pagamento != null ? a.Pagamento.StatusPagamento : null,
                    PagamentoValor = a.Pagamento != null ? a.Pagamento.Valor : 0,

                    TemProntuario = a.Prontuario != null
                })
                .ToListAsync();

            return Ok(agendamentos);
        }

        [Authorize]
        [HttpGet("{id:int}")]
        public async Task<ActionResult> BuscarPorId(int id)
        {
            var agendamentoOriginal = await _context.Agendamentos
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id);

            if (agendamentoOriginal == null)
                return NotFound(new { mensagem = "Agendamento não encontrado." });

            if (User.IsInRole("Medico"))
            {
                var podeAcessar = await MedicoPodeAcessarAgendamento(agendamentoOriginal.MedicoId);

                if (!podeAcessar)
                    return Forbid();
            }

            var agendamento = await QueryCompleta()
                .Where(a => a.Id == id)
                .Select(a => new
                {
                    a.Id,
                    a.DataAgendamento,
                    a.Status,
                    a.MotivoAgendamento,
                    a.Observacoes,
                    a.TipoAtendimento,
                    a.ValorCobrado,
                    a.DataCadastro,
                    a.DataAtualizacao,
                    a.DataInicioAtendimento,
                    a.DataFimAtendimento,

                    a.MedicoId,
                    MedicoNome = a.Medico != null ? a.Medico.Nome : null,
                    MedicoEspecialidade = a.Medico != null ? a.Medico.Especialidade : null,
                    Medico = a.Medico == null ? null : new
                    {
                        a.Medico.Id,
                        a.Medico.Nome,
                        a.Medico.CRM,
                        a.Medico.Especialidade,
                        a.Medico.Telefone,
                        a.Medico.Email
                    },

                    a.PacienteId,
                    PacienteNome = a.Paciente != null ? a.Paciente.Nome : null,
                    PacienteTelefone = a.Paciente != null ? a.Paciente.Telefone : null,
                    PacienteEmail = a.Paciente != null ? a.Paciente.Email : null,
                    Paciente = a.Paciente == null ? null : new
                    {
                        a.Paciente.Id,
                        a.Paciente.Nome,
                        a.Paciente.CPF,
                        a.Paciente.Telefone,
                        a.Paciente.Email,
                        a.Paciente.DataNascimento,
                        a.Paciente.TipoSanguineo,
                        a.Paciente.Alergias,
                        a.Paciente.DoencasPreExistentes
                    },

                    a.ProcedimentoId,
                    ProcedimentoNome = a.Procedimento != null ? a.Procedimento.Nome : null,
                    ProcedimentoValor = a.Procedimento != null ? a.Procedimento.Valor : 0,
                    Procedimento = a.Procedimento == null ? null : new
                    {
                        a.Procedimento.Id,
                        a.Procedimento.Nome,
                        a.Procedimento.Codigo,
                        a.Procedimento.Valor,
                        a.Procedimento.Ativo
                    },

                    a.CriadoPorUsuarioId,
                    CriadoPorUsuarioNome = a.CriadoPorUsuario != null ? a.CriadoPorUsuario.Nome : null,

                    PagamentoId = a.Pagamento != null ? a.Pagamento.Id : (int?)null,
                    PagamentoStatus = a.Pagamento != null ? a.Pagamento.StatusPagamento : null,
                    PagamentoValor = a.Pagamento != null ? a.Pagamento.Valor : 0,
                    PagamentoForma = a.Pagamento != null ? a.Pagamento.FormaPagamento : null,

                    TemProntuario = a.Prontuario != null
                })
                .FirstOrDefaultAsync();

            return Ok(agendamento);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult> Criar([FromBody] Agendamento agendamento)
        {
            var validacao = await ValidarAgendamento(agendamento);

            if (!validacao.Valido)
                return BadRequest(new { mensagem = validacao.Mensagem });

            var usuarioId = ObterUsuarioIdLogado();

            agendamento.Id = 0;
            agendamento.DataAgendamento = ParaUtc(agendamento.DataAgendamento);
            agendamento.DataCadastro = DateTime.UtcNow;
            agendamento.DataAtualizacao = null;
            agendamento.Status = NormalizarStatus(agendamento.Status, "Agendado");
            agendamento.CriadoPorUsuarioId = usuarioId;
            agendamento.ValorCobrado = await ObterValorCobrado(
                agendamento.ProcedimentoId,
                agendamento.ValorCobrado
            );

            _context.Agendamentos.Add(agendamento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(BuscarPorId), new { id = agendamento.Id }, new
            {
                mensagem = "Agendamento criado com sucesso.",
                agendamento.Id
            });
        }

        [Authorize]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] Agendamento dados)
        {
            var agendamento = await _context.Agendamentos.FindAsync(id);

            if (agendamento == null)
                return NotFound(new { mensagem = "Agendamento não encontrado." });

            if (User.IsInRole("Medico"))
            {
                var podeAcessar = await MedicoPodeAcessarAgendamento(agendamento.MedicoId);

                if (!podeAcessar)
                    return Forbid();
            }

            dados.Id = id;

            var validacao = await ValidarAgendamento(dados, id);

            if (!validacao.Valido)
                return BadRequest(new { mensagem = validacao.Mensagem });

            agendamento.DataAgendamento = ParaUtc(dados.DataAgendamento);
            agendamento.Status = NormalizarStatus(dados.Status, agendamento.Status);
            agendamento.MotivoAgendamento = dados.MotivoAgendamento ?? string.Empty;
            agendamento.Observacoes = dados.Observacoes ?? string.Empty;
            agendamento.TipoAtendimento = string.IsNullOrWhiteSpace(dados.TipoAtendimento)
                ? "Presencial"
                : dados.TipoAtendimento;
            agendamento.MedicoId = dados.MedicoId;
            agendamento.PacienteId = dados.PacienteId;
            agendamento.ProcedimentoId = dados.ProcedimentoId;
            agendamento.ValorCobrado = await ObterValorCobrado(dados.ProcedimentoId, dados.ValorCobrado);
            agendamento.DataAtualizacao = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize]
        [HttpPut("{id:int}/alterar-status")]
        public async Task<IActionResult> AlterarStatus(int id, [FromBody] AlterarStatusAgendamentoDto dto)
        {
            return await AtualizarStatus(id, dto.Status);
        }

        [Authorize]
        [HttpPut("{id:int}/atender-recepcao")]
        public async Task<IActionResult> AtenderRecepcao(int id)
        {
            return await AtualizarStatus(id, "AtendidoRecepcao");
        }

        [Authorize(Roles = "Medico")]
        [HttpPut("{id:int}/iniciar-atendimento")]
        public async Task<IActionResult> IniciarAtendimento(int id)
        {
            var agendamento = await _context.Agendamentos.FindAsync(id);

            if (agendamento == null)
                return NotFound(new { mensagem = "Agendamento não encontrado." });

            var podeAcessar = await MedicoPodeAcessarAgendamento(agendamento.MedicoId);

            if (!podeAcessar)
                return Forbid();

            if (agendamento.Status == "Cancelado")
                return BadRequest(new { mensagem = "Agendamento cancelado não pode ser iniciado." });

            if (agendamento.Status != "AtendidoRecepcao" && agendamento.Status != "EmAndamento")
            {
                return BadRequest(new
                {
                    mensagem = "O atendimento só pode ser iniciado após a liberação pela recepção."
                });
            }

            agendamento.Status = "EmAndamento";
            agendamento.DataInicioAtendimento ??= DateTime.UtcNow;
            agendamento.DataAtualizacao = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Atendimento iniciado com sucesso.",
                agendamento.Id,
                agendamento.Status,
                agendamento.DataInicioAtendimento
            });
        }

        [Authorize(Roles = "Medico")]
        [HttpPut("{id:int}/finalizar-atendimento")]
        public async Task<IActionResult> FinalizarAtendimento(int id)
        {
            var agendamento = await _context.Agendamentos
                .Include(a => a.Prontuario)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (agendamento == null)
                return NotFound(new { mensagem = "Agendamento não encontrado." });

            var podeAcessar = await MedicoPodeAcessarAgendamento(agendamento.MedicoId);

            if (!podeAcessar)
                return Forbid();

            if (agendamento.Prontuario == null)
            {
                return BadRequest(new
                {
                    mensagem = "Crie o prontuário antes de finalizar o atendimento."
                });
            }

            agendamento.Status = "Finalizado";
            agendamento.DataFimAtendimento ??= DateTime.UtcNow;
            agendamento.DataAtualizacao = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Atendimento finalizado com sucesso.",
                agendamento.Id,
                agendamento.Status,
                agendamento.DataFimAtendimento
            });
        }

        [Authorize]
        [HttpPut("{id:int}/cancelar")]
        public async Task<IActionResult> Cancelar(int id)
        {
            return await AtualizarStatus(id, "Cancelado");
        }

        [Authorize]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var agendamento = await _context.Agendamentos
                .Include(a => a.Pagamento)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (agendamento == null)
                return NotFound(new { mensagem = "Agendamento não encontrado." });

            if (User.IsInRole("Medico"))
            {
                var podeAcessar = await MedicoPodeAcessarAgendamento(agendamento.MedicoId);

                if (!podeAcessar)
                    return Forbid();
            }

            if (agendamento.Pagamento != null &&
                agendamento.Pagamento.StatusPagamento == "Pago")
            {
                return Conflict(new
                {
                    mensagem = "Não é possível excluir este agendamento porque ele possui pagamento realizado. Cancele, estorne ou remova o pagamento antes de excluir o agendamento."
                });
            }

            _context.Agendamentos.Remove(agendamento);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private IQueryable<Agendamento> QueryCompleta()
        {
            return _context.Agendamentos
                .AsNoTracking()
                .Include(a => a.Medico)
                .Include(a => a.Paciente)
                .Include(a => a.Procedimento)
                .Include(a => a.Pagamento)
                .Include(a => a.Prontuario)
                .Include(a => a.CriadoPorUsuario);
        }

        private async Task<IActionResult> AtualizarStatus(int id, string status)
        {
            var agendamento = await _context.Agendamentos.FindAsync(id);

            if (agendamento == null)
                return NotFound(new { mensagem = "Agendamento não encontrado." });

            if (User.IsInRole("Medico"))
            {
                var podeAcessar = await MedicoPodeAcessarAgendamento(agendamento.MedicoId);

                if (!podeAcessar)
                    return new ForbidResult();
            }

            var novoStatus = NormalizarStatus(status, agendamento.Status);

            agendamento.Status = novoStatus;
            agendamento.DataAtualizacao = DateTime.UtcNow;

            if (novoStatus == "EmAndamento")
                agendamento.DataInicioAtendimento ??= DateTime.UtcNow;

            if (novoStatus == "Finalizado")
                agendamento.DataFimAtendimento ??= DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Status atualizado com sucesso.",
                agendamento.Id,
                agendamento.Status,
                agendamento.DataInicioAtendimento,
                agendamento.DataFimAtendimento
            });
        }

        private int? ObterUsuarioIdLogado()
        {
            var usuarioIdTexto =
                User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                User.FindFirstValue("id") ??
                User.FindFirstValue("usuarioId") ??
                User.FindFirstValue("sub");

            if (int.TryParse(usuarioIdTexto, out var usuarioId) && usuarioId > 0)
                return usuarioId;

            return null;
        }

        private async Task<Medico?> ObterMedicoLogado()
        {
            var usuarioId = ObterUsuarioIdLogado();
            var emailUsuario = User.FindFirstValue(ClaimTypes.Email);
            var emailNormalizado = (emailUsuario ?? string.Empty).ToLower();

            return await _context.Medicos
                .FirstOrDefaultAsync(m =>
                    (usuarioId.HasValue && m.UsuarioId == usuarioId.Value) ||
                    (!string.IsNullOrWhiteSpace(emailNormalizado) &&
                     m.Email.ToLower() == emailNormalizado)
                );
        }

        private async Task<bool> MedicoPodeAcessarAgendamento(int medicoId)
        {
            var medico = await ObterMedicoLogado();
            return medico != null && medico.Id == medicoId;
        }

        private async Task<(bool Valido, string Mensagem)> ValidarAgendamento(
            Agendamento agendamento,
            int? idIgnorar = null)
        {
            if (agendamento.MedicoId <= 0)
                return (false, "Selecione um médico.");

            if (agendamento.PacienteId <= 0)
                return (false, "Selecione um paciente.");

            if (agendamento.ProcedimentoId is null or <= 0)
                return (false, "Selecione um procedimento.");

            if (!await _context.Medicos.AnyAsync(m => m.Id == agendamento.MedicoId))
                return (false, "Médico não encontrado.");

            if (!await _context.Pacientes.AnyAsync(p => p.Id == agendamento.PacienteId))
                return (false, "Paciente não encontrado.");

            if (!await _context.Procedimentos.AnyAsync(p => p.Id == agendamento.ProcedimentoId && p.Ativo))
                return (false, "Procedimento não encontrado ou inativo.");

            var dataUtc = ParaUtc(agendamento.DataAgendamento);

            var medicoOcupado = await _context.Agendamentos.AnyAsync(a =>
                a.Id != idIgnorar &&
                a.MedicoId == agendamento.MedicoId &&
                a.DataAgendamento == dataUtc &&
                a.Status != "Cancelado"
            );

            if (medicoOcupado)
                return (false, "O médico já possui agendamento neste horário.");

            var pacienteOcupado = await _context.Agendamentos.AnyAsync(a =>
                a.Id != idIgnorar &&
                a.PacienteId == agendamento.PacienteId &&
                a.DataAgendamento == dataUtc &&
                a.Status != "Cancelado"
            );

            if (pacienteOcupado)
                return (false, "O paciente já possui agendamento neste horário.");

            var disponibilidadesDoMedico = await _context.DisponibilidadesMedico
                .AnyAsync(d => d.MedicoId == agendamento.MedicoId && d.Ativo);

            if (disponibilidadesDoMedico &&
                !await EstaDentroDaDisponibilidade(agendamento.MedicoId, dataUtc))
            {
                return (false, "O horário escolhido não está dentro da disponibilidade do médico.");
            }

            return (true, string.Empty);
        }

        private async Task<bool> EstaDentroDaDisponibilidade(int medicoId, DateTime dataHora)
        {
            var data = dataHora.Date;
            var hora = dataHora.TimeOfDay;
            var diaSemana = (int)dataHora.DayOfWeek;

            return await _context.DisponibilidadesMedico.AnyAsync(d =>
                d.MedicoId == medicoId &&
                d.Ativo &&
                d.DiaSemana == diaSemana &&
                d.DataInicio.Date <= data &&
                d.DataFim.Date >= data &&
                d.HoraInicio <= hora &&
                d.HoraFim > hora
            );
        }

        private async Task<decimal> ObterValorCobrado(int? procedimentoId, decimal valorInformado)
        {
            if (valorInformado > 0)
                return valorInformado;

            if (procedimentoId == null)
                return 0;

            return await _context.Procedimentos
                .Where(p => p.Id == procedimentoId)
                .Select(p => p.Valor)
                .FirstOrDefaultAsync();
        }

        private static DateTime ParaUtc(DateTime data)
        {
            if (data.Kind == DateTimeKind.Utc)
                return data;

            return DateTime.SpecifyKind(data, DateTimeKind.Local).ToUniversalTime();
        }

        private static string NormalizarStatus(string? status, string fallback)
        {
            if (string.IsNullOrWhiteSpace(status))
                return fallback;

            var statusSemAcento = status.Trim();

            if (statusSemAcento.Equals("Agendada", StringComparison.OrdinalIgnoreCase))
                return "Agendado";

            if (statusSemAcento.Equals("Cancelada", StringComparison.OrdinalIgnoreCase))
                return "Cancelado";

            if (statusSemAcento.Equals("Concluída", StringComparison.OrdinalIgnoreCase) ||
                statusSemAcento.Equals("Realizada", StringComparison.OrdinalIgnoreCase))
                return "Finalizado";

            return StatusValidos.Contains(statusSemAcento)
                ? statusSemAcento
                : fallback;
        }
    }
}