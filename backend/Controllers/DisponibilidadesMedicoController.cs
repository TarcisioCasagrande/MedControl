using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.DTOs;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/disponibilidades-medico")]
    public class DisponibilidadesMedicoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DisponibilidadesMedicoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<DisponibilidadeMedicoResponse>>> Listar()
        {
            var lista = await _context.DisponibilidadesMedico
                .Include(d => d.Medico)
                .OrderBy(d => d.DataInicio)
                .ThenBy(d => d.HoraInicio)
                .ToListAsync();

            return Ok(lista.Select(MapearResponse));
        }

        [HttpGet("medico/{medicoId:int}")]
        public async Task<ActionResult<List<DisponibilidadeMedicoResponse>>> ListarPorMedico(int medicoId)
        {
            var lista = await _context.DisponibilidadesMedico
                .Include(d => d.Medico)
                .Where(d => d.MedicoId == medicoId)
                .OrderBy(d => d.DataInicio)
                .ThenBy(d => d.HoraInicio)
                .ToListAsync();

            return Ok(lista.Select(MapearResponse));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<DisponibilidadeMedicoResponse>> BuscarPorId(int id)
        {
            var item = await _context.DisponibilidadesMedico
                .Include(d => d.Medico)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (item == null)
                return NotFound(new { mensagem = "Disponibilidade não encontrada." });

            return Ok(MapearResponse(item));
        }

        [HttpPost]
        public async Task<ActionResult<List<DisponibilidadeMedicoResponse>>> Criar([FromBody] CriarDisponibilidadeMedicoRequest request)
        {
            var validacao = await ValidarRequest(request);

            if (!validacao.Valido)
                return BadRequest(new { mensagem = validacao.Mensagem });

            var dataInicio = DateTime.Parse(request.DataInicio).Date;
            var dataFim = DateTime.Parse(request.DataFim).Date;
            var horaInicio = TimeSpan.Parse(request.HoraInicio);
            var horaFim = TimeSpan.Parse(request.HoraFim);
            var diasSemana = request.DiasSemana.Distinct().ToList();

            var criadas = new List<DisponibilidadeMedico>();

            for (var data = dataInicio; data <= dataFim; data = data.AddDays(1))
            {
                var diaSemana = (int)data.DayOfWeek;

                if (!diasSemana.Contains(diaSemana))
                    continue;

                var existe = await _context.DisponibilidadesMedico.AnyAsync(d =>
                    d.MedicoId == request.MedicoId &&
                    d.DataInicio.Date == data &&
                    d.HoraInicio == horaInicio &&
                    d.HoraFim == horaFim
                );

                if (existe)
                    continue;

                var disponibilidade = new DisponibilidadeMedico
                {
                    MedicoId = request.MedicoId,
                    DataInicio = data,
                    DataFim = data,
                    DiaSemana = diaSemana,
                    HoraInicio = horaInicio,
                    HoraFim = horaFim,
                    IntervaloMinutos = request.IntervaloMinutos,
                    Ativo = request.Ativo,
                    DataCadastro = DateTime.UtcNow
                };

                criadas.Add(disponibilidade);
                _context.DisponibilidadesMedico.Add(disponibilidade);
            }

            if (!criadas.Any())
            {
                return BadRequest(new
                {
                    mensagem = "Nenhuma disponibilidade foi criada. Verifique se já existem registros iguais."
                });
            }

            await _context.SaveChangesAsync();

            var ids = criadas.Select(d => d.Id).ToList();

            var retorno = await _context.DisponibilidadesMedico
                .Include(d => d.Medico)
                .Where(d => ids.Contains(d.Id))
                .ToListAsync();

            return Created("/api/disponibilidades-medico", retorno.Select(MapearResponse));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] CriarDisponibilidadeMedicoRequest request)
        {
            var item = await _context.DisponibilidadesMedico.FindAsync(id);

            if (item == null)
                return NotFound(new { mensagem = "Disponibilidade não encontrada." });

            var validacao = await ValidarRequest(request);

            if (!validacao.Valido)
                return BadRequest(new { mensagem = validacao.Mensagem });

            if (request.DiasSemana.Count != 1)
                return BadRequest(new { mensagem = "Na edição, selecione apenas um dia da semana." });

            item.MedicoId = request.MedicoId;
            item.DataInicio = DateTime.Parse(request.DataInicio).Date;
            item.DataFim = item.DataInicio;
            item.DiaSemana = request.DiasSemana.First();
            item.HoraInicio = TimeSpan.Parse(request.HoraInicio);
            item.HoraFim = TimeSpan.Parse(request.HoraFim);
            item.IntervaloMinutos = request.IntervaloMinutos;
            item.Ativo = request.Ativo;
            item.DataAtualizacao = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> AlterarStatus(int id)
        {
            var item = await _context.DisponibilidadesMedico.FindAsync(id);

            if (item == null)
                return NotFound(new { mensagem = "Disponibilidade não encontrada." });

            item.Ativo = !item.Ativo;
            item.DataAtualizacao = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(item);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var item = await _context.DisponibilidadesMedico
                .Include(d => d.Medico)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (item == null)
                return NotFound(new { mensagem = "Disponibilidade não encontrada." });

            var inicioDisponibilidade = item.DataInicio.Date.Add(item.HoraInicio);
            var fimDisponibilidade = item.DataInicio.Date.Add(item.HoraFim);

            var existeAgendamento = await _context.Agendamentos.AnyAsync(a =>
                a.MedicoId == item.MedicoId &&
                a.DataAgendamento >= inicioDisponibilidade &&
                a.DataAgendamento < fimDisponibilidade
            );

            if (existeAgendamento)
            {
                return Conflict(new
                {
                    mensagem = "Não é possível excluir esta disponibilidade porque já existe agendamento vinculado a este médico neste dia e horário. Exclua ou reagende o agendamento primeiro."
                });
            }

            _context.DisponibilidadesMedico.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<(bool Valido, string Mensagem)> ValidarRequest(CriarDisponibilidadeMedicoRequest request)
        {
            if (request.MedicoId <= 0)
                return (false, "Selecione um médico.");

            if (!await _context.Medicos.AnyAsync(m => m.Id == request.MedicoId))
                return (false, "Médico não encontrado.");

            if (request.DiasSemana == null || !request.DiasSemana.Any())
                return (false, "Selecione pelo menos um dia da semana.");

            if (request.DiasSemana.Any(d => d < 0 || d > 6))
                return (false, "Dia da semana inválido.");

            if (!DateTime.TryParse(request.DataInicio, out var dataInicio))
                return (false, "Data inicial inválida.");

            if (!DateTime.TryParse(request.DataFim, out var dataFim))
                return (false, "Data final inválida.");

            if (dataInicio.Date > dataFim.Date)
                return (false, "A data inicial não pode ser maior que a data final.");

            if (!TimeSpan.TryParse(request.HoraInicio, out var horaInicio))
                return (false, "Hora inicial inválida.");

            if (!TimeSpan.TryParse(request.HoraFim, out var horaFim))
                return (false, "Hora final inválida.");

            if (horaInicio >= horaFim)
                return (false, "A hora inicial precisa ser menor que a hora final.");

            if (request.IntervaloMinutos < 1 || request.IntervaloMinutos > 240)
                return (false, "O intervalo precisa estar entre 1 e 240 minutos.");

            return (true, string.Empty);
        }

        private static DisponibilidadeMedicoResponse MapearResponse(DisponibilidadeMedico d)
        {
            return new DisponibilidadeMedicoResponse
            {
                Id = d.Id,
                MedicoId = d.MedicoId,
                MedicoNome = d.Medico?.Nome ?? string.Empty,
                MedicoEspecialidade = d.Medico?.Especialidade ?? string.Empty,
                DataInicio = d.DataInicio,
                DataFim = d.DataFim,
                DiaSemana = d.DiaSemana,
                HoraInicio = d.HoraInicio.ToString(@"hh\:mm"),
                HoraFim = d.HoraFim.ToString(@"hh\:mm"),
                IntervaloMinutos = d.IntervaloMinutos,
                Ativo = d.Ativo
            };
        }
    }
}