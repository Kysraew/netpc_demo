using System.ComponentModel;
using System.Resources;
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
  public class UserLogin
  {
    public required string Username { get; set; }
    public required string Password { get; set; }
  }
}