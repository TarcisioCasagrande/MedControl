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
            if (string.IsNullOrWhiteSpace(pergunta) && !pacienteId.HasValue)
            {
                return new AssistenteIaResultado
                {
                    Tipo = "erro",
                    Mensagem = "Informe uma pergunta ou selecione um paciente."
                };
            }

            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                return new AssistenteIaResultado
                {
                    Tipo = "erro",
                    Mensagem = "A chave da OpenAI não foi configurada."
                };
            }

            Paciente? paciente;

            if (pacienteId.HasValue)
            {
                paciente = await ObterPacienteCompletoPorId(pacienteId.Value);

                if (paciente == null)
                {
                    return new AssistenteIaResultado
                    {
                        Tipo = "erro",
                        Mensagem = "O paciente selecionado não foi encontrado."
                    };
                }
            }
            else
            {
                var cpf = new string((pergunta ?? string.Empty).Where(char.IsDigit).ToArray());
                var perguntaNormalizada = (pergunta ?? string.Empty).Trim().ToLower();

                if (!string.IsNullOrWhiteSpace(cpf))
                {
                    paciente = await _context.Pacientes
                        .Include(p => p.Consultas!)
                            .ThenInclude(c => c.Medico)
                        .Include(p => p.Consultas!)
                            .ThenInclude(c => c.Prontuario)
                        .FirstOrDefaultAsync(p => p.CPF != null && p.CPF.Contains(cpf));

                    if (paciente == null)
                    {
                        return new AssistenteIaResultado
                        {
                            Tipo = "erro",
                            Mensagem = "Não encontrei nenhum paciente com esse CPF."
                        };
                    }
                }
                else
                {
                    var pacientesEncontrados = await _context.Pacientes
                        .Where(p => p.Nome != null && p.Nome.ToLower().Contains(perguntaNormalizada))
                        .OrderBy(p => p.Nome)
                        .ThenBy(p => p.DataNascimento)
                        .Take(10)
                        .ToListAsync();

                    if (pacientesEncontrados.Count == 0)
                    {
                        return new AssistenteIaResultado
                        {
                            Tipo = "erro",
                            Mensagem = "Não encontrei nenhum paciente com esse nome."
                        };
                    }

                    if (pacientesEncontrados.Count > 1)
                    {
                        return new AssistenteIaResultado
                        {
                            Tipo = "multiplo",
                            Mensagem = "Encontrei mais de um paciente com esse nome. Selecione o paciente correto para gerar o resumo.",
                            Pacientes = pacientesEncontrados.Select(p => new PacienteOpcaoIaDto
                            {
                                Id = p.Id,
                                Nome = p.Nome ?? "Paciente sem nome",
                                CpfMascarado = MascararCpf(p.CPF),
                                DataNascimento = p.DataNascimento.ToString("dd/MM/yyyy")
                            }).ToList()
                        };
                    }

                    paciente = await ObterPacienteCompletoPorId(pacientesEncontrados[0].Id);

                    if (paciente == null)
                    {
                        return new AssistenteIaResultado
                        {
                            Tipo = "erro",
                            Mensagem = "Não foi possível carregar os dados completos do paciente."
                        };
                    }
                }
            }

            var consultas = paciente.Consultas?.ToList() ?? new List<Consulta>();

            var totalConsultas = consultas.Count;
            var totalPago = consultas.Sum(c => c.ValorCobrado);

            var medicos = consultas
                .Where(c => c.Medico != null && !string.IsNullOrWhiteSpace(c.Medico.Nome))
                .Select(c => c.Medico!.Nome)
                .Distinct()
                .ToList();

            var prontuarios = consultas
                .Where(c => c.Prontuario != null)
                .Select(c => c.Prontuario!)
                .ToList();

            var contexto = new StringBuilder();

            contexto.AppendLine("Responda em português do Brasil.");
            contexto.AppendLine("Use markdown leve e organizado.");
            contexto.AppendLine("Use títulos com ##.");
            contexto.AppendLine("Seja claro, profissional e objetivo.");
            contexto.AppendLine();
            contexto.AppendLine("Estrutura esperada:");
            contexto.AppendLine("## Resumo do paciente");
            contexto.AppendLine("## Dados gerais");
            contexto.AppendLine("## Médicos responsáveis");
            contexto.AppendLine("## Histórico clínico");
            contexto.AppendLine("## Conclusão");
            contexto.AppendLine();
            contexto.AppendLine("Dados do paciente:");
            contexto.AppendLine($"Nome: {paciente.Nome}");
            contexto.AppendLine($"CPF: {MascararCpf(paciente.CPF)}");
            contexto.AppendLine($"Telefone: {paciente.Telefone}");
            contexto.AppendLine($"E-mail: {paciente.Email}");
            contexto.AppendLine($"Data de nascimento: {paciente.DataNascimento:dd/MM/yyyy}");
            contexto.AppendLine($"Total de consultas: {totalConsultas}");
            contexto.AppendLine($"Total pago: R$ {totalPago:F2}");
            contexto.AppendLine();

            contexto.AppendLine("Médicos que atenderam:");
            if (medicos.Count == 0)
            {
                contexto.AppendLine("- Nenhum médico encontrado.");
            }
            else
            {
                foreach (var medico in medicos)
                {
                    contexto.AppendLine($"- {medico}");
                }
            }

            contexto.AppendLine();
            contexto.AppendLine("Consultas:");
            if (consultas.Count == 0)
            {
                contexto.AppendLine("- Nenhuma consulta registrada.");
            }
            else
            {
                foreach (var consulta in consultas.OrderByDescending(c => c.DataConsulta).Take(10))
                {
                    contexto.AppendLine($"- Data: {consulta.DataConsulta:dd/MM/yyyy HH:mm}");
                    contexto.AppendLine($"  Médico: {consulta.Medico?.Nome ?? "Não informado"}");
                    contexto.AppendLine($"  Observações: {consulta.Observacoes ?? "Não informadas"}");
                    contexto.AppendLine($"  Valor cobrado: R$ {consulta.ValorCobrado:F2}");
                }
            }

            contexto.AppendLine();
            contexto.AppendLine("Prontuários:");
            if (prontuarios.Count == 0)
            {
                contexto.AppendLine("- Nenhum prontuário encontrado.");
            }
            else
            {
                foreach (var prontuario in prontuarios.Take(10))
                {
                    contexto.AppendLine($"- Diagnóstico: {prontuario.Diagnostico ?? "Não informado"}");
                    contexto.AppendLine($"  Observações: {prontuario.Observacoes ?? "Não informadas"}");
                    contexto.AppendLine($"  Prescrição: {prontuario.Prescricao ?? "Não informada"}");
                }
            }

            contexto.AppendLine();
            contexto.AppendLine("Pergunta do usuário:");
            contexto.AppendLine(pergunta);

            var client = new OpenAIClient(_apiKey);
            var chatClient = client.GetChatClient("gpt-5.4-mini");

            var resposta = await chatClient.CompleteChatAsync(
                new List<ChatMessage>
                {
                    ChatMessage.CreateSystemMessage("Você é um assistente clínico administrativo."),
                    ChatMessage.CreateUserMessage(contexto.ToString())
                });

            return new AssistenteIaResultado
            {
                Tipo = "resumo",
                Resposta = resposta.Value.Content[0].Text
            };
        }

        private async Task<Paciente?> ObterPacienteCompletoPorId(int id)
        {
            return await _context.Pacientes
                .Include(p => p.Consultas!)
                    .ThenInclude(c => c.Medico)
                .Include(p => p.Consultas!)
                    .ThenInclude(c => c.Prontuario)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        private string MascararCpf(string? cpf)
        {
            if (string.IsNullOrWhiteSpace(cpf))
                return "Não informado";

            var numeros = new string(cpf.Where(char.IsDigit).ToArray());

            if (numeros.Length < 4)
                return "***";

            var final = numeros[^4..];
            return $"***.***.***-{final}";
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