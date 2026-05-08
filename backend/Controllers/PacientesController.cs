using System.Net.Mail;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/pacientes")]
    public class PacientesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PacientesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Paciente>>> Listar()
        {
            var pacientes = await _context.Pacientes
                .OrderBy(p => p.Nome)
                .ToListAsync();

            return Ok(pacientes);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Paciente>> BuscarPorId(int id)
        {
            var paciente = await _context.Pacientes.FindAsync(id);

            if (paciente == null)
                return NotFound(new { mensagem = "Paciente não encontrado." });

            return Ok(paciente);
        }

        [HttpPost]
        public async Task<ActionResult<Paciente>> Criar(Paciente paciente)
        {
            var validacao = ValidarPaciente(paciente);

            if (!validacao.Valido)
                return BadRequest(new { mensagem = validacao.Mensagem });

            var cpfNumeros = ApenasNumeros(paciente.CPF);

            var cpfExiste = await _context.Pacientes.AnyAsync(p =>
                p.CPF.Replace(".", "").Replace("-", "") == cpfNumeros
            );

            if (cpfExiste)
                return BadRequest(new { mensagem = "Já existe paciente com este CPF." });

            paciente.Id = 0;
            paciente.Nome = paciente.Nome.Trim();
            paciente.CPF = FormatarCpf(cpfNumeros);
            paciente.Telefone = FormatarTelefone(ApenasNumeros(paciente.Telefone));
            paciente.Email = paciente.Email.Trim().ToLower();
            paciente.Endereco = paciente.Endereco?.Trim() ?? string.Empty;
            paciente.DataNascimento = AjustarData(paciente.DataNascimento);
            paciente.TelefoneContatoEmergencia = FormatarTelefone(ApenasNumeros(paciente.TelefoneContatoEmergencia));
            paciente.DataCadastro = DateTime.UtcNow;
            paciente.DataAtualizacao = null;
            paciente.Ativo = true;

            _context.Pacientes.Add(paciente);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(BuscarPorId), new { id = paciente.Id }, paciente);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Atualizar(int id, Paciente dados)
        {
            var paciente = await _context.Pacientes.FindAsync(id);

            if (paciente == null)
                return NotFound(new { mensagem = "Paciente não encontrado." });

            var validacao = ValidarPaciente(dados);

            if (!validacao.Valido)
                return BadRequest(new { mensagem = validacao.Mensagem });

            var cpfNumeros = ApenasNumeros(dados.CPF);

            var cpfExiste = await _context.Pacientes.AnyAsync(p =>
                p.Id != id &&
                p.CPF.Replace(".", "").Replace("-", "") == cpfNumeros
            );

            if (cpfExiste)
                return BadRequest(new { mensagem = "Já existe outro paciente com este CPF." });

            paciente.Nome = dados.Nome.Trim();
            paciente.CPF = FormatarCpf(cpfNumeros);
            paciente.Telefone = FormatarTelefone(ApenasNumeros(dados.Telefone));
            paciente.Email = dados.Email.Trim().ToLower();
            paciente.Endereco = dados.Endereco?.Trim() ?? string.Empty;
            paciente.DataNascimento = AjustarData(dados.DataNascimento);
            paciente.Sexo = dados.Sexo ?? string.Empty;
            paciente.TipoSanguineo = dados.TipoSanguineo ?? string.Empty;
            paciente.Alergias = dados.Alergias ?? string.Empty;
            paciente.DoencasPreExistentes = dados.DoencasPreExistentes ?? string.Empty;
            paciente.NomeContatoEmergencia = dados.NomeContatoEmergencia ?? string.Empty;
            paciente.TelefoneContatoEmergencia = FormatarTelefone(ApenasNumeros(dados.TelefoneContatoEmergencia));
            paciente.Ativo = dados.Ativo;
            paciente.DataAtualizacao = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var paciente = await _context.Pacientes.FindAsync(id);

            if (paciente == null)
                return NotFound(new { mensagem = "Paciente não encontrado." });

            var possuiAgendamento = await _context.Agendamentos
                .AnyAsync(a => a.PacienteId == id);

            if (possuiAgendamento)
                return BadRequest(new { mensagem = "Não é possível excluir paciente com agendamentos vinculados." });

            _context.Pacientes.Remove(paciente);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static (bool Valido, string Mensagem) ValidarPaciente(Paciente paciente)
        {
            if (string.IsNullOrWhiteSpace(paciente.Nome))
                return (false, "Informe o nome do paciente.");

            var cpfNumeros = ApenasNumeros(paciente.CPF);

            if (cpfNumeros.Length != 11)
                return (false, "Informe um CPF válido com 11 dígitos.");

            if (!CpfValido(cpfNumeros))
                return (false, "CPF inválido.");

            var telefoneNumeros = ApenasNumeros(paciente.Telefone);

            if (telefoneNumeros.Length < 10 || telefoneNumeros.Length > 11)
                return (false, "Informe um telefone válido.");

            if (string.IsNullOrWhiteSpace(paciente.Email) || !EmailValido(paciente.Email))
                return (false, "Informe um e-mail válido.");

            if (paciente.DataNascimento == default)
                return (false, "Informe a data de nascimento.");

            var dataNascimento = paciente.DataNascimento.Date;
            var hoje = DateTime.UtcNow.Date;

            if (dataNascimento > hoje)
                return (false, "A data de nascimento não pode ser futura.");

            if (dataNascimento < hoje.AddYears(-120))
                return (false, "Informe uma data de nascimento válida.");

            var telefoneEmergencia = ApenasNumeros(paciente.TelefoneContatoEmergencia);

            if (!string.IsNullOrWhiteSpace(paciente.TelefoneContatoEmergencia) &&
                (telefoneEmergencia.Length < 10 || telefoneEmergencia.Length > 11))
                return (false, "Informe um telefone de emergência válido.");

            return (true, string.Empty);
        }

        private static string ApenasNumeros(string? valor)
        {
            return Regex.Replace(valor ?? string.Empty, @"\D", "");
        }

        private static bool EmailValido(string email)
        {
            try
            {
                var endereco = new MailAddress(email.Trim());
                return endereco.Address == email.Trim();
            }
            catch
            {
                return false;
            }
        }

        private static bool CpfValido(string cpf)
        {
            if (cpf.Length != 11) return false;
            if (cpf.Distinct().Count() == 1) return false;

            var soma = 0;

            for (var i = 0; i < 9; i++)
                soma += int.Parse(cpf[i].ToString()) * (10 - i);

            var resto = soma % 11;
            var digito1 = resto < 2 ? 0 : 11 - resto;

            if (digito1 != int.Parse(cpf[9].ToString())) return false;

            soma = 0;

            for (var i = 0; i < 10; i++)
                soma += int.Parse(cpf[i].ToString()) * (11 - i);

            resto = soma % 11;
            var digito2 = resto < 2 ? 0 : 11 - resto;

            return digito2 == int.Parse(cpf[10].ToString());
        }

        private static string FormatarCpf(string cpf)
        {
            if (cpf.Length != 11) return cpf;

            return $"{cpf[..3]}.{cpf.Substring(3, 3)}.{cpf.Substring(6, 3)}-{cpf.Substring(9, 2)}";
        }

        private static string FormatarTelefone(string telefone)
        {
            if (string.IsNullOrWhiteSpace(telefone)) return string.Empty;

            if (telefone.Length == 10)
                return $"({telefone[..2]}) {telefone.Substring(2, 4)}-{telefone.Substring(6, 4)}";

            if (telefone.Length == 11)
                return $"({telefone[..2]}) {telefone.Substring(2, 5)}-{telefone.Substring(7, 4)}";

            return telefone;
        }

        private static DateTime AjustarData(DateTime data)
        {
            return data.Kind == DateTimeKind.Utc
                ? data.Date
                : DateTime.SpecifyKind(data.Date, DateTimeKind.Utc);
        }
    }
}