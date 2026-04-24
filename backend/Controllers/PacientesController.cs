using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PacientesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PacientesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Paciente>>> GetPacientes()
        {
            var pacientes = await _context.Pacientes
                .OrderBy(p => p.Nome)
                .ToListAsync();

            return Ok(pacientes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Paciente>> GetPaciente(int id)
        {
            var paciente = await _context.Pacientes
                .FirstOrDefaultAsync(p => p.Id == id);

            if (paciente == null)
            {
                return NotFound(new { mensagem = $"Paciente com ID {id} não encontrado." });
            }

            return Ok(paciente);
        }

        [HttpPost]
        public async Task<ActionResult<Paciente>> PostPaciente(Paciente paciente)
        {
            try
            {
                var cpfJaExiste = await _context.Pacientes
                    .AnyAsync(p => p.CPF == paciente.CPF);

                if (cpfJaExiste)
                {
                    return BadRequest(new { mensagem = "Já existe um paciente cadastrado com este CPF." });
                }

                paciente.DataCadastro = DateTime.UtcNow;
                paciente.DataNascimento = NormalizarData(paciente.DataNascimento);

                _context.Pacientes.Add(paciente);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetPaciente), new { id = paciente.Id }, paciente);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensagem = "Erro interno ao cadastrar o paciente.",
                    detalhe = ex.Message
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPaciente(int id, Paciente paciente)
        {
            try
            {
                if (id != paciente.Id)
                {
                    return BadRequest(new { mensagem = "O ID da URL não corresponde ao ID do paciente no body." });
                }

                var pacienteExistente = await _context.Pacientes.FindAsync(id);

                if (pacienteExistente == null)
                {
                    return NotFound(new { mensagem = $"Paciente com ID {id} não encontrado." });
                }

                var cpfJaExiste = await _context.Pacientes
                    .AnyAsync(p => p.CPF == paciente.CPF && p.Id != paciente.Id);

                if (cpfJaExiste)
                {
                    return BadRequest(new { mensagem = "Já existe outro paciente cadastrado com este CPF." });
                }

                pacienteExistente.Nome = paciente.Nome;
                pacienteExistente.CPF = paciente.CPF;
                pacienteExistente.Telefone = paciente.Telefone;
                pacienteExistente.Email = paciente.Email;
                pacienteExistente.Endereco = paciente.Endereco;
                pacienteExistente.DataNascimento = NormalizarData(paciente.DataNascimento);
                pacienteExistente.Sexo = paciente.Sexo;
                pacienteExistente.TipoSanguineo = paciente.TipoSanguineo;
                pacienteExistente.Alergias = paciente.Alergias;
                pacienteExistente.DoencasPreExistentes = paciente.DoencasPreExistentes;
                pacienteExistente.NomeContatoEmergencia = paciente.NomeContatoEmergencia;
                pacienteExistente.TelefoneContatoEmergencia = paciente.TelefoneContatoEmergencia;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensagem = "Erro interno ao atualizar o paciente.",
                    detalhe = ex.Message
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePaciente(int id)
        {
            try
            {
                var paciente = await _context.Pacientes.FindAsync(id);

                if (paciente == null)
                {
                    return NotFound(new { mensagem = $"Paciente com ID {id} não encontrado." });
                }

                var pacientePossuiConsultas = await _context.Consultas
                    .AnyAsync(c => c.PacienteId == id);

                if (pacientePossuiConsultas)
                {
                    return BadRequest(new
                    {
                        mensagem = "Este paciente possui consultas vinculadas e não pode ser excluído."
                    });
                }

                _context.Pacientes.Remove(paciente);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensagem = "Erro interno ao excluir o paciente.",
                    detalhe = ex.Message
                });
            }
        }

        private DateTime NormalizarData(DateTime data)
        {
            if (data == default)
                return data;

            return DateTime.SpecifyKind(data, DateTimeKind.Utc);
        }
    }
}