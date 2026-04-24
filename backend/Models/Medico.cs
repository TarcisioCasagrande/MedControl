using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MeuCrud.Api.Models
{
    public class Medico
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(150, ErrorMessage = "O nome deve ter no máximo 150 caracteres.")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O CRM é obrigatório.")]
        [StringLength(20, ErrorMessage = "O CRM deve ter no máximo 20 caracteres.")]
        public string CRM { get; set; } = string.Empty;

        [Required(ErrorMessage = "A especialidade é obrigatória.")]
        [StringLength(100, ErrorMessage = "A especialidade deve ter no máximo 100 caracteres.")]
        public string Especialidade { get; set; } = string.Empty;

        [Required(ErrorMessage = "O telefone é obrigatório.")]
        [StringLength(20, ErrorMessage = "O telefone deve ter no máximo 20 caracteres.")]
        public string Telefone { get; set; } = string.Empty;

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress(ErrorMessage = "Informe um e-mail válido.")]
        [StringLength(150, ErrorMessage = "O e-mail deve ter no máximo 150 caracteres.")]
        public string Email { get; set; } = string.Empty;

        [StringLength(150, ErrorMessage = "A clínica deve ter no máximo 150 caracteres.")]
        public string Clinica { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "O turno deve ter no máximo 100 caracteres.")]
        public string TurnoAtendimento { get; set; } = string.Empty;

        [Range(0, 999999, ErrorMessage = "O valor da consulta deve ser válido.")]
        public decimal ValorConsulta { get; set; }

        public DateTime DataCadastro { get; set; } = DateTime.Now;

        public ICollection<Consulta>? Consultas { get; set; }
    }
}