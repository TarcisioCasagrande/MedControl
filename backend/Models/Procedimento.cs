using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MeuCrud.Api.Models
{
    public class Procedimento
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome do procedimento é obrigatório.")]
        [MaxLength(150)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Codigo { get; set; }

        [Column(TypeName = "numeric(10,2)")]
        public decimal Valor { get; set; }

        public bool Ativo { get; set; } = true;
        public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
        public DateTime? DataAtualizacao { get; set; }

        public ICollection<Agendamento>? Agendamentos { get; set; }
    }
}
