using System;
using System.ComponentModel.DataAnnotations;

namespace MeuCrud.Api.Models
{
    public class Consulta
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "A data da consulta é obrigatória.")]
        public DateTime DataConsulta { get; set; }

        [Required(ErrorMessage = "O status da consulta é obrigatório.")]
        [StringLength(30)]
        public string Status { get; set; } = "Agendada";
        // Agendada, Pendente, EmAndamento, Finalizada, Cancelada

        [Required(ErrorMessage = "O motivo da consulta é obrigatório.")]
        [StringLength(300)]
        public string MotivoConsulta { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Observacoes { get; set; } = string.Empty;

        [Required(ErrorMessage = "O tipo de atendimento é obrigatório.")]
        [StringLength(50)]
        public string TipoAtendimento { get; set; } = "Presencial";

        [Range(0, 999999)]
        public decimal ValorCobrado { get; set; }

        public DateTime DataCadastro { get; set; } = DateTime.Now;

        public DateTime? DataInicioAtendimento { get; set; }

        public DateTime? DataFimAtendimento { get; set; }

        [Required]
        public int MedicoId { get; set; }
        public Medico? Medico { get; set; }

        [Required]
        public int PacienteId { get; set; }
        public Paciente? Paciente { get; set; }

        public Prontuario? Prontuario { get; set; }
    }
}