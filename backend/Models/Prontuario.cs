using System.ComponentModel.DataAnnotations;

namespace MeuCrud.Api.Models
{
    public class Prontuario
    {
        public int Id { get; set; }

        [StringLength(500)]
        public string QueixaPrincipal { get; set; } = string.Empty;

        [StringLength(1000)]
        public string HistoricoClinico { get; set; } = string.Empty;

        [Required(ErrorMessage = "O diagnóstico é obrigatório.")]
        [StringLength(1000)]
        public string Diagnostico { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Conduta { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Prescricao { get; set; } = string.Empty;

        // Campo mantido porque o frontend usa o nome receita em alguns formulários.
        [StringLength(1000)]
        public string Receita { get; set; } = string.Empty;

        [StringLength(1000)]
        public string ExamesSolicitados { get; set; } = string.Empty;

        [StringLength(1500)]
        public string Observacoes { get; set; } = string.Empty;

        public DateTime DataRegistro { get; set; } = DateTime.UtcNow;
        public DateTime? DataAtualizacao { get; set; }

        [Required(ErrorMessage = "O agendamento é obrigatório.")]
        public int AgendamentoId { get; set; }
        public Agendamento? Agendamento { get; set; }
    }
}
