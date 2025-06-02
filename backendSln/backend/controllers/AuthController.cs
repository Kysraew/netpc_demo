using Microsoft.AspNetCore.Mvc;
using backend.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Identity;

namespace backend.Controllers
{

  [Route("api/[controller]")]
  public class AuthController : ControllerBase
  {

    private readonly UserManager<IdentityUser> _userManager;
    private readonly IConfiguration _configuration;


    public AuthController(UserManager<IdentityUser> userManager, IConfiguration configuration)
    {
      _userManager = userManager;
      _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLogin userLogin)
    {
      if (userLogin == null || string.IsNullOrEmpty(userLogin.Username) || string.IsNullOrEmpty(userLogin.Password))
      {
        return BadRequest("Username and password are required.");
      }

      var identityUser = await _userManager.FindByNameAsync(userLogin.Username);

      if (identityUser != null && await _userManager.CheckPasswordAsync(identityUser, userLogin.Password))
      {
        var token = await GenerateJwtToken(identityUser);
        return Ok(new { token });
      }
      return Unauthorized("Wrong username or password.");
    }


    private async Task<string> GenerateJwtToken(IdentityUser user)
    {
      var jwtSettings = _configuration.GetSection("Jwt");
      var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
      var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

      var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id), // Użyj user.Id jako subject
                new Claim(JwtRegisteredClaimNames.NameId, user.UserName), // Lub ClaimTypes.NameIdentifier
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

      var userRoles = await _userManager.GetRolesAsync(user);
      foreach (var role in userRoles)
      {
        claims.Add(new Claim(ClaimTypes.Role, role));
      }

      var tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(claims),
        Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["DurationInMinutes"])),
        Issuer = jwtSettings["Issuer"],
        Audience = jwtSettings["Audience"],
        SigningCredentials = credentials
      };

      var tokenHandler = new JwtSecurityTokenHandler();
      var token = tokenHandler.CreateToken(tokenDescriptor);

      return tokenHandler.WriteToken(token);
    }
  }
}