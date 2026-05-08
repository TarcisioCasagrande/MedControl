using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/prontuarios")]
    public class ProntuariosController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ProntuariosController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> Listar() => Ok(await Query().OrderByDescending(p => p.DataRegistro).ToListAsync());

        // Busca o prontuário vinculado a um agendamento específico.
        // Usado pela tela do médico para saber se deve criar ou editar o prontuário.
        [HttpGet("por-agendamento/{agendamentoId:int}")]
        public async Task<IActionResult> BuscarPorAgendamento(int agendamentoId)
        {
            var prontuario = await Query().FirstOrDefaultAsync(p => p.AgendamentoId == agendamentoId);
            return prontuario == null ? NotFound(new { mensagem = "Prontuário ainda não criado para este agendamento." }) : Ok(prontuario);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> BuscarPorId(int id)
        {
            var prontuario = await Query().FirstOrDefaultAsync(p => p.Id == id);
            return prontuario == null ? NotFound(new { mensagem = "Prontuário não encontrado." }) : Ok(prontuario);
        }

        [HttpPost]
        public async Task<IActionResult> Criar([FromBody] Prontuario prontuario)
        {
            var validacao = await Validar(prontuario);
            if (!validacao.Valido) return BadRequest(new { mensagem = validacao.Mensagem });
            if (await _context.Prontuarios.AnyAsync(p => p.AgendamentoId == prontuario.AgendamentoId)) return BadRequest(new { mensagem = "Este agendamento já possui prontuário." });
            prontuario.Id = 0;
            prontuario.DataRegistro = DateTime.UtcNow;
            if (string.IsNullOrWhiteSpace(prontuario.Receita)) prontuario.Receita = prontuario.Prescricao;
            if (string.IsNullOrWhiteSpace(prontuario.Prescricao)) prontuario.Prescricao = prontuario.Receita;
            _context.Prontuarios.Add(prontuario);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(BuscarPorId), new { id = prontuario.Id }, prontuario);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] Prontuario dados)
        {
            var prontuario = await _context.Prontuarios.FindAsync(id);
            if (prontuario == null) return NotFound(new { mensagem = "Prontuário não encontrado." });
            dados.Id = id;
            var validacao = await Validar(dados);
            if (!validacao.Valido) return BadRequest(new { mensagem = validacao.Mensagem });
            prontuario.AgendamentoId = dados.AgendamentoId;
            prontuario.QueixaPrincipal = dados.QueixaPrincipal;
            prontuario.HistoricoClinico = dados.HistoricoClinico;
            prontuario.Diagnostico = dados.Diagnostico;
            prontuario.Conduta = dados.Conduta;
            prontuario.Prescricao = string.IsNullOrWhiteSpace(dados.Prescricao) ? dados.Receita : dados.Prescricao;
            prontuario.Receita = string.IsNullOrWhiteSpace(dados.Receita) ? dados.Prescricao : dados.Receita;
            prontuario.ExamesSolicitados = dados.ExamesSolicitados;
            prontuario.Observacoes = dados.Observacoes;
            prontuario.DataAtualizacao = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var prontuario = await _context.Prontuarios.FindAsync(id);
            if (prontuario == null) return NotFound(new { mensagem = "Prontuário não encontrado." });
            _context.Prontuarios.Remove(prontuario);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private IQueryable<Prontuario> Query() => _context.Prontuarios.Include(p => p.Agendamento)!.ThenInclude(a => a!.Paciente).Include(p => p.Agendamento)!.ThenInclude(a => a!.Medico).Include(p => p.Agendamento)!.ThenInclude(a => a!.Procedimento);

        private async Task<(bool Valido, string Mensagem)> Validar(Prontuario p)
        {
            if (p.AgendamentoId <= 0) return (false, "Informe o agendamento.");
            if (!await _context.Agendamentos.AnyAsync(a => a.Id == p.AgendamentoId)) return (false, "Agendamento não encontrado.");
            if (string.IsNullOrWhiteSpace(p.Diagnostico)) return (false, "Informe o diagnóstico.");
            return (true, string.Empty);
        }
    }
}
