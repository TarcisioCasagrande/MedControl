using Microsoft.AspNetCore.Mvc;
using MeuCrud.Api.Services;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssistenteIaController : ControllerBase
    {
        private readonly AssistenteIaService _assistenteIaService;

        public AssistenteIaController(AssistenteIaService assistenteIaService)
        {
            _assistenteIaService = assistenteIaService;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] AssistenteIaRequest request)
        {
            if ((request == null || string.IsNullOrWhiteSpace(request.Pergunta)) && !request!.PacienteId.HasValue)
            {
                return BadRequest(new
                {
                    mensagem = "A pergunta é obrigatória."
                });
            }

            try
            {
                var resultado = await _assistenteIaService.GerarResumoPaciente(
                    request.Pergunta ?? string.Empty,
                    request.PacienteId
                );

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensagem = "Erro ao processar a solicitação da IA.",
                    detalhe = ex.Message
                });
            }
        }
    }

    public class AssistenteIaRequest
    {
        public string? Pergunta { get; set; }
        public int? PacienteId { get; set; }
    }
}