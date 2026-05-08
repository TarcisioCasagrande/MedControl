using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MeuCrud.Api.Models
{
    public class Pagamento
    {
        public int Id { get; set; }

        [Required]
        public int AgendamentoId { get; set; }
        public Agendamento? Agendamento { get; set; }

        [Required]
        [Column(TypeName = "numeric(10,2)")]
        public decimal Valor { get; set; }

        [Required]
        [MaxLength(50)]
        public string FormaPagamento { get; set; } = "Pix";

        [Required]
        [MaxLength(50)]
        public string StatusPagamento { get; set; } = "Pendente";

        public DateTime? DataPagamento { get; set; }

        [MaxLength(500)]
        public string? Observacoes { get; set; }

        public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
        public DateTime? DataAtualizacao { get; set; }
    }
}
