namespace MeuCrud.Api.DTOs
{
    public class ProcedimentoRequest
    {
        public string Nome { get; set; } = string.Empty;
        public string? Codigo { get; set; }
        public decimal Valor { get; set; }
        public bool Ativo { get; set; } = true;
    }

    public class ProcedimentoResponse
    {
        public int Id { get; set; }

        public string Nome { get; set; } = string.Empty;

        public string? Codigo { get; set; }

        public decimal Valor { get; set; }

        public bool Ativo { get; set; }

        public bool PossuiAgendamentos { get; set; }

        public int TotalAgendamentosVinculados { get; set; }
    }
}