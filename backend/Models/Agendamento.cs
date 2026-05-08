using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MeuCrud.Api.Models
{
    // Entidade central do projeto acadêmico.
    public class Agendamento
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "A data do agendamento é obrigatória.")]
        public DateTime DataAgendamento { get; set; }

        [Required]
        [StringLength(40)]
        public string Status { get; set; } = "Agendado";

        [StringLength(500)]
        public string MotivoAgendamento { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Observacoes { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string TipoAtendimento { get; set; } = "Presencial";

        [Column(TypeName = "numeric(10,2)")]
        public decimal ValorCobrado { get; set; }

        public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
        public DateTime? DataAtualizacao { get; set; }
        public DateTime? DataInicioAtendimento { get; set; }
        public DateTime? DataFimAtendimento { get; set; }

        [Required]
        public int MedicoId { get; set; }
        public Medico? Medico { get; set; }

        [Required]
        public int PacienteId { get; set; }
        public Paciente? Paciente { get; set; }

        public int? ProcedimentoId { get; set; }
        public Procedimento? Procedimento { get; set; }

        public Prontuario? Prontuario { get; set; }
        public Pagamento? Pagamento { get; set; }

        public int? CriadoPorUsuarioId { get; set; }
        public Usuario? CriadoPorUsuario { get; set; }
    }
}
