using System.ComponentModel.DataAnnotations;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.DTOs
{
    public class AtualizarUsuarioDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress(ErrorMessage = "Informe um e-mail válido.")]
        public string Email { get; set; } = string.Empty;

        // 🔥 Agora sempre obrigatória
        [Required(ErrorMessage = "A senha é obrigatória.")]
        public string Senha { get; set; } = string.Empty;

        [Required(ErrorMessage = "O perfil é obrigatório.")]
        public PerfilUsuario Perfil { get; set; }

        public bool Ativo { get; set; }

        // 🔥 Vínculo com médico
        public int? MedicoId { get; set; }
    }
}