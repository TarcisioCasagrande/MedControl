using System.ComponentModel.DataAnnotations;

namespace MeuCrud.Api.Models
{
    public class Medico
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(150)]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O CRM é obrigatório.")]
        [StringLength(20)]
        public string CRM { get; set; } = string.Empty;

        [Required(ErrorMessage = "A especialidade é obrigatória.")]
        [StringLength(100)]
        public string Especialidade { get; set; } = string.Empty;

        [Required(ErrorMessage = "O telefone é obrigatório.")]
        [StringLength(20)]
        public string Telefone { get; set; } = string.Empty;

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [StringLength(150)]
        public string Clinica { get; set; } = string.Empty;

        [StringLength(100)]
        public string TurnoAtendimento { get; set; } = string.Empty;

        public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
        public DateTime? DataAtualizacao { get; set; }
        public bool Ativo { get; set; } = true;

        public int? UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }

        public ICollection<Agendamento>? Agendamentos { get; set; }
    }
}
