using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MeuCrud.Api.Models;

namespace MeuCrud.Api.Services;

public class TokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GerarToken(Usuario usuario)
    {
        var chave = _configuration["Jwt:Chave"]
            ?? throw new Exception("Chave JWT não configurada.");

        var emissor = _configuration["Jwt:Emissor"];
        var audiencia = _configuration["Jwt:Audiencia"];
        var expiracaoHoras = Convert.ToDouble(_configuration["Jwt:ExpiracaoHoras"] ?? "8");

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Nome),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Role, usuario.Perfil.ToString()),
            new Claim("perfil", usuario.Perfil.ToString())
        };

        var chaveBytes = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(chave));
        var credenciais = new SigningCredentials(chaveBytes, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: emissor,
            audience: audiencia,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiracaoHoras),
            signingCredentials: credenciais
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}