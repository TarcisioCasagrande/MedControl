using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MeuCrud.Api.Models
{
    public class Paciente
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(150, ErrorMessage = "O nome deve ter no máximo 150 caracteres.")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O CPF é obrigatório.")]
        [StringLength(14, ErrorMessage = "O CPF deve ter no máximo 14 caracteres.")]
        public string CPF { get; set; } = string.Empty;

        [Required(ErrorMessage = "O telefone é obrigatório.")]
        [StringLength(20, ErrorMessage = "O telefone deve ter no máximo 20 caracteres.")]
        public string Telefone { get; set; } = string.Empty;

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress(ErrorMessage = "Informe um e-mail válido.")]
        [StringLength(150, ErrorMessage = "O e-mail deve ter no máximo 150 caracteres.")]
        public string Email { get; set; } = string.Empty;

        [StringLength(200, ErrorMessage = "O endereço deve ter no máximo 200 caracteres.")]
        public string Endereco { get; set; } = string.Empty;

        [Required(ErrorMessage = "A data de nascimento é obrigatória.")]
        public DateTime DataNascimento { get; set; }

        [StringLength(20, ErrorMessage = "O sexo deve ter no máximo 20 caracteres.")]
        public string Sexo { get; set; } = string.Empty;

        [StringLength(10, ErrorMessage = "O tipo sanguíneo deve ter no máximo 10 caracteres.")]
        public string TipoSanguineo { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "As alergias devem ter no máximo 500 caracteres.")]
        public string Alergias { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "As doenças pré-existentes devem ter no máximo 500 caracteres.")]
        public string DoencasPreExistentes { get; set; } = string.Empty;

        [StringLength(150, ErrorMessage = "O nome do contato de emergência deve ter no máximo 150 caracteres.")]
        public string NomeContatoEmergencia { get; set; } = string.Empty;

        [StringLength(20, ErrorMessage = "O telefone do contato de emergência deve ter no máximo 20 caracteres.")]
        public string TelefoneContatoEmergencia { get; set; } = string.Empty;

        public DateTime DataCadastro { get; set; } = DateTime.Now;

        public ICollection<Consulta>? Consultas { get; set; }
    }
}