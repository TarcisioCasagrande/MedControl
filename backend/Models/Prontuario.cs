using System;
using System.ComponentModel.DataAnnotations;

namespace MeuCrud.Api.Models
{
    public class Prontuario
    {
        public int Id { get; set; }

        [StringLength(500, ErrorMessage = "A queixa principal deve ter no máximo 500 caracteres.")]
        public string QueixaPrincipal { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "O histórico clínico deve ter no máximo 1000 caracteres.")]
        public string HistoricoClinico { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "O diagnóstico deve ter no máximo 1000 caracteres.")]
        public string Diagnostico { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "A conduta deve ter no máximo 1000 caracteres.")]
        public string Conduta { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "A prescrição deve ter no máximo 1000 caracteres.")]
        public string Prescricao { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Os exames solicitados devem ter no máximo 1000 caracteres.")]
        public string ExamesSolicitados { get; set; } = string.Empty;

        [StringLength(1500, ErrorMessage = "As observações devem ter no máximo 1500 caracteres.")]
        public string Observacoes { get; set; } = string.Empty;

        public DateTime DataRegistro { get; set; } = DateTime.Now;

        [Required(ErrorMessage = "A consulta é obrigatória.")]
        public int ConsultaId { get; set; }

        public Consulta? Consulta { get; set; }
    }
}