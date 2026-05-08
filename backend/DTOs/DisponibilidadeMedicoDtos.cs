namespace MeuCrud.Api.DTOs
{
    public class CriarDisponibilidadeMedicoRequest
    {
        public int MedicoId { get; set; }
        public List<int> DiasSemana { get; set; } = new();
        public string HoraInicio { get; set; } = string.Empty;
        public string HoraFim { get; set; } = string.Empty;
        public int IntervaloMinutos { get; set; } = 30;
        public string DataInicio { get; set; } = string.Empty;
        public string DataFim { get; set; } = string.Empty;
        public bool Ativo { get; set; } = true;
    }

    public class DisponibilidadeMedicoResponse
    {
        public int Id { get; set; }
        public int MedicoId { get; set; }
        public string MedicoNome { get; set; } = string.Empty;
        public string MedicoEspecialidade { get; set; } = string.Empty;
        public DateTime DataInicio { get; set; }
        public DateTime DataFim { get; set; }
        public int DiaSemana { get; set; }
        public string HoraInicio { get; set; } = string.Empty;
        public string HoraFim { get; set; } = string.Empty;
        public int IntervaloMinutos { get; set; }
        public bool Ativo { get; set; }
    }
}
