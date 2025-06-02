using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
  public class NetpcDbContext : DbContext
  {

    public NetpcDbContext(DbContextOptions<NetpcDbContext> options)
        : base(options) { }

  }
}