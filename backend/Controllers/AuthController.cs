using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeuCrud.Api.Data;
using MeuCrud.Api.DTOs;
using MeuCrud.Api.Models;
using MeuCrud.Api.Services;

namespace MeuCrud.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;

        public AuthController(AppDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginRespostaDto>> Login(LoginDto dto)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (usuario == null)
                return Unauthorized("E-mail ou senha inválidos.");

            if (!usuario.Ativo)
                return Unauthorized("Usuário inativo.");

            var senhaValida = BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash);

            if (!senhaValida)
                return Unauthorized("E-mail ou senha inválidos.");

            var token = _tokenService.GerarToken(usuario);

            return Ok(new LoginRespostaDto
            {
                Token = token,
                UsuarioId = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email,
                Perfil = usuario.Perfil.ToString()
            });
        }

        [HttpPost("criar-admin-inicial")]
        public async Task<IActionResult> CriarAdminInicial()
        {
            var existeAdmin = await _context.Usuarios
                .AnyAsync(u => u.Perfil == PerfilUsuario.Admin);

            if (existeAdmin)
                return BadRequest("Já existe um administrador cadastrado.");

            var usuario = new Usuario
            {
                Nome = "Administrador",
                Email = "admin@controlmed.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                Perfil = PerfilUsuario.Admin,
                Ativo = true,
                DataCriacao = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Administrador inicial criado com sucesso.",
                email = "admin@controlmed.com",
                senha = "123456"
            });
        }
    }
}