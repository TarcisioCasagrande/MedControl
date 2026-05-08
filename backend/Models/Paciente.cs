using System.ComponentModel.DataAnnotations;

namespace MeuCrud.Api.Models
{
    public class Paciente
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(150)]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O CPF é obrigatório.")]
        [StringLength(14)]
        public string CPF { get; set; } = string.Empty;

        [Required(ErrorMessage = "O telefone é obrigatório.")]
        [StringLength(15)]
        public string Telefone { get; set; } = string.Empty;

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [StringLength(200)]
        public string Endereco { get; set; } = string.Empty;

        [Required(ErrorMessage = "A data de nascimento é obrigatória.")]
        public DateTime DataNascimento { get; set; }

        [StringLength(20)]
        public string Sexo { get; set; } = string.Empty;

        [StringLength(10)]
        public string TipoSanguineo { get; set; } = string.Empty;

        [StringLength(500)]
        public string Alergias { get; set; } = string.Empty;

        [StringLength(500)]
        public string DoencasPreExistentes { get; set; } = string.Empty;

        [StringLength(150)]
        public string NomeContatoEmergencia { get; set; } = string.Empty;

        [StringLength(15)]
        public string TelefoneContatoEmergencia { get; set; } = string.Empty;

        public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
        public DateTime? DataAtualizacao { get; set; }
        public bool Ativo { get; set; } = true;

        public int? UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }

        public ICollection<Agendamento>? Agendamentos { get; set; }
    }
}
