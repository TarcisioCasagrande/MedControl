using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConsultasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ConsultasController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Consulta>>> GetConsultas()
        {
            var consultas = await _context.Consultas
                .Include(c => c.Medico)
                .Include(c => c.Paciente)
                .Include(c => c.Prontuario)
                .OrderBy(c => c.DataConsulta)
                .ToListAsync();

            return Ok(consultas);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Consulta>> GetConsulta(int id)
        {
            var consulta = await _context.Consultas
                .Include(c => c.Medico)
                .Include(c => c.Paciente)
                .Include(c => c.Prontuario)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (consulta == null)
            {
                return NotFound(new { mensagem = $"Consulta com ID {id} não encontrada." });
            }

            return Ok(consulta);
        }

        [HttpPost]
        public async Task<ActionResult<Consulta>> PostConsulta(Consulta consulta)
        {
            var medico = await _context.Medicos.FindAsync(consulta.MedicoId);
            if (medico == null)
            {
                return BadRequest(new { mensagem = "O médico informado não existe." });
            }

            var paciente = await _context.Pacientes.FindAsync(consulta.PacienteId);
            if (paciente == null)
            {
                return BadRequest(new { mensagem = "O paciente informado não existe." });
            }

            consulta.DataConsulta = DateTime.SpecifyKind(consulta.DataConsulta, DateTimeKind.Utc);
            consulta.DataCadastro = DateTime.UtcNow;

            if (string.IsNullOrWhiteSpace(consulta.Status))
            {
                consulta.Status = "Agendada";
            }

            var medicoOcupado = await _context.Consultas.AnyAsync(c =>
                c.MedicoId == consulta.MedicoId &&
                c.DataConsulta == consulta.DataConsulta &&
                c.Status != "Cancelada");

            if (medicoOcupado)
            {
                return BadRequest(new
                {
                    mensagem = $"O médico {medico.Nome} já possui uma consulta agendada para este dia e horário. Escolha outro horário."
                });
            }

            var pacienteOcupado = await _context.Consultas.AnyAsync(c =>
                c.PacienteId == consulta.PacienteId &&
                c.DataConsulta == consulta.DataConsulta &&
                c.Status != "Cancelada");

            if (pacienteOcupado)
            {
                return BadRequest(new
                {
                    mensagem = $"O paciente {paciente.Nome} já possui uma consulta agendada para este dia e horário."
                });
            }

            _context.Consultas.Add(consulta);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetConsulta), new { id = consulta.Id }, consulta);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutConsulta(int id, Consulta consulta)
        {
            if (id != consulta.Id)
            {
                return BadRequest(new { mensagem = "O ID da URL não corresponde ao ID da consulta no body." });
            }

            var consultaExistente = await _context.Consultas.FindAsync(id);
            if (consultaExistente == null)
            {
                return NotFound(new { mensagem = $"Consulta com ID {id} não encontrada." });
            }

            var medico = await _context.Medicos.FindAsync(consulta.MedicoId);
            if (medico == null)
            {
                return BadRequest(new { mensagem = "O médico informado não existe." });
            }

            var paciente = await _context.Pacientes.FindAsync(consulta.PacienteId);
            if (paciente == null)
            {
                return BadRequest(new { mensagem = "O paciente informado não existe." });
            }

            consulta.DataConsulta = DateTime.SpecifyKind(consulta.DataConsulta, DateTimeKind.Utc);

            var medicoOcupado = await _context.Consultas.AnyAsync(c =>
                c.Id != consulta.Id &&
                c.MedicoId == consulta.MedicoId &&
                c.DataConsulta == consulta.DataConsulta &&
                c.Status != "Cancelada");

            if (medicoOcupado)
            {
                return BadRequest(new
                {
                    mensagem = $"O médico {medico.Nome} já possui uma consulta agendada para este dia e horário. Escolha outro horário."
                });
            }

            var pacienteOcupado = await _context.Consultas.AnyAsync(c =>
                c.Id != consulta.Id &&
                c.PacienteId == consulta.PacienteId &&
                c.DataConsulta == consulta.DataConsulta &&
                c.Status != "Cancelada");

            if (pacienteOcupado)
            {
                return BadRequest(new
                {
                    mensagem = $"O paciente {paciente.Nome} já possui uma consulta agendada para este dia e horário."
                });
            }

            consultaExistente.DataConsulta = consulta.DataConsulta;
            consultaExistente.Status = NormalizarStatusBanco(consulta.Status);
            consultaExistente.MotivoConsulta = consulta.MotivoConsulta;
            consultaExistente.Observacoes = consulta.Observacoes;
            consultaExistente.TipoAtendimento = consulta.TipoAtendimento;
            consultaExistente.ValorCobrado = consulta.ValorCobrado;
            consultaExistente.DataInicioAtendimento = consulta.DataInicioAtendimento;
            consultaExistente.DataFimAtendimento = consulta.DataFimAtendimento;
            consultaExistente.MedicoId = consulta.MedicoId;
            consultaExistente.PacienteId = consulta.PacienteId;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}/iniciar-atendimento")]
        public async Task<IActionResult> IniciarAtendimento(int id)
        {
            var consulta = await _context.Consultas
                .Include(c => c.Medico)
                .Include(c => c.Paciente)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (consulta == null)
            {
                return NotFound(new { mensagem = $"Consulta com ID {id} não encontrada." });
            }

            var statusAtual = NormalizarStatusBanco(consulta.Status);

            if (statusAtual == "Cancelada")
            {
                return BadRequest(new { mensagem = "Não é possível iniciar um atendimento de uma consulta cancelada." });
            }

            if (statusAtual == "Finalizada")
            {
                return BadRequest(new { mensagem = "Não é possível iniciar um atendimento de uma consulta já finalizada." });
            }

            if (statusAtual == "EmAndamento")
            {
                return BadRequest(new { mensagem = "Esta consulta já está em andamento." });
            }

            consulta.Status = "EmAndamento";
            consulta.DataInicioAtendimento = DateTime.UtcNow;
            consulta.DataFimAtendimento = null;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Atendimento iniciado com sucesso.",
                consultaId = consulta.Id,
                status = consulta.Status,
                dataInicioAtendimento = consulta.DataInicioAtendimento
            });
        }

        [HttpPut("{id}/finalizar-atendimento")]
        public async Task<IActionResult> FinalizarAtendimento(int id)
        {
            var consulta = await _context.Consultas
                .Include(c => c.Medico)
                .Include(c => c.Paciente)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (consulta == null)
            {
                return NotFound(new { mensagem = $"Consulta com ID {id} não encontrada." });
            }

            var statusAtual = NormalizarStatusBanco(consulta.Status);

            if (statusAtual == "Cancelada")
            {
                return BadRequest(new { mensagem = "Não é possível finalizar uma consulta cancelada." });
            }

            if (statusAtual == "Finalizada")
            {
                return BadRequest(new { mensagem = "Esta consulta já foi finalizada." });
            }

            if (statusAtual != "EmAndamento")
            {
                return BadRequest(new { mensagem = "A consulta precisa estar em andamento para ser finalizada." });
            }

            if (!consulta.DataInicioAtendimento.HasValue)
            {
                return BadRequest(new { mensagem = "Não foi encontrado horário de início do atendimento." });
            }

            consulta.Status = "Finalizada";
            consulta.DataFimAtendimento = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Atendimento finalizado com sucesso.",
                consultaId = consulta.Id,
                status = consulta.Status,
                dataInicioAtendimento = consulta.DataInicioAtendimento,
                dataFimAtendimento = consulta.DataFimAtendimento
            });
        }

        [HttpPut("{id}/alterar-status")]
        public async Task<IActionResult> AlterarStatus(int id, [FromBody] AlterarStatusConsultaDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Status))
            {
                return BadRequest(new { mensagem = "O status informado é obrigatório." });
            }

            var consulta = await _context.Consultas.FindAsync(id);
            if (consulta == null)
            {
                return NotFound(new { mensagem = $"Consulta com ID {id} não encontrada." });
            }

            var novoStatus = NormalizarStatusBanco(dto.Status);

            var statusPermitidos = new List<string>
            {
                "Agendada",
                "Pendente",
                "EmAndamento",
                "Finalizada",
                "Cancelada"
            };

            if (!statusPermitidos.Contains(novoStatus))
            {
                return BadRequest(new { mensagem = "O status informado é inválido." });
            }

            if (consulta.Status == "Cancelada" && novoStatus == "EmAndamento")
            {
                return BadRequest(new { mensagem = "Não é possível colocar uma consulta cancelada em andamento." });
            }

            if (consulta.Status == "Cancelada" && novoStatus == "Finalizada")
            {
                return BadRequest(new { mensagem = "Não é possível finalizar uma consulta cancelada." });
            }

            consulta.Status = novoStatus;

            if (novoStatus == "EmAndamento" && consulta.DataInicioAtendimento == null)
            {
                consulta.DataInicioAtendimento = DateTime.UtcNow;
                consulta.DataFimAtendimento = null;
            }

            if (novoStatus == "Finalizada")
            {
                if (consulta.DataInicioAtendimento == null)
                {
                    consulta.DataInicioAtendimento = DateTime.UtcNow;
                }

                if (consulta.DataFimAtendimento == null)
                {
                    consulta.DataFimAtendimento = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Status alterado com sucesso.",
                consultaId = consulta.Id,
                status = consulta.Status,
                dataInicioAtendimento = consulta.DataInicioAtendimento,
                dataFimAtendimento = consulta.DataFimAtendimento
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConsulta(int id)
        {
            var consulta = await _context.Consultas
                .Include(c => c.Prontuario)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (consulta == null)
            {
                return NotFound(new { mensagem = $"Consulta com ID {id} não encontrada." });
            }

            var consultaPossuiProntuario = await _context.Prontuarios
                .AnyAsync(p => p.ConsultaId == id);

            if (consultaPossuiProntuario)
            {
                return BadRequest(new
                {
                    mensagem = "Esta consulta possui prontuário vinculado e não pode ser excluída."
                });
            }

            _context.Consultas.Remove(consulta);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static string NormalizarStatusBanco(string? status)
        {
            var valor = (status ?? "").Trim().ToLowerInvariant();

            return valor switch
            {
                "agendada" => "Agendada",
                "pendente" => "Pendente",
                "emandamento" => "EmAndamento",
                "cancelada" => "Cancelada",
                "realizada" => "Finalizada",
                "concluída" => "Finalizada",
                "concluida" => "Finalizada",
                "finalizada" => "Finalizada",
                _ => status?.Trim() ?? "Agendada"
            };
        }
    }

    public class AlterarStatusConsultaDto
    {
        public string Status { get; set; } = string.Empty;
    }
}