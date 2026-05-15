using System.Text;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.Models;
using OpenAI;
using OpenAI.Chat;

namespace MeuCrud.Api.Services
{
    public class AssistenteIaService
    {
        private readonly AppDbContext _context;
        private readonly string _apiKey;

        public AssistenteIaService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _apiKey = config["OpenAI:ApiKey"] ?? string.Empty;
        }

        public async Task<AssistenteIaResultado> GerarResumoPaciente(string pergunta, int? pacienteId = null)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                return new AssistenteIaResultado { Tipo = "erro", Mensagem = "A chave da OpenAI não foi configurada." };
            }

            var paciente = pacienteId.HasValue
                ? await ObterPacienteCompletoPorId(pacienteId.Value)
                : await BuscarPacientePorTexto(pergunta);

            if (paciente == null)
                return new AssistenteIaResultado { Tipo = "erro", Mensagem = "Paciente não encontrado." };

            var agendamentos = paciente.Agendamentos?.OrderByDescending(a => a.DataAgendamento).ToList() ?? new List<Agendamento>();
            var prontuarios = agendamentos.Where(a => a.Prontuario != null).Select(a => a.Prontuario!).ToList();

            var contexto = new StringBuilder();
            contexto.AppendLine("Responda em português do Brasil com markdown leve.");
            contexto.AppendLine("Use uma linguagem administrativa/clínica, sem inventar informações.");
            contexto.AppendLine($"Paciente: {paciente.Nome}");
            contexto.AppendLine($"CPF: {MascararCpf(paciente.CPF)}");
            contexto.AppendLine($"Telefone: {paciente.Telefone}");
            contexto.AppendLine($"Total de agendamentos: {agendamentos.Count}");
            contexto.AppendLine();
            contexto.AppendLine("Agendamentos recentes:");
            foreach (var a in agendamentos.Take(10))
                contexto.AppendLine($"- {a.DataAgendamento:dd/MM/yyyy HH:mm} | {a.Medico?.Nome ?? "Médico não informado"} | {a.Status} | {a.MotivoAgendamento}");
            contexto.AppendLine();
            contexto.AppendLine("Prontuários:");
            foreach (var p in prontuarios.Take(10))
                contexto.AppendLine($"- Diagnóstico: {p.Diagnostico}; Prescrição: {p.Prescricao}; Observações: {p.Observacoes}");
            contexto.AppendLine();
            contexto.AppendLine("Pergunta:");
            contexto.AppendLine(pergunta);

            var client = new OpenAIClient(_apiKey);
            var chatClient = client.GetChatClient("gpt-4o-mini");
            var resposta = await chatClient.CompleteChatAsync(new List<ChatMessage>
            {
                ChatMessage.CreateSystemMessage("Você é um assistente clínico administrativo para um sistema acadêmico."),
                ChatMessage.CreateUserMessage(contexto.ToString())
            });

            return new AssistenteIaResultado { Tipo = "resumo", Resposta = resposta.Value.Content[0].Text };
        }

        private async Task<Paciente?> BuscarPacientePorTexto(string texto)
        {
            var normalizado = (texto ?? string.Empty).Trim().ToLower();
            var cpf = new string(normalizado.Where(char.IsDigit).ToArray());
            if (!string.IsNullOrWhiteSpace(cpf))
                return await ObterPacienteCompletoPorCpf(cpf);
            return await _context.Pacientes.Where(p => p.Nome.ToLower().Contains(normalizado)).OrderBy(p => p.Nome).Select(p => p.Id).FirstOrDefaultAsync() is int id && id > 0
                ? await ObterPacienteCompletoPorId(id)
                : null;
        }

        private async Task<Paciente?> ObterPacienteCompletoPorCpf(string cpf)
        {
            return await _context.Pacientes.Include(p => p.Agendamentos!).ThenInclude(a => a.Medico).Include(p => p.Agendamentos!).ThenInclude(a => a.Prontuario).FirstOrDefaultAsync(p => p.CPF.Contains(cpf));
        }

        private async Task<Paciente?> ObterPacienteCompletoPorId(int id)
        {
            return await _context.Pacientes.Include(p => p.Agendamentos!).ThenInclude(a => a.Medico).Include(p => p.Agendamentos!).ThenInclude(a => a.Prontuario).FirstOrDefaultAsync(p => p.Id == id);
        }

        private static string MascararCpf(string? cpf)
        {
            if (string.IsNullOrWhiteSpace(cpf)) return "Não informado";
            var numeros = new string(cpf.Where(char.IsDigit).ToArray());
            return numeros.Length < 4 ? "***" : $"***.***.***-{numeros[^4..]}";
        }
    }

    public class AssistenteIaResultado
    {
        public string Tipo { get; set; } = string.Empty;
        public string? Mensagem { get; set; }
        public string? Resposta { get; set; }
        public List<PacienteOpcaoIaDto> Pacientes { get; set; } = new();
    }

    public class PacienteOpcaoIaDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string CpfMascarado { get; set; } = string.Empty;
        public string DataNascimento { get; set; } = string.Empty;
    }
}
