using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.DTOs;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/usuarios")]
    [Authorize(Roles = "Admin")]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuariosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var usuarios = await _context.Usuarios
                .OrderBy(u => u.Nome)
                .Select(u => new
                {
                    u.Id,
                    u.Nome,
                    u.Email,
                    Perfil = u.Perfil.ToString(),
                    u.Ativo,
                    u.DataCriacao,
                    MedicoId = _context.Medicos
                        .Where(m => m.UsuarioId == u.Id)
                        .Select(m => (int?)m.Id)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(usuarios);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> BuscarPorId(int id)
        {
            var usuario = await _context.Usuarios
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.Nome,
                    u.Email,
                    Perfil = u.Perfil.ToString(),
                    u.Ativo,
                    u.DataCriacao,
                    MedicoId = _context.Medicos
                        .Where(m => m.UsuarioId == u.Id)
                        .Select(m => (int?)m.Id)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (usuario == null)
                return NotFound(new { mensagem = "Usuário não encontrado." });

            return Ok(usuario);
        }

        [HttpPost]
        public async Task<IActionResult> Criar([FromBody] CriarUsuarioDto dto)
        {
            var validacao = await ValidarUsuario(dto.Nome, dto.Email, dto.Senha, dto.Perfil, dto.MedicoId, null);

            if (!validacao.Valido)
                return BadRequest(new { mensagem = validacao.Mensagem });

            var usuario = new Usuario
            {
                Nome = dto.Nome.Trim(),
                Email = dto.Email.Trim(),
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
                Perfil = dto.Perfil,
                Ativo = true,
                DataCriacao = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            if (dto.Perfil == PerfilUsuario.Medico && dto.MedicoId.HasValue)
            {
                var medico = await _context.Medicos.FindAsync(dto.MedicoId.Value);

                if (medico != null)
                {
                    medico.UsuarioId = usuario.Id;
                    await _context.SaveChangesAsync();
                }
            }

            return CreatedAtAction(nameof(BuscarPorId), new { id = usuario.Id }, new
            {
                usuario.Id,
                usuario.Nome,
                usuario.Email,
                Perfil = usuario.Perfil.ToString(),
                usuario.Ativo,
                usuario.DataCriacao,
                dto.MedicoId
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarUsuarioDto dto)
        {
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
                return NotFound(new { mensagem = "Usuário não encontrado." });

            var validacao = await ValidarUsuario(dto.Nome, dto.Email, dto.Senha, dto.Perfil, dto.MedicoId, id);

            if (!validacao.Valido)
                return BadRequest(new { mensagem = validacao.Mensagem });

            var medicoJaVinculado = await _context.Medicos
                .FirstOrDefaultAsync(m => m.UsuarioId == id);

            if (medicoJaVinculado != null)
            {
                if (dto.Perfil != PerfilUsuario.Medico)
                {
                    return BadRequest(new
                    {
                        mensagem = "Este usuário já está vinculado a um médico e não pode ter o perfil alterado."
                    });
                }

                if (dto.MedicoId.HasValue && dto.MedicoId.Value != medicoJaVinculado.Id)
                {
                    return BadRequest(new
                    {
                        mensagem = "O vínculo com o médico não pode ser alterado após o cadastro."
                    });
                }
            }

            usuario.Nome = dto.Nome.Trim();
            usuario.Email = dto.Email.Trim();
            usuario.Perfil = dto.Perfil;
            usuario.Ativo = dto.Ativo;
            usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha);

            if (usuario.Perfil == PerfilUsuario.Medico && dto.MedicoId.HasValue && medicoJaVinculado == null)
            {
                var medico = await _context.Medicos.FindAsync(dto.MedicoId.Value);

                if (medico != null)
                {
                    medico.UsuarioId = usuario.Id;
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> AlterarStatus(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
                return NotFound(new { mensagem = "Usuário não encontrado." });

            usuario.Ativo = !usuario.Ativo;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                usuario.Id,
                usuario.Ativo
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
                return NotFound(new { mensagem = "Usuário não encontrado." });

            var medicoVinculado = await _context.Medicos
                .FirstOrDefaultAsync(m => m.UsuarioId == id);

            if (medicoVinculado != null)
            {
                var possuiAgendamentos = await _context.Agendamentos
                    .AnyAsync(a => a.MedicoId == medicoVinculado.Id);

                if (possuiAgendamentos)
                {
                    return BadRequest(new
                    {
                        mensagem = "Não é possível excluir este usuário porque o médico possui agendamentos vinculados. Inative o usuário."
                    });
                }

                medicoVinculado.UsuarioId = null;
            }

            var possuiAgendamentosCriados = await _context.Agendamentos
                .AnyAsync(a => a.CriadoPorUsuarioId == id);

            if (possuiAgendamentosCriados)
            {
                return BadRequest(new
                {
                    mensagem = "Não é possível excluir este usuário porque ele possui agendamentos criados. Inative o usuário."
                });
            }

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<(bool Valido, string Mensagem)> ValidarUsuario(
            string nome,
            string email,
            string senha,
            PerfilUsuario perfil,
            int? medicoId,
            int? usuarioIdAtual)
        {
            if (string.IsNullOrWhiteSpace(nome))
                return (false, "Informe o nome do usuário.");

            if (string.IsNullOrWhiteSpace(email))
                return (false, "Informe o e-mail do usuário.");

            if (string.IsNullOrWhiteSpace(senha))
                return (false, "Informe a senha do usuário.");

            if (senha.Length < 6)
                return (false, "A senha precisa ter pelo menos 6 caracteres.");

            var emailExiste = await _context.Usuarios.AnyAsync(u =>
                u.Email.ToLower() == email.ToLower() &&
                (!usuarioIdAtual.HasValue || u.Id != usuarioIdAtual.Value));

            if (emailExiste)
                return (false, "Já existe um usuário com este e-mail.");

            if (perfil == PerfilUsuario.Medico)
            {
                if (!medicoId.HasValue || medicoId.Value <= 0)
                    return (false, "Selecione o médico que será vinculado ao usuário.");

                var medico = await _context.Medicos.FindAsync(medicoId.Value);

                if (medico == null)
                    return (false, "Médico não encontrado.");

                if (medico.UsuarioId.HasValue &&
                    (!usuarioIdAtual.HasValue || medico.UsuarioId.Value != usuarioIdAtual.Value))
                {
                    return (false, "Este médico já está vinculado a outro usuário.");
                }
            }

            return (true, string.Empty);
        }
    }
}